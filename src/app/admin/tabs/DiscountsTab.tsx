'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Loader2, X, Percent, Check, AlertCircle, Download } from 'lucide-react';
import AdminConfirmationModal from '../components/AdminConfirmationModal';
import { exportToCsv } from '../utils/exportToCsv';

export interface DiscountCode {
  id: string;
  code: string;
  discount_percent: number;
  valid_until: string | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
}

interface DiscountsTabProps {
  discountCodes: DiscountCode[];
  deletingId?: string | null;
  handleDelete?: (id: string) => Promise<void>;
  handleSubmit?: (e: React.FormEvent<HTMLFormElement>, editItem: DiscountCode | null) => Promise<void>;
  loading?: boolean;
  errorMsg?: string;
  setErrorMsg?: (msg: string) => void;
}

export default function DiscountsTab({
  discountCodes,
  deletingId = null,
  handleDelete,
  handleSubmit,
  loading = false,
  errorMsg = '',
  setErrorMsg = () => {}
}: DiscountsTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<DiscountCode | null>(null);

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

  const requestDelete = (id: string, code: string) => {
    if (!handleDelete) return;
    setConfirmModal({
      isOpen: true,
      title: 'Delete Discount Code',
      message: `Are you sure you want to permanently delete coupon code "${code}"? Customers will no longer be able to use it during checkout.`,
      action: async () => {
        setIsModalLoading(true);
        await handleDelete(id);
        setIsModalLoading(false);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Code', 'Discount Percent', 'Usage Count', 'Usage Limit', 'Valid Until', 'Status', 'Created At'];
    const rows = discountCodes.map(c => [
      c.id,
      c.code,
      `${c.discount_percent}%`,
      c.usage_count,
      c.usage_limit || 'Unlimited',
      c.valid_until || 'No expiry',
      c.is_active ? 'Active' : 'Inactive',
      c.created_at
    ]);
    exportToCsv('beautylooks_discounts', headers, rows);
  };

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (handleSubmit) {
      await handleSubmit(e, editItem);
      if (!errorMsg) {
        setIsAddOpen(false);
        setEditItem(null);
      }
    }
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
          <h2 className="text-2xl font-bold font-display">Discount Codes</h2>
          <p className="text-sm text-[#8A8177]">Manage promo codes and coupons.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2 bg-white border border-[#EFECE6] hover:bg-stone-50 rounded-xl text-xs font-semibold text-[#1C1917] flex items-center gap-2 shadow-2xs transition-colors"
          >
            <Download size={14} />
            <span>Export CSV ({discountCodes.length})</span>
          </button>
          <button
            onClick={() => {
              setEditItem(null);
              setErrorMsg('');
              setIsAddOpen(true);
            }}
            className="px-4 py-2 bg-[#CA8A04] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#1C1917] transition-all flex items-center space-x-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span>Add Code</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#EFECE6] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#FBF9F6] border-b border-[#EFECE6] text-[10px] font-bold uppercase tracking-widest text-[#8C8885]">
                <th className="p-4 pl-6">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Usage</th>
                <th className="p-4">Valid Until</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6]">
              {discountCodes.map(c => (
                <tr key={c.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-stone-100 rounded-lg text-stone-600"><Percent size={14} /></div>
                      <span className="font-semibold text-sm font-display tracking-wide uppercase">{c.code}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium">{c.discount_percent}% OFF</td>
                  <td className="p-4">
                    <div className="text-xs text-stone-600 flex flex-col">
                      <span>{c.usage_count} uses</span>
                      {c.usage_limit && <span className="text-[10px] text-stone-400 font-medium">Limit: {c.usage_limit}</span>}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-stone-600 font-medium">
                    {c.valid_until ? new Date(c.valid_until).toLocaleDateString('en-IN') : 'No expiry'}
                  </td>
                  <td className="p-4">
                    {c.is_active ? (
                      <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                        <Check size={10} /> <span>Active</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase">
                        <AlertCircle size={10} /> <span>Inactive</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setErrorMsg('');
                          setEditItem(c);
                          setIsAddOpen(true);
                        }}
                        className="p-1.5 border border-[#EFECE6] hover:border-[#CA8A04] hover:text-[#CA8A04] rounded-lg transition-colors bg-white"
                        title="Edit Code"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => requestDelete(c.id, c.code)}
                        className="p-1.5 border border-red-100 hover:border-red-600 hover:text-red-600 text-red-400 rounded-lg transition-colors bg-white"
                        title="Delete Code"
                      >
                        {deletingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {discountCodes.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-[#8C8885]">
                    No discount codes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(isAddOpen || editItem) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFECE6] w-[calc(100%-2rem)] max-w-md rounded-2xl shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh] animate-fade-in">
            <div className="p-6 border-b border-[#EFECE6] flex justify-between items-center bg-[#FBF9F6]">
              <h3 className="font-display font-semibold text-lg text-[#1C1917]">
                {editItem ? 'Edit Discount Code' : 'Add Discount Code'}
              </h3>
              <button onClick={() => { setIsAddOpen(false); setEditItem(null); setErrorMsg(''); }} className="text-[#8C8885] hover:text-[#1C1917] p-1.5 rounded-full hover:bg-[#EFECE6]/50">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={onFormSubmit} className="p-6 space-y-4 overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center space-x-2">
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C554D] mb-1">Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  required
                  defaultValue={editItem?.code || ''}
                  placeholder="e.g. SUMMER20"
                  className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C554D] mb-1">Discount Percentage *</label>
                <div className="relative">
                  <input
                    type="number"
                    name="discount_percent"
                    required
                    min="1"
                    max="100"
                    defaultValue={editItem?.discount_percent || ''}
                    placeholder="20"
                    className="w-full text-sm py-2 pl-3 pr-8 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#8C8885] font-bold">%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C554D] mb-1">Usage Limit</label>
                  <input
                    type="number"
                    name="usage_limit"
                    min="1"
                    defaultValue={editItem?.usage_limit || ''}
                    placeholder="Unlimited"
                    className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5C554D] mb-1">Expiry Date</label>
                  <input
                    type="date"
                    name="valid_until"
                    defaultValue={editItem?.valid_until ? editItem.valid_until.split('T')[0] : ''}
                    className="w-full text-sm py-2 px-3 border border-[#EFECE6] rounded-xl focus:border-[#CA8A04] outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    defaultChecked={editItem ? editItem.is_active : true}
                    className="rounded border-[#EFECE6] text-[#CA8A04] focus:ring-[#CA8A04]"
                  />
                  <span className="text-xs font-semibold text-[#1C1917]">Is Active & Redeemable</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#EFECE6]">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setEditItem(null); setErrorMsg(''); }}
                  className="px-4 py-2 border border-[#EFECE6] rounded-xl text-xs font-semibold text-[#5C554D] hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#CA8A04] hover:bg-[#1C1917] text-white px-6 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  <span>{editItem ? 'Update Code' : 'Create Code'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
