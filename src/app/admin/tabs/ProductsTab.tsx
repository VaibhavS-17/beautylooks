'use client';

import React, { useState } from 'react';
import { Search, Plus, Image as ImageIcon, Edit, Trash2, Loader2, X } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import MultiMediaUploader from '@/components/admin/MultiMediaUploader';

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  skinType: 'all' | 'oily' | 'dry' | 'combination' | 'sensitive';
  images: string[];
  brandId: string | null;
  categoryId: string | null;
  brand: string;
  category: string;
  faqs: Array<{ question: string; answer: string }>;
}

interface CategoryItem {
  id: string;
  name: string;
}

interface BrandItem {
  id: string;
  name: string;
}

interface ProductsTabProps {
  products: AdminProduct[];
  categories: CategoryItem[];
  brands: BrandItem[];
  deletingProductId: string | null;
  handleDeleteProduct: (id: string) => Promise<void>;
  handleProductSubmit: (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => Promise<void>;
  loading: boolean;
}

export default function ProductsTab({
  products,
  categories,
  brands,
  deletingProductId,
  handleDeleteProduct,
  handleProductSubmit,
  loading
}: ProductsTabProps) {
  const [productSearch, setProductSearch] = useState('');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editProductItem, setEditProductItem] = useState<AdminProduct | null>(null);
  const [productMediaUrls, setProductMediaUrls] = useState<string[]>([]);
  const [faqsList, setFaqsList] = useState<Array<{ question: string; answer: string }>>([]);
  const fallbackProductImage = '/images/products/facial-kit-1.png';

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display">Products Catalog</h2>
          <p className="text-sm text-[#8A8177]">Manage product details, multi-image galleries, and stock.</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8177]" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-[#EFECE6] rounded-xl text-xs focus:outline-none focus:border-[#CA8A04] bg-white w-64 shadow-sm"
            />
          </div>
          <button
            onClick={() => {
              setProductMediaUrls([]);
              setFaqsList([]);
              setIsAddProductOpen(true);
            }}
            className="px-4 py-2 bg-[#CA8A04] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#1C1917] transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#FBF9F6] border-b border-[#EFECE6] uppercase font-bold text-[#8A8177] tracking-wider">
              <th className="p-4">Item Details</th>
              <th className="p-4">Media</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EFECE6]">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#8C8885]">No products match search criteria.</td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-[#FBF9F6]/50">
                  <td className="p-4 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#FBF9F6] border border-[#EFECE6] rounded-xl overflow-hidden relative shrink-0 flex items-center justify-center">
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={16} className="text-[#8C8885]" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold block text-sm">{product.name}</span>
                      <span className="text-[10px] text-[#8C8885] uppercase tracking-wider block">{product.brand} · {product.category}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-[#FBF9F6] border border-[#EFECE6] text-[10px] font-bold text-[#5C554D] flex items-center gap-1 w-max">
                      <ImageIcon size={12} /> {product.images?.length || 0} Files
                    </span>
                  </td>
                  <td className="p-4">
                    {product.salePrice ? (
                      <div className="flex flex-col">
                        <span className="text-[#CA8A04] font-bold text-xs">Sale: {formatPrice(product.salePrice)}</span>
                        <span className="text-[10px] text-[#8C8885] font-light">Reg: {formatPrice(product.price)}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span className="text-[#1C1917] font-semibold text-xs">{formatPrice(product.price)}</span>
                        <span className="text-[10px] text-[#8C8885] font-light">No Sale</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      product.stockQuantity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {product.stockQuantity} Left
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase ${product.isActive ? 'text-emerald-600' : 'text-[#8C8885]'}`}>
                      {product.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setProductMediaUrls(product.images || []);
                        setFaqsList(product.faqs || []);
                        setEditProductItem(product);
                      }}
                      className="p-1.5 border border-[#EFECE6] hover:border-[#CA8A04] hover:text-[#CA8A04] rounded-lg transition-colors inline-block bg-white"
                      title="Edit Product"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-1.5 border border-red-100 hover:border-red-660 hover:text-red-660 text-red-400 rounded-lg transition-colors inline-block bg-white"
                      title="Delete Product"
                    >
                      {deletingProductId === product.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD PRODUCT MODAL */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] animate-fade-in">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <div>
                <h3 className="font-display font-semibold text-lg text-[#1C1917]">Add New Catalog Product</h3>
                <p className="text-[10px] text-[#8C8885] uppercase tracking-wider mt-0.5">Upload product images/videos and enter inventory details</p>
              </div>
              <button onClick={() => setIsAddProductOpen(false)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              await handleProductSubmit(e, false);
              setIsAddProductOpen(false);
            }} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <MultiMediaUploader
                    label="Product Images & Videos"
                    folder="products"
                    currentValues={productMediaUrls}
                    onChange={setProductMediaUrls}
                    maxFiles={8}
                    acceptVideo={true}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Product Name *</label>
                    <input type="text" name="name" required placeholder="e.g. Oxylife Face Facial Kit" className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Price (₹) *</label>
                      <input type="number" name="price" required min="0" placeholder="1200" className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Sale Price (₹)</label>
                      <input type="number" name="salePrice" min="0" placeholder="999" className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Category</label>
                      <select name="categoryId" className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none bg-white">
                        <option value="">No Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Brand</label>
                      <select name="brandId" className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none bg-white">
                        <option value="">No Brand</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Skin Type</label>
                      <select name="skinType" className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none bg-white">
                        <option value="all">All Skin Types</option>
                        <option value="oily">Oily</option>
                        <option value="dry">Dry</option>
                        <option value="combination">Combination</option>
                        <option value="sensitive">Sensitive</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Stock Count</label>
                      <input type="number" name="stockQuantity" defaultValue="15" min="0" className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Short Tagline</label>
                    <input type="text" name="shortDescription" placeholder="Brief summary of benefits" className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Full Description *</label>
                    <textarea name="description" required rows={3} placeholder="Full product details..." className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
                  </div>

                  <div className="flex items-center space-x-6 pt-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" name="isFeatured" value="true" id="isFeaturedAdd" defaultChecked className="rounded border-border text-[#CA8A04] focus:ring-[#CA8A04]" />
                      <label htmlFor="isFeaturedAdd" className="text-xs text-[#5C554D] cursor-pointer select-none">Featured Product</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" name="isActive" value="true" id="isActiveAdd" defaultChecked className="rounded border-border text-[#CA8A04] focus:ring-[#CA8A04]" />
                      <label htmlFor="isActiveAdd" className="text-xs text-[#5C554D] cursor-pointer select-none">Active & Visible</label>
                    </div>
                  </div>

                  {/* FAQ Repeater */}
                  <div className="space-y-3 pt-4 border-t border-[#EFECE6]">
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                      <span>💡 <strong>Storewide Common FAQs Fallback:</strong> If left blank, this product automatically displays the storewide Common FAQs configured in the <strong>Common FAQs</strong> sidebar tab.</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D]">Product FAQs (Optional)</label>
                      <button
                        type="button"
                        onClick={() => setFaqsList([...faqsList, { question: '', answer: '' }])}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#CA8A04] hover:text-[#1C1917] transition-colors flex items-center gap-1"
                      >
                        <Plus size={12} /> Add FAQ
                      </button>
                    </div>
                    {faqsList.map((faq, idx) => (
                      <div key={idx} className="p-3 bg-[#FBF9F6] border border-[#EFECE6] rounded-xl space-y-2 relative">
                        <input
                          type="text"
                          placeholder="Question (e.g. How often should I use this?)"
                          value={faq.question}
                          onChange={(e) => {
                            const updated = [...faqsList];
                            updated[idx] = { ...updated[idx], question: e.target.value };
                            setFaqsList(updated);
                          }}
                          className="w-full text-xs py-2 px-3 border border-[#EFECE6] rounded-lg focus:border-[#CA8A04] outline-none bg-white"
                        />
                        <textarea
                          placeholder="Answer..."
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => {
                            const updated = [...faqsList];
                            updated[idx] = { ...updated[idx], answer: e.target.value };
                            setFaqsList(updated);
                          }}
                          className="w-full text-xs py-2 px-3 border border-[#EFECE6] rounded-lg focus:border-[#CA8A04] outline-none bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setFaqsList(faqsList.filter((_, i) => i !== idx))}
                          className="text-red-500 text-[10px] font-bold uppercase tracking-wider hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <input type="hidden" name="faqs" value={JSON.stringify(faqsList.filter(f => f.question.trim() && f.answer.trim()))} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6]">
                <button type="button" onClick={() => setIsAddProductOpen(false)} className="px-5 py-2.5 border border-[#EFECE6] rounded-xl text-xs font-semibold hover:bg-[#FBF9F6]">Cancel</button>
                <button type="submit" disabled={loading} className="bg-[#CA8A04] hover:bg-[#1C1917] text-white px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-all">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editProductItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] animate-fade-in">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <div>
                <h3 className="font-display font-semibold text-lg text-[#1C1917]">Edit Product Details</h3>
                <p className="text-[10px] text-[#8C8885] uppercase tracking-wider mt-0.5">Modify properties of {editProductItem.name}</p>
              </div>
              <button onClick={() => setEditProductItem(null)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              await handleProductSubmit(e, true);
              setEditProductItem(null);
            }} className="flex-1 overflow-y-auto p-6 space-y-6">
              <input type="hidden" name="id" value={editProductItem.id} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <MultiMediaUploader
                    label="Product Images & Videos"
                    folder="products"
                    currentValues={productMediaUrls}
                    onChange={setProductMediaUrls}
                    maxFiles={8}
                    acceptVideo={true}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col">
                    <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Product Name *</label>
                    <input type="text" name="name" defaultValue={editProductItem.name} required className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Price (₹) *</label>
                      <input type="number" name="price" defaultValue={editProductItem.price} required min="0" className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Sale Price (₹)</label>
                      <input type="number" name="salePrice" defaultValue={editProductItem.salePrice || ''} min="0" className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Category</label>
                      <select name="categoryId" defaultValue={editProductItem.categoryId || ''} className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none bg-white">
                        <option value="">No Category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Brand</label>
                      <select name="brandId" defaultValue={editProductItem.brandId || ''} className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none bg-white">
                        <option value="">No Brand</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Skin Type</label>
                      <select name="skinType" defaultValue={editProductItem.skinType} className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none bg-white">
                        <option value="all">All Skin Types</option>
                        <option value="oily">Oily</option>
                        <option value="dry">Dry</option>
                        <option value="combination">Combination</option>
                        <option value="sensitive">Sensitive</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Stock Count</label>
                      <input type="number" name="stockQuantity" defaultValue={editProductItem.stockQuantity} min="0" className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Short Tagline</label>
                    <input type="text" name="shortDescription" defaultValue={editProductItem.shortDescription || ''} className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Full Description *</label>
                    <textarea name="description" defaultValue={editProductItem.description} required rows={3} className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
                  </div>

                  <div className="flex items-center space-x-6 pt-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" name="isFeatured" value="true" id="isFeaturedEdit" defaultChecked={editProductItem.isFeatured} className="rounded border-border text-[#CA8A04] focus:ring-[#CA8A04]" />
                      <label htmlFor="isFeaturedEdit" className="text-xs text-[#5C554D] cursor-pointer select-none">Featured Product</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" name="isActive" value="true" id="isActiveEdit" defaultChecked={editProductItem.isActive} className="rounded border-border text-[#CA8A04] focus:ring-[#CA8A04]" />
                      <label htmlFor="isActiveEdit" className="text-xs text-[#5C554D] cursor-pointer select-none">Active & Visible</label>
                    </div>
                  </div>

                  {/* FAQ Repeater */}
                  <div className="space-y-3 pt-4 border-t border-[#EFECE6]">
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                      <span>💡 <strong>Storewide Common FAQs Fallback:</strong> If left blank, this product automatically displays the storewide Common FAQs configured in the <strong>Common FAQs</strong> sidebar tab.</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D]">Product FAQs (Optional)</label>
                      <button
                        type="button"
                        onClick={() => setFaqsList([...faqsList, { question: '', answer: '' }])}
                        className="text-[10px] font-bold uppercase tracking-wider text-[#CA8A04] hover:text-[#1C1917] transition-colors flex items-center gap-1"
                      >
                        <Plus size={12} /> Add FAQ
                      </button>
                    </div>
                    {faqsList.map((faq, idx) => (
                      <div key={idx} className="p-3 bg-[#FBF9F6] border border-[#EFECE6] rounded-xl space-y-2 relative">
                        <input
                          type="text"
                          placeholder="Question (e.g. How often should I use this?)"
                          value={faq.question}
                          onChange={(e) => {
                            const updated = [...faqsList];
                            updated[idx] = { ...updated[idx], question: e.target.value };
                            setFaqsList(updated);
                          }}
                          className="w-full text-xs py-2 px-3 border border-[#EFECE6] rounded-lg focus:border-[#CA8A04] outline-none bg-white"
                        />
                        <textarea
                          placeholder="Answer..."
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => {
                            const updated = [...faqsList];
                            updated[idx] = { ...updated[idx], answer: e.target.value };
                            setFaqsList(updated);
                          }}
                          className="w-full text-xs py-2 px-3 border border-[#EFECE6] rounded-lg focus:border-[#CA8A04] outline-none bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setFaqsList(faqsList.filter((_, i) => i !== idx))}
                          className="text-red-500 text-[10px] font-bold uppercase tracking-wider hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <input type="hidden" name="faqs" value={JSON.stringify(faqsList.filter(f => f.question.trim() && f.answer.trim()))} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6]">
                <button type="button" onClick={() => setEditProductItem(null)} className="px-5 py-2.5 border border-[#EFECE6] rounded-xl text-xs font-semibold hover:bg-[#FBF9F6]">Cancel</button>
                <button type="submit" disabled={loading} className="bg-[#CA8A04] hover:bg-[#1C1917] text-white px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-all">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
