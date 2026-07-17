'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Image as ImageIcon, Edit, Trash2, Loader2, X, Download } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';
import AdminConfirmationModal from '../components/AdminConfirmationModal';
import { exportToCsv } from '../utils/exportToCsv';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface CategoriesTabProps {
  categories: CategoryItem[];
  deletingCategoryId: string | null;
  handleDeleteCategory: (id: string) => Promise<void>;
  handleCategorySubmit: (e: React.FormEvent<HTMLFormElement>, isEdit: boolean) => Promise<void>;
  loading: boolean;
}

export default function CategoriesTab({
  categories,
  deletingCategoryId,
  handleDeleteCategory,
  handleCategorySubmit,
  loading
}: CategoriesTabProps) {
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editCategoryItem, setEditCategoryItem] = useState<CategoryItem | null>(null);
  const [uploadedCategoryImg, setUploadedCategoryImg] = useState('');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });
  const [isModalLoading, setIsModalLoading] = useState(false);

  const requestDeleteCategory = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to permanently delete category "${name}"? Products under this category will become uncategorized.`,
      action: async () => {
        setIsModalLoading(true);
        await handleDeleteCategory(id);
        setIsModalLoading(false);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleExportCsv = () => {
    const headers = ['Category ID', 'Name', 'Slug', 'Description', 'Image URL'];
    const rows = categories.map(c => [
      c.id,
      c.name,
      c.slug,
      c.description || '',
      c.image_url || ''
    ]);
    exportToCsv('beautylooks_categories', headers, rows);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <AdminConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDanger={true}
        isLoading={isModalLoading}
        onConfirm={confirmModal.action}
        onClose={() => !isModalLoading && setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold font-display">Categories Management</h2>
          <p className="text-sm text-[#8A8177]">Control core departments & category image tiles.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 bg-white border border-[#EFECE6] hover:bg-stone-50 rounded-xl text-xs font-semibold text-[#1C1917] flex items-center gap-2 shadow-2xs transition-colors"
          >
            <Download size={14} />
            <span>Export CSV ({categories.length})</span>
          </button>
          <button
            onClick={() => {
              setUploadedCategoryImg('');
              setIsAddCategoryOpen(true);
            }}
            className="px-4 py-2 bg-[#CA8A04] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#1C1917] transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(c => (
          <div key={c.id} className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
            <div className="h-36 bg-[#FBF9F6] relative overflow-hidden flex items-center justify-center">
              {c.image_url ? (
                <Image src={c.image_url} alt={c.name} fill sizes="200px" className="object-cover" />
              ) : (
                <ImageIcon size={24} className="text-[#8C8885]" />
              )}
            </div>
            <div className="p-4 space-y-2">
              <h4 className="font-display font-semibold text-base">{c.name}</h4>
              <p className="text-xs text-[#8C8885] line-clamp-2 font-light leading-relaxed">{c.description || 'No description added yet.'}</p>
              <div className="flex justify-between items-center pt-2 border-t border-[#FBF9F6]">
                <span className="text-[10px] font-medium tracking-wide text-[#8A8177]">URL Link: /{c.name.toLowerCase().replace(/\s+/g, '-')}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setUploadedCategoryImg(c.image_url || '');
                      setEditCategoryItem(c);
                    }}
                    className="p-1.5 border border-[#EFECE6] hover:border-[#CA8A04] hover:text-[#CA8A04] rounded-lg transition-colors bg-white"
                    title="Edit Category"
                  >
                    <Edit size={12} />
                  </button>
                  <button
                    onClick={() => requestDeleteCategory(c.id, c.name)}
                    className="p-1.5 border border-red-100 hover:border-red-650 hover:text-red-650 text-red-400 rounded-lg transition-colors bg-white"
                    title="Delete Category"
                  >
                    {deletingCategoryId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD CATEGORY MODAL */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-[calc(100%-2rem)] max-w-md rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <h3 className="font-display font-semibold text-lg text-[#1C1917]">Add Department Category</h3>
              <button onClick={() => setIsAddCategoryOpen(false)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={async (e) => {
              await handleCategorySubmit(e, false);
              setIsAddCategoryOpen(false);
            }} className="p-6 space-y-4">
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Category Name *</label>
                <input type="text" name="name" required placeholder="e.g. Hair Cleansers" className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Description</label>
                <textarea name="description" rows={3} placeholder="Brief department description tagline..." className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
              </div>
              <div>
                <ImageUploader
                  label="Category Cover Banner"
                  folder="categories"
                  currentValue={uploadedCategoryImg}
                  onChange={setUploadedCategoryImg}
                />
                <input type="hidden" name="imageUrl" value={uploadedCategoryImg} />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6]">
                <button type="button" onClick={() => setIsAddCategoryOpen(false)} className="px-4 py-2 border border-[#EFECE6] rounded-xl text-xs font-semibold">Cancel</button>
                <button type="submit" disabled={loading} className="bg-[#CA8A04] hover:bg-[#1C1917] text-white px-6 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editCategoryItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-[calc(100%-2rem)] max-w-md rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <h3 className="font-display font-semibold text-lg text-[#1C1917]">Edit Category Details</h3>
              <button onClick={() => setEditCategoryItem(null)} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={async (e) => {
              await handleCategorySubmit(e, true);
              setEditCategoryItem(null);
            }} className="p-6 space-y-4">
              <input type="hidden" name="id" value={editCategoryItem.id} />
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Category Name *</label>
                <input type="text" name="name" defaultValue={editCategoryItem.name} required className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-semibold text-[#5C554D] mb-1">Description</label>
                <textarea name="description" defaultValue={editCategoryItem.description || ''} rows={3} className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none" />
              </div>
              <div>
                <ImageUploader
                  label="Category Cover Banner"
                  folder="categories"
                  currentValue={uploadedCategoryImg}
                  onChange={setUploadedCategoryImg}
                />
                <input type="hidden" name="imageUrl" value={uploadedCategoryImg} />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6]">
                <button type="button" onClick={() => setEditCategoryItem(null)} className="px-4 py-2 border border-[#EFECE6] rounded-xl text-xs font-semibold">Cancel</button>
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
