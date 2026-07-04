'use client';

import React, { useState } from 'react';
import { Plus, Award, Edit, Trash2, Loader2, X } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface BrandsTabProps {
  brands: BrandItem[];
  deletingBrandId: string | null;
  handleDeleteBrand: (id: string) => Promise<void>;
  handleBrandSubmit: (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => Promise<void>;
  loading: boolean;
}

export default function BrandsTab({
  brands,
  deletingBrandId,
  handleDeleteBrand,
  handleBrandSubmit,
  loading
}: BrandsTabProps) {
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [editBrandItem, setEditBrandItem] = useState<BrandItem | null>(null);
  const [uploadedBrandLogo, setUploadedBrandLogo] = useState('');

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-display">Brands Portfolio</h2>
          <p className="text-sm text-[#8A8177]">Control brand logo representations.</p>
        </div>
        <button
          onClick={() => {
            setUploadedBrandLogo('');
            setIsAddBrandOpen(true);
          }}
          className="px-4 py-2 bg-[#CA8A04] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#1C1917] transition-all flex items-center space-x-1.5 shadow-sm"
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

      {/* ADD BRAND MODAL */}
      {isAddBrandOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col animate-fade-in">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <h3 className="font-display font-semibold text-lg text-[#1C1917]">Add Premium Brand</h3>
              <button onClick={() => setIsAddBrandOpen(false)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={async (e) => {
              await handleBrandSubmit(e, false);
              setIsAddBrandOpen(false);
            }} className="p-6 space-y-4">
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Brand Name *</label>
                <input type="text" name="name" required placeholder="e.g. Floractive" className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
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
                <button type="submit" disabled={loading} className="bg-[#CA8A04] hover:bg-[#1C1917] text-white px-6 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all">
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
          <div className="bg-white border border-[#EFECE6] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col animate-fade-in">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <h3 className="font-display font-semibold text-lg text-[#1C1917]">Edit Brand Details</h3>
              <button onClick={() => setEditBrandItem(null)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={async (e) => {
              await handleBrandSubmit(e, true);
              setEditBrandItem(null);
            }} className="p-6 space-y-4">
              <input type="hidden" name="id" value={editBrandItem.id} />
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Brand Name *</label>
                <input type="text" name="name" defaultValue={editBrandItem.name} required className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
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
                <button type="submit" disabled={loading} className="bg-[#CA8A04] hover:bg-[#1C1917] text-white px-6 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all">
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
