'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, ShoppingBag, Package, Tag, Award, FileText, Settings,
  Plus, Edit, Trash2, Loader2, Check, X, Search, Image as ImageIcon,
  ArrowUpRight, RefreshCw, Globe, ChevronRight, Eye
} from 'lucide-react';
import { formatPrice } from '@/lib/data';
import ImageUploader from '@/components/admin/ImageUploader';
import { 
  createProduct, updateProduct, deleteProductAdmin,
  createBrand, updateBrand, deleteBrand,
  createCategory, updateCategory, deleteCategory,
  createBlog, updateBlog, deleteBlog,
  updateSiteSettings, updateOrderStatusAdmin, syncMockData
} from '@/app/actions/adminActions';

// Type definitions
interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  is_published: boolean;
  published_at: string | null;
}

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
}

interface AdminClientProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    grossRevenue: number;
    activeCustomers: number;
  };
  recentOrders: AdminOrder[];
  categories: CategoryItem[];
  brands: BrandItem[];
  products: AdminProduct[];
  blogPosts: BlogItem[];
  siteSettings: {
    hero_title: string;
    hero_subtitle: string;
    hero_description: string;
    hero_image_url: string;
    hero_button_text: string;
    hero_button_link: string;
  };
}

type TabType = 'dashboard' | 'orders' | 'products' | 'categories' | 'brands' | 'blogs' | 'settings';

export default function AdminClient({ 
  stats, recentOrders, categories, brands, products, blogPosts, siteSettings 
}: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search filter states
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [blogSearch, setBlogSearch] = useState('');

  // Active items for edit modals
  const [editProductItem, setEditProductItem] = useState<AdminProduct | null>(null);
  const [editBrandItem, setEditBrandItem] = useState<BrandItem | null>(null);
  const [editCategoryItem, setEditCategoryItem] = useState<CategoryItem | null>(null);
  const [editBlogItem, setEditBlogItem] = useState<BlogItem | null>(null);

  // New item flags
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddBlogOpen, setIsAddBlogOpen] = useState(false);

  // Image Upload states
  const [uploadedProductImg, setUploadedProductImg] = useState('');
  const [uploadedBrandLogo, setUploadedBrandLogo] = useState('');
  const [uploadedCategoryImg, setUploadedCategoryImg] = useState('');
  const [uploadedBlogImg, setUploadedBlogImg] = useState('');
  const [uploadedHeroImg, setUploadedHeroImg] = useState(siteSettings.hero_image_url);

  // Action loaders
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);

  const triggerToast = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Status handler
  const handleOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    const res = await updateOrderStatusAdmin(orderId, status);
    setUpdatingOrderId(null);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast('Order status updated!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Product Delete
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    setDeletingProductId(id);
    const res = await deleteProductAdmin(id);
    setDeletingProductId(null);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast('Product deleted!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Brand Delete
  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Delete this brand?')) return;
    setDeletingBrandId(id);
    const res = await deleteBrand(id);
    setDeletingBrandId(null);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast('Brand deleted!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Category Delete
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    setDeletingCategoryId(id);
    const res = await deleteCategory(id);
    setDeletingCategoryId(null);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast('Category deleted!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Blog Delete
  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    setDeletingBlogId(id);
    const res = await deleteBlog(id);
    setDeletingBlogId(null);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast('Blog post deleted!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Product CRUD Submits
  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit = false) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Add uploaded image to form data if set
    if (uploadedProductImg) {
      formData.set('image', uploadedProductImg);
    }

    const res = isEdit ? await updateProduct(formData) : await createProduct(formData);
    setLoading(false);
    
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast(isEdit ? 'Product updated!' : 'Product added!');
      setIsAddProductOpen(false);
      setEditProductItem(null);
      setUploadedProductImg('');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Brand CRUD Submits
  const handleBrandSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit = false) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (uploadedBrandLogo) {
      formData.set('logoUrl', uploadedBrandLogo);
    }
    const res = isEdit ? await updateBrand(formData) : await createBrand(formData);
    setLoading(false);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast(isEdit ? 'Brand updated!' : 'Brand added!');
      setIsAddBrandOpen(false);
      setEditBrandItem(null);
      setUploadedBrandLogo('');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Category CRUD Submits
  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit = false) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (uploadedCategoryImg) {
      formData.set('imageUrl', uploadedCategoryImg);
    }
    const res = isEdit ? await updateCategory(formData) : await createCategory(formData);
    setLoading(false);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast(isEdit ? 'Category updated!' : 'Category added!');
      setIsAddCategoryOpen(false);
      setEditCategoryItem(null);
      setUploadedCategoryImg('');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Blog CRUD Submits
  const handleBlogSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit = false) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (uploadedBlogImg) {
      formData.set('coverImage', uploadedBlogImg);
    }
    const res = isEdit ? await updateBlog(formData) : await createBlog(formData);
    setLoading(false);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast(isEdit ? 'Blog post updated!' : 'Blog post created!');
      setIsAddBlogOpen(false);
      setEditBlogItem(null);
      setUploadedBlogImg('');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Settings Submit
  const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('heroImageUrl', uploadedHeroImg);
    const res = await updateSiteSettings(formData);
    setLoading(false);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast('Hero Settings updated successfully!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Seeder
  const handleSyncData = async () => {
    if (!confirm('Load mock categories & brands configuration?')) return;
    setSyncing(true);
    const res = await syncMockData();
    setSyncing(false);
    if (res.error) alert(res.error);
    else {
      alert('Mock data seeded!');
      window.location.reload();
    }
  };

  // Filters
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = recentOrders.filter(o => 
    o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.id.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredBlogs = blogPosts.filter(b => 
    b.title.toLowerCase().includes(blogSearch.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-primary-dark text-text-main flex font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-brand-dark text-white flex flex-col justify-between shrink-0 border-r border-neutral-800 select-none">
        <div>
          <div className="p-6 border-b border-neutral-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shrink-0 shadow-sm border border-stone-200 overflow-hidden">
              <img
                src="/images/brand/logo.png"
                alt="Beauty Looks Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h1 className="font-display font-semibold text-sm tracking-wide text-white">Beauty Looks</h1>
              <p className="text-[9px] text-accent tracking-widest uppercase font-semibold">Console Control</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-left ${
                activeTab === 'dashboard' ? 'bg-accent text-white' : 'text-[#8C8885] hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-left ${
                activeTab === 'orders' ? 'bg-accent text-white' : 'text-[#8C8885] hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <ShoppingBag size={16} />
              <span>Orders ({recentOrders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-left ${
                activeTab === 'products' ? 'bg-accent text-white' : 'text-[#8C8885] hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Package size={16} />
              <span>Products ({products.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-left ${
                activeTab === 'categories' ? 'bg-accent text-white' : 'text-[#8C8885] hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Tag size={16} />
              <span>Categories ({categories.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-left ${
                activeTab === 'brands' ? 'bg-accent text-white' : 'text-[#8C8885] hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Award size={16} />
              <span>Brands ({brands.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-left ${
                activeTab === 'blogs' ? 'bg-accent text-white' : 'text-[#8C8885] hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <FileText size={16} />
              <span>Journal Blogs ({blogPosts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors text-left ${
                activeTab === 'settings' ? 'bg-accent text-white' : 'text-[#8C8885] hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <Settings size={16} />
              <span>Hero Controls</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-neutral-800 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between p-3 bg-neutral-850 rounded-xl hover:bg-neutral-800 transition-colors text-xs font-semibold text-white"
          >
            <span className="flex items-center space-x-2">
              <Globe size={14} />
              <span>Public Store</span>
            </span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 min-h-screen overflow-y-auto p-8 relative flex flex-col justify-between">
        <div>
          {/* Top toast alerts */}
          {error && (
            <div className="fixed top-6 right-6 z-50 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-xl animate-slide-up flex items-center space-x-2">
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="fixed top-6 right-6 z-50 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl shadow-xl animate-slide-up flex items-center space-x-2">
              <Check size={16} className="text-green-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in text-left">
              <div>
                <h2 className="text-2xl font-bold font-display">Dashboard Overview</h2>
                <p className="text-sm text-[#8A8177] font-light">Real-time metrics, configuration helpers, and statistics.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Gross Revenue', value: formatPrice(stats.grossRevenue), desc: 'Excludes cancellations', color: 'bg-emerald-50 text-emerald-700' },
                  { label: 'Total Orders', value: stats.totalOrders.toString(), desc: 'Lifetime sales', color: 'bg-blue-50 text-blue-700' },
                  { label: 'Total Products', value: stats.totalProducts.toString(), desc: 'Active in catalog', color: 'bg-amber-50 text-amber-700' },
                  { label: 'Active Customers', value: stats.activeCustomers.toString(), desc: 'Registered customers', color: 'bg-purple-50 text-purple-700' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-[#EFECE6] shadow-sm flex flex-col justify-between h-36">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#8A8177]">{stat.label}</span>
                    <span className="text-3xl font-bold font-display">{stat.value}</span>
                    <span className="text-xs text-[#8C8885] font-light">{stat.desc}</span>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold font-display">Orders Portal</h2>
                  <p className="text-sm text-[#8A8177] font-light">Monitor client transactions and fulfillments.</p>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8177]" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-[#EFECE6] rounded-xl text-xs focus:outline-none focus:border-[#CA8A04] bg-white w-64"
                  />
                </div>
              </div>

              <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#FBF9F6] border-b border-[#EFECE6] uppercase font-bold text-[#8A8177] tracking-wider">
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE6]">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#8C8885]">No orders match your filters.</td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-[#FBF9F6]/30">
                          <td className="p-4 font-mono font-bold">#{order.id.slice(0, 8)}</td>
                          <td className="p-4">
                            <span className="font-semibold block">{order.customerName}</span>
                            <span className="text-[10px] text-[#8C8885] font-light block">{order.customerEmail}</span>
                          </td>
                          <td className="p-4 font-bold text-[#CA8A04]">{formatPrice(order.amount)}</td>
                          <td className="p-4">
                            {updatingOrderId === order.id ? (
                              <Loader2 size={12} className="animate-spin text-[#CA8A04]" />
                            ) : (
                              <select
                                value={order.status}
                                onChange={e => handleOrderStatus(order.id, e.target.value)}
                                className="bg-[#FBF9F6] border border-[#EFECE6] py-1 px-2.5 rounded-lg text-xs font-semibold text-[#1C1917] outline-none"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            )}
                          </td>
                          <td className="p-4 text-[#8C8885]">{order.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold font-display">Products Catalog</h2>
                  <p className="text-sm text-[#8A8177] font-light">Add, edit, or delete items inside the cosmetic registry.</p>
                </div>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8177]" />
                    <input
                      type="text"
                      placeholder="Search catalog..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-[#EFECE6] rounded-xl text-xs focus:outline-none focus:border-[#CA8A04] bg-white w-64"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setUploadedProductImg('');
                      setIsAddProductOpen(true);
                    }}
                    className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-brand-dark transition-all flex items-center space-x-1.5 shadow-sm"
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
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE6]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#8C8885]">No products match search criteria.</td>
                      </tr>
                    ) : (
                      filteredProducts.map(product => (
                        <tr key={product.id} className="hover:bg-[#FBF9F6]/30">
                          <td className="p-4 flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#FBF9F6] border border-[#EFECE6] rounded-lg overflow-hidden relative shrink-0 flex items-center justify-center">
                              {product.images[0] ? (
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
                          <td className="p-4 font-bold">
                            {product.salePrice ? (
                              <div className="flex flex-col">
                                <span className="text-[#CA8A04]">{formatPrice(product.salePrice)}</span>
                                <span className="text-[10px] line-through text-[#8C8885] font-light">{formatPrice(product.price)}</span>
                              </div>
                            ) : (
                              formatPrice(product.price)
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              product.stockQuantity > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}>
                              {product.stockQuantity} Left
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[10px] font-bold uppercase ${product.isActive ? 'text-green-600' : 'text-neutral-450'}`}>
                              {product.isActive ? 'Active' : 'Draft'}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setUploadedProductImg(product.images[0] || '');
                                setEditProductItem(product);
                              }}
                              className="p-1.5 border border-[#EFECE6] hover:border-[#CA8A04] hover:text-[#CA8A04] rounded-lg transition-colors inline-block"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-1.5 border border-red-100 hover:border-red-600 hover:text-red-600 text-red-400 rounded-lg transition-colors inline-block"
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
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold font-display">Categories Management</h2>
                  <p className="text-sm text-[#8A8177] font-light">Control core departments & category image tiles.</p>
                </div>
                <button
                  onClick={() => {
                    setUploadedCategoryImg('');
                    setIsAddCategoryOpen(true);
                  }}
                  className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-brand-dark transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(c => (
                  <div key={c.id} className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="h-32 bg-[#FBF9F6] relative overflow-hidden flex items-center justify-center">
                      {c.image_url ? (
                        <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={24} className="text-[#8C8885]" />
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-display font-semibold text-base">{c.name}</h4>
                      <p className="text-xs text-[#8C8885] line-clamp-2 font-light leading-relaxed">{c.description || 'No description added yet.'}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-[#FBF9F6]">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#8A8177]">Slug: {c.slug}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setUploadedCategoryImg(c.image_url || '');
                              setEditCategoryItem(c);
                            }}
                            className="p-1 border border-[#EFECE6] hover:border-[#CA8A04] hover:text-[#CA8A04] rounded-lg transition-colors"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-1 border border-red-100 hover:border-red-650 hover:text-red-650 text-red-400 rounded-lg transition-colors"
                          >
                            {deletingCategoryId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BRANDS TAB */}
          {activeTab === 'brands' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold font-display">Brands Portfolio</h2>
                  <p className="text-sm text-[#8A8177] font-light">Control brand logo representations.</p>
                </div>
                <button
                  onClick={() => {
                    setUploadedBrandLogo('');
                    setIsAddBrandOpen(true);
                  }}
                  className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-brand-dark transition-all flex items-center space-x-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add Brand</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {brands.map(b => (
                  <div key={b.id} className="bg-white border border-[#EFECE6] p-4 rounded-2xl shadow-sm flex flex-col justify-between items-center text-center space-y-4">
                    <div className="w-16 h-16 bg-[#FBF9F6] rounded-full border border-[#EFECE6] overflow-hidden flex items-center justify-center relative shrink-0">
                      {b.logo_url ? (
                        <img src={b.logo_url} alt={b.name} className="w-full h-full object-cover scale-110" />
                      ) : (
                        <Award size={24} className="text-[#8C8885]" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-sm">{b.name}</h4>
                      <span className="text-[9px] uppercase tracking-wider text-[#8A8177] block mt-0.5">/{b.slug}</span>
                    </div>
                    <div className="flex space-x-2 pt-2 border-t border-[#FBF9F6] w-full justify-center">
                      <button
                        onClick={() => {
                          setUploadedBrandLogo(b.logo_url || '');
                          setEditBrandItem(b);
                        }}
                        className="p-1 border border-[#EFECE6] hover:border-[#CA8A04] hover:text-[#CA8A04] rounded-lg transition-colors"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteBrand(b.id)}
                        className="p-1 border border-red-100 hover:border-red-650 hover:text-red-650 text-red-400 rounded-lg transition-colors"
                      >
                        {deletingBrandId === b.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BLOGS TAB */}
          {activeTab === 'blogs' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold font-display">Journal Blogs</h2>
                  <p className="text-sm text-[#8A8177] font-light">Create and edit educational guides and skincare journals.</p>
                </div>
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8177]" />
                    <input
                      type="text"
                      placeholder="Search blogs..."
                      value={blogSearch}
                      onChange={e => setBlogSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-[#EFECE6] rounded-xl text-xs focus:outline-none focus:border-[#CA8A04] bg-white w-64"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setUploadedBlogImg('');
                      setIsAddBlogOpen(true);
                    }}
                    className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-brand-dark transition-all flex items-center space-x-1.5 shadow-sm"
                  >
                    <Plus size={14} />
                    <span>Create Post</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#FBF9F6] border-b border-[#EFECE6] uppercase font-bold text-[#8A8177] tracking-wider">
                      <th className="p-4">Title & Info</th>
                      <th className="p-4">Excerpt</th>
                      <th className="p-4">Publish Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE6]">
                    {filteredBlogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[#8C8885]">No blog posts found.</td>
                      </tr>
                    ) : (
                      filteredBlogs.map(blog => (
                        <tr key={blog.id} className="hover:bg-[#FBF9F6]/30">
                          <td className="p-4 flex items-center space-x-3 max-w-sm">
                            <div className="w-10 h-10 bg-[#FBF9F6] border border-[#EFECE6] rounded-lg overflow-hidden relative shrink-0 flex items-center justify-center">
                              {blog.cover_image ? (
                                <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon size={16} className="text-[#8C8885]" />
                              )}
                            </div>
                            <div>
                              <span className="font-semibold block truncate" title={blog.title}>{blog.title}</span>
                              <span className="text-[10px] text-[#8C8885] block font-light">slug: /{blog.slug}</span>
                            </div>
                          </td>
                          <td className="p-4 max-w-xs truncate text-[#8C8885]">{blog.excerpt || 'No description tagline.'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              blog.is_published ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {blog.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="p-4 text-[#8C8885]">{blog.published_at ? new Date(blog.published_at).toLocaleDateString() : 'N/A'}</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setUploadedBlogImg(blog.cover_image || '');
                                setEditBlogItem(blog);
                              }}
                              className="p-1.5 border border-[#EFECE6] hover:border-[#CA8A04] hover:text-[#CA8A04] rounded-lg transition-colors inline-block"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(blog.id)}
                              className="p-1.5 border border-red-100 hover:border-red-650 hover:text-red-650 text-red-400 rounded-lg transition-colors inline-block"
                            >
                              {deletingBlogId === blog.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in text-left">
              <div>
                <h2 className="text-2xl font-bold font-display">Hero Showcase Editor</h2>
                <p className="text-sm text-[#8A8177] font-light">Edit homepage banners, call-to-actions, and main visuals.</p>
              </div>

              <form onSubmit={handleSettingsSubmit} className="bg-white border border-[#EFECE6] p-6 sm:p-8 rounded-2xl shadow-sm space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="flex flex-col col-span-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Hero Title</label>
                    <input 
                      type="text" 
                      name="heroTitle" 
                      defaultValue={siteSettings.hero_title} 
                      required 
                      className="w-full input-dark text-sm py-2" 
                    />
                  </div>

                  <div className="flex flex-col col-span-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Hero Subtitle</label>
                    <input 
                      type="text" 
                      name="heroSubtitle" 
                      defaultValue={siteSettings.hero_subtitle} 
                      required 
                      className="w-full input-dark text-sm py-2" 
                    />
                  </div>

                  <div className="flex flex-col col-span-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Hero Tagline / Description</label>
                    <textarea 
                      name="heroDescription" 
                      defaultValue={siteSettings.hero_description} 
                      required 
                      rows={3} 
                      className="w-full input-dark text-sm py-2" 
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Button Call-To-Action Text</label>
                    <input 
                      type="text" 
                      name="heroButtonText" 
                      defaultValue={siteSettings.hero_button_text} 
                      required 
                      className="w-full input-dark text-sm py-2" 
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Button Target Link</label>
                    <input 
                      type="text" 
                      name="heroButtonLink" 
                      defaultValue={siteSettings.hero_button_link} 
                      required 
                      className="w-full input-dark text-sm py-2" 
                    />
                  </div>

                  <div className="col-span-2">
                    <ImageUploader
                      label="Hero Background Banner Image"
                      folder="hero"
                      currentValue={uploadedHeroImg}
                      onChange={setUploadedHeroImg}
                      required
                    />
                  </div>

                </div>

                <div className="flex justify-end pt-4 border-t border-[#EFECE6]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gold text-xs px-6 py-3 font-semibold uppercase tracking-wider shadow-sm flex items-center space-x-1.5"
                  >
                    {loading && <Loader2 size={12} className="animate-spin" />}
                    <span>{loading ? 'Saving Banners...' : 'Apply Showcase Banners'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <footer className="mt-16 text-center text-[10px] uppercase font-bold tracking-widest text-[#8A8177] select-none border-t border-[#EFECE6]/50 pt-4">
          Beauty Looks Mumbai · Core Engine Controls
        </footer>
      </main>

      {/* --------------------------------------------------------------------- */}
      {/* ADD PRODUCT MODAL */}
      {/* --------------------------------------------------------------------- */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <div>
                <h3 className="font-display font-semibold text-lg">Add Catalog Product</h3>
                <p className="text-[10px] text-[#8C8885] uppercase tracking-wider mt-0.5">Insert a new item to cosmetic inventory</p>
              </div>
              <button onClick={() => setIsAddProductOpen(false)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={e => handleProductSubmit(e, false)} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Product Name *</label>
                  <input type="text" name="name" required placeholder="e.g. Oxylife Face Facial Kit" className="w-full input-dark text-sm py-2" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Price (INR) *</label>
                  <input type="number" name="price" required min="0" placeholder="1200" className="w-full input-dark text-sm py-2" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Sale Price (INR, Optional)</label>
                  <input type="number" name="salePrice" min="0" placeholder="999" className="w-full input-dark text-sm py-2" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Category</label>
                  <select name="categoryId" className="w-full input-dark text-sm py-2">
                    <option value="">No Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Brand</label>
                  <select name="brandId" className="w-full input-dark text-sm py-2">
                    <option value="">No Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Skin Type Selection</label>
                  <select name="skinType" className="w-full input-dark text-sm py-2">
                    <option value="all">All Skin Types</option>
                    <option value="oily">Oily</option>
                    <option value="dry">Dry</option>
                    <option value="combination">Combination</option>
                    <option value="sensitive">Sensitive</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Stock Quantity</label>
                  <input type="number" name="stockQuantity" defaultValue="15" min="0" className="w-full input-dark text-sm py-2" />
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Short Tagline</label>
                  <input type="text" name="shortDescription" placeholder="Brief summary of benefits" className="w-full input-dark text-sm py-2" />
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Detailed Description *</label>
                  <textarea name="description" required rows={3} placeholder="Full product summary details..." className="w-full input-dark text-sm py-2" />
                </div>
                <div className="col-span-2">
                  <ImageUploader
                    label="Product Catalog Image"
                    folder="products"
                    currentValue={uploadedProductImg}
                    onChange={setUploadedProductImg}
                    required
                  />
                </div>
                <div className="flex items-center space-x-6 col-span-2 pt-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" name="isFeatured" value="true" id="isFeaturedAdd" defaultChecked className="rounded border-border text-[#CA8A04] focus:ring-[#CA8A04]" />
                    <label htmlFor="isFeaturedAdd" className="text-xs text-[#5C554D] cursor-pointer select-none">Feature on Home</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" name="isActive" value="true" id="isActiveAdd" defaultChecked className="rounded border-border text-[#CA8A04] focus:ring-[#CA8A04]" />
                    <label htmlFor="isActiveAdd" className="text-xs text-[#5C554D] cursor-pointer select-none">Active & Visible</label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6] mt-6">
                <button type="button" onClick={() => setIsAddProductOpen(false)} className="px-4 py-2 border border-[#EFECE6] rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="btn-gold px-6 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* EDIT PRODUCT MODAL */}
      {/* --------------------------------------------------------------------- */}
      {editProductItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <div>
                <h3 className="font-display font-semibold text-lg">Edit Product Details</h3>
                <p className="text-[10px] text-[#8C8885] uppercase tracking-wider mt-0.5">Modify properties of {editProductItem.name}</p>
              </div>
              <button onClick={() => setEditProductItem(null)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={e => handleProductSubmit(e, true)} className="flex-1 overflow-y-auto p-6 space-y-4">
              <input type="hidden" name="id" value={editProductItem.id} />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Product Name *</label>
                  <input type="text" name="name" defaultValue={editProductItem.name} required className="w-full input-dark text-sm py-2" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Price (INR) *</label>
                  <input type="number" name="price" defaultValue={editProductItem.price} required min="0" className="w-full input-dark text-sm py-2" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Sale Price (INR, Optional)</label>
                  <input type="number" name="salePrice" defaultValue={editProductItem.salePrice || ''} min="0" className="w-full input-dark text-sm py-2" />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Category</label>
                  <select name="categoryId" defaultValue={editProductItem.categoryId || ''} className="w-full input-dark text-sm py-2">
                    <option value="">No Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Brand</label>
                  <select name="brandId" defaultValue={editProductItem.brandId || ''} className="w-full input-dark text-sm py-2">
                    <option value="">No Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Skin Type Selection</label>
                  <select name="skinType" defaultValue={editProductItem.skinType} className="w-full input-dark text-sm py-2">
                    <option value="all">All Skin Types</option>
                    <option value="oily">Oily</option>
                    <option value="dry">Dry</option>
                    <option value="combination">Combination</option>
                    <option value="sensitive">Sensitive</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Stock Quantity</label>
                  <input type="number" name="stockQuantity" defaultValue={editProductItem.stockQuantity} min="0" className="w-full input-dark text-sm py-2" />
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Short Tagline</label>
                  <input type="text" name="shortDescription" defaultValue={editProductItem.shortDescription || ''} className="w-full input-dark text-sm py-2" />
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Detailed Description *</label>
                  <textarea name="description" defaultValue={editProductItem.description} required rows={3} className="w-full input-dark text-sm py-2" />
                </div>
                <div className="col-span-2">
                  <ImageUploader
                    label="Product Catalog Image"
                    folder="products"
                    currentValue={uploadedProductImg}
                    onChange={setUploadedProductImg}
                    required
                  />
                </div>
                <div className="flex items-center space-x-6 col-span-2 pt-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" name="isFeatured" value="true" id="isFeaturedEdit" defaultChecked={editProductItem.isFeatured} className="rounded border-border text-[#CA8A04] focus:ring-[#CA8A04]" />
                    <label htmlFor="isFeaturedEdit" className="text-xs text-[#5C554D] cursor-pointer select-none">Feature on Home</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" name="isActive" value="true" id="isActiveEdit" defaultChecked={editProductItem.isActive} className="rounded border-border text-[#CA8A04] focus:ring-[#CA8A04]" />
                    <label htmlFor="isActiveEdit" className="text-xs text-[#5C554D] cursor-pointer select-none">Active & Visible</label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6] mt-6">
                <button type="button" onClick={() => setEditProductItem(null)} className="px-4 py-2 border border-[#EFECE6] rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="btn-gold px-6 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ADD/EDIT BRAND MODALS */}
      {/* --------------------------------------------------------------------- */}
      {isAddBrandOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <h3 className="font-display font-semibold text-lg">Add Premium Brand</h3>
              <button onClick={() => setIsAddBrandOpen(false)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={e => handleBrandSubmit(e, false)} className="p-6 space-y-4">
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Brand Name *</label>
                <input type="text" name="name" required placeholder="e.g. Floractive" className="w-full input-dark text-sm py-2" />
              </div>
              <div>
                <ImageUploader
                  label="Brand Logo"
                  folder="brands"
                  currentValue={uploadedBrandLogo}
                  onChange={setUploadedBrandLogo}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6]">
                <button type="button" onClick={() => setIsAddBrandOpen(false)} className="px-4 py-2 border border-[#EFECE6] rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="btn-gold px-6 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>Save Brand</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editBrandItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <h3 className="font-display font-semibold text-lg">Edit Brand Details</h3>
              <button onClick={() => setEditBrandItem(null)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={e => handleBrandSubmit(e, true)} className="p-6 space-y-4">
              <input type="hidden" name="id" value={editBrandItem.id} />
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Brand Name *</label>
                <input type="text" name="name" defaultValue={editBrandItem.name} required className="w-full input-dark text-sm py-2" />
              </div>
              <div>
                <ImageUploader
                  label="Brand Logo"
                  folder="brands"
                  currentValue={uploadedBrandLogo}
                  onChange={setUploadedBrandLogo}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6]">
                <button type="button" onClick={() => setEditBrandItem(null)} className="px-4 py-2 border border-[#EFECE6] rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="btn-gold px-6 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ADD/EDIT CATEGORY MODALS */}
      {/* --------------------------------------------------------------------- */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <h3 className="font-display font-semibold text-lg">Add Department Category</h3>
              <button onClick={() => setIsAddCategoryOpen(false)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={e => handleCategorySubmit(e, false)} className="p-6 space-y-4">
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Category Name *</label>
                <input type="text" name="name" required placeholder="e.g. Hair Cleansers" className="w-full input-dark text-sm py-2" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Description</label>
                <textarea name="description" rows={3} placeholder="Brief department description tagline..." className="w-full input-dark text-sm py-2" />
              </div>
              <div>
                <ImageUploader
                  label="Category Cover Banner"
                  folder="categories"
                  currentValue={uploadedCategoryImg}
                  onChange={setUploadedCategoryImg}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6]">
                <button type="button" onClick={() => setIsAddCategoryOpen(false)} className="px-4 py-2 border border-[#EFECE6] rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="btn-gold px-6 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editCategoryItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <h3 className="font-display font-semibold text-lg">Edit Category Details</h3>
              <button onClick={() => setEditCategoryItem(null)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={e => handleCategorySubmit(e, true)} className="p-6 space-y-4">
              <input type="hidden" name="id" value={editCategoryItem.id} />
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Category Name *</label>
                <input type="text" name="name" defaultValue={editCategoryItem.name} required className="w-full input-dark text-sm py-2" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Description</label>
                <textarea name="description" defaultValue={editCategoryItem.description || ''} rows={3} className="w-full input-dark text-sm py-2" />
              </div>
              <div>
                <ImageUploader
                  label="Category Cover Banner"
                  folder="categories"
                  currentValue={uploadedCategoryImg}
                  onChange={setUploadedCategoryImg}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6]">
                <button type="button" onClick={() => setEditCategoryItem(null)} className="px-4 py-2 border border-[#EFECE6] rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="btn-gold px-6 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ADD/EDIT BLOG MODALS */}
      {/* --------------------------------------------------------------------- */}
      {isAddBlogOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <h3 className="font-display font-semibold text-lg">Create Journal Post</h3>
              <button onClick={() => setIsAddBlogOpen(false)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={e => handleBlogSubmit(e, false)} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Post Title *</label>
                <input type="text" name="title" required placeholder="e.g. Skin Routine Guide" className="w-full input-dark text-sm py-2" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Brief Excerpt / Tagline</label>
                <input type="text" name="excerpt" placeholder="A single sentence summarized layout description..." className="w-full input-dark text-sm py-2" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Detailed Content *</label>
                <textarea name="content" required rows={8} placeholder="Write full HTML or Markdown layout body details..." className="w-full input-dark text-sm py-2" />
              </div>
              <div>
                <ImageUploader
                  label="Blog Thumbnail / Cover"
                  folder="blogs"
                  currentValue={uploadedBlogImg}
                  onChange={setUploadedBlogImg}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" name="isPublished" value="true" id="isPublishedAdd" className="rounded border-border text-[#CA8A04] focus:ring-[#CA8A04]" />
                <label htmlFor="isPublishedAdd" className="text-xs text-[#5C554D] cursor-pointer select-none">Publish Immediately</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6] mt-4">
                <button type="button" onClick={() => setIsAddBlogOpen(false)} className="px-4 py-2 border border-[#EFECE6] rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="btn-gold px-6 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>Save Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editBlogItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <h3 className="font-display font-semibold text-lg">Edit Journal Post</h3>
              <button onClick={() => setEditBlogItem(null)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={e => handleBlogSubmit(e, true)} className="flex-1 overflow-y-auto p-6 space-y-4">
              <input type="hidden" name="id" value={editBlogItem.id} />
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Post Title *</label>
                <input type="text" name="title" defaultValue={editBlogItem.title} required className="w-full input-dark text-sm py-2" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Brief Excerpt / Tagline</label>
                <input type="text" name="excerpt" defaultValue={editBlogItem.excerpt || ''} className="w-full input-dark text-sm py-2" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Detailed Content *</label>
                <textarea name="content" defaultValue={editBlogItem.content} required rows={8} className="w-full input-dark text-sm py-2" />
              </div>
              <div>
                <ImageUploader
                  label="Blog Thumbnail / Cover"
                  folder="blogs"
                  currentValue={uploadedBlogImg}
                  onChange={setUploadedBlogImg}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input type="checkbox" name="isPublished" value="true" id="isPublishedEdit" defaultChecked={editBlogItem.is_published} className="rounded border-border text-[#CA8A04] focus:ring-[#CA8A04]" />
                <label htmlFor="isPublishedEdit" className="text-xs text-[#5C554D] cursor-pointer select-none">Published</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6] mt-4">
                <button type="button" onClick={() => setEditBlogItem(null)} className="px-4 py-2 border border-[#EFECE6] rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="btn-gold px-6 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5">
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
