'use client';

import React, { useState } from 'react';
import { Shield, Loader2, Check, Lock, Eye, EyeOff } from 'lucide-react';
import { updatePassword } from '@/app/actions/accountActions';

export default function SecurityManager() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Client side validation
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    const res = await updatePassword(formData);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset(); // clear fields on success
      setTimeout(() => setSuccess(false), 5000);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 mt-12 animate-in slide-in-from-bottom-3 duration-500 delay-150 fill-mode-both">
      <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
        <h3 className="font-display text-xl font-semibold tracking-wide text-[#1A1A1A] flex items-center space-x-2">
          <Shield size={20} className="text-[#9A7B2F]" />
          <span>Security & Password</span>
          {success && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center"><Check size={12} className="mr-1"/> Updated</span>}
        </h3>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200 flex items-center space-x-2">
          <Check size={16} />
          <span>Password updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#FCFBF9] border border-[#EFECE6] rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col sm:col-span-2">
            <label className="text-[10px] font-semibold text-[#706A60] uppercase tracking-widest mb-2">Current Password *</label>
            <div className="relative">
              <input 
                type={showCurrent ? "text" : "password"}
                name="currentPassword" 
                required 
                className="w-full border border-[#EFECE6] bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9A7B2F] transition-colors shadow-sm pr-10" 
              />
              <button 
                type="button" 
                onClick={() => setShowCurrent(!showCurrent)} 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-[#706A60] uppercase tracking-widest mb-2">New Password *</label>
            <div className="relative">
              <input 
                type={showNew ? "text" : "password"}
                name="newPassword" 
                required 
                className="w-full border border-[#EFECE6] bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9A7B2F] transition-colors shadow-sm pr-10" 
              />
              <button 
                type="button" 
                onClick={() => setShowNew(!showNew)} 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <span className="text-[10px] text-gray-400 mt-1">Must be at least 8 characters.</span>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-semibold text-[#706A60] uppercase tracking-widest mb-2">Confirm New Password *</label>
            <div className="relative">
              <input 
                type={showConfirm ? "text" : "password"}
                name="confirmPassword" 
                required 
                className="w-full border border-[#EFECE6] bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9A7B2F] transition-colors shadow-sm pr-10" 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirm(!showConfirm)} 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-6 mt-4 border-t border-[#EFECE6]">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors flex items-center space-x-2 disabled:opacity-70"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            <Lock size={16} className={loading ? 'hidden' : 'block'} />
            <span>Update Password</span>
          </button>
        </div>
      </form>
    </div>
  );
}
