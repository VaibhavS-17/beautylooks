'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Loader2, X, Percent, Check, AlertCircle } from 'lucide-react';
import { createDiscountCode, updateDiscountCode, deleteDiscountCode } from '@/app/actions/adminDiscountActions';
import { useRouter } from 'next/navigation';

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
}

export default function DiscountsTab({ discountCodes }: DiscountsTabProps) {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<DiscountCode | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      code: formData.get('code') as string,
      discount_percent: Number(formData.get('discount_percent')),
      valid_until: formData.get('valid_until') ? (formData.get('valid_until') as string) : null,
      usage_limit: formData.get('usage_limit') ? Number(formData.get('usage_limit')) : null,
      is_active: formData.get('is_active') === 'on',
    };

    let res;
    if (editItem) {
      res = await updateDiscountCode(editItem.id, data);
    } else {
      res = await createDiscountCode(data);
    }

    setLoading(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setIsAddOpen(false);
      setEditItem(null);
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount code?')) return;
    setDeletingId(id);
    const res = await deleteDiscountCode(id);
    setDeletingId(null);
    if (res.error) {
      alert(res.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold font-display">Discount Codes</h2>
          <p className="text-sm text-[#8A8177]">Manage promo codes and coupons.</p>
        </div>
        <button
          onClick={() => {
            setEditItem(null);
            setIsAddOpen(true);
          }}
          className="px-4 py-2 bg-[#CA8A04] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#1C1917] transition-all flex items-center space-x-1.5 shadow-sm"
        >
          <Plus size={14} />
          <span>Add Code</span>
        </button>
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
                          setEditItem(c);
                          setIsAddOpen(true);
                        }}
                        className="p-1.5 border border-[#EFECE6] hover:border-[#CA8A04] hover:text-[#CA8A04] rounded-lg transition-colors bg-white"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 border border-red-100 hover:border-red-600 hover:text-red-600 text-red-400 rounded-lg transition-colors bg-white"
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
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-medium flex items-start space-x-2">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-xs text-[#5C554D] font-bold tracking-wide uppercase">Code</label>
                  <input
                    name="code"
                    required
                    defaultValue={editItem?.code || ''}
                    placeholder="e.g. SUMMER20"
                    className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#EFECE6] focus:border-[#CA8A04] focus:ring-1 focus:ring-[#CA8A04] rounded-xl outline-none text-sm transition-all uppercase"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs text-[#5C554D] font-bold tracking-wide uppercase">Discount Percent (%)</label>
                  <input
                    name="discount_percent"
                    type="number"
                    min="1"
                    max="100"
                    required
                    defaultValue={editItem?.discount_percent || 10}
                    className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#EFECE6] focus:border-[#CA8A04] focus:ring-1 focus:ring-[#CA8A04] rounded-xl outline-none text-sm transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#5C554D] font-bold tracking-wide uppercase">Valid Until</label>
                    <input
                      name="valid_until"
                      type="date"
                      defaultValue={editItem?.valid_until ? new Date(editItem.valid_until).toISOString().split('T')[0] : ''}
                      className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#EFECE6] focus:border-[#CA8A04] focus:ring-1 focus:ring-[#CA8A04] rounded-xl outline-none text-sm transition-all"
                    />
                    <p className="text-[10px] text-stone-500">Leave blank for no expiry</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs text-[#5C554D] font-bold tracking-wide uppercase">Usage Limit</label>
                    <input
                      name="usage_limit"
                      type="number"
                      min="1"
                      defaultValue={editItem?.usage_limit || ''}
                      placeholder="e.g. 100"
                      className="w-full px-4 py-3 bg-[#FBF9F6] border border-[#EFECE6] focus:border-[#CA8A04] focus:ring-1 focus:ring-[#CA8A04] rounded-xl outline-none text-sm transition-all"
                    />
                    <p className="text-[10px] text-stone-500">Leave blank for unlimited</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="is_active" defaultChecked={editItem ? editItem.is_active : true} className="sr-only peer" />
                    <div className="w-11 h-6 bg-[#EFECE6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#CA8A04]"></div>
                    <span className="ml-3 text-xs font-bold tracking-wide uppercase text-[#5C554D]">Is Active?</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-[#EFECE6]">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1C1917] hover:bg-black text-white px-6 py-3.5 rounded-xl font-semibold tracking-wide text-sm transition-all flex justify-center items-center h-[52px]"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : (editItem ? 'Save Changes' : 'Create Discount Code')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
