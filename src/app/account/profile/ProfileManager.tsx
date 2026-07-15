'use client';

import React, { useState } from 'react';
import { User, Mail, PhoneIcon, Calendar, Loader2, Edit2, X, Check } from 'lucide-react';
import { updateProfile } from '@/app/actions/accountActions';

interface ProfileManagerProps {
  userProfile: {
    fullName: string;
    email: string;
    phone: string;
    createdAt: string;
  };
}

export default function ProfileManager({ userProfile }: ProfileManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const res = await updateProfile(formData);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#EFECE6] pb-4">
        <h3 className="font-display text-xl font-semibold tracking-wide text-[#1A1A1A] flex items-center space-x-2">
          <span>Personal Information</span>
          {success && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center"><Check size={12} className="mr-1"/> Updated</span>}
        </h3>
        <button
          onClick={() => {
            setIsEditing(!isEditing);
            setError(null);
          }}
          className="shrink-0 text-sm font-medium text-[#9A7B2F] hover:text-[#C9A94E] flex items-center space-x-1 bg-[#C9A94E10] px-3 py-1.5 rounded-full transition-colors"
        >
          {isEditing ? (
            <>
              <X size={14} />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Edit2 size={14} />
              <span>Edit Details</span>
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-[#FCFBF9] border border-[#EFECE6] rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col">
              <label className="text-[10px] font-semibold text-[#706A60] uppercase tracking-widest mb-2">Full Name *</label>
              <input 
                type="text" 
                name="fullName" 
                defaultValue={userProfile.fullName} 
                required 
                className="border border-[#EFECE6] bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9A7B2F] transition-colors shadow-sm" 
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-[10px] font-semibold text-[#706A60] uppercase tracking-widest mb-2">Contact Phone</label>
              <input 
                type="tel" 
                name="phone" 
                defaultValue={userProfile.phone} 
                placeholder="e.g. 9876543210"
                className="border border-[#EFECE6] bg-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9A7B2F] transition-colors shadow-sm" 
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-semibold text-[#706A60] uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                value={userProfile.email} 
                disabled 
                className="border border-[#EFECE6] bg-gray-50 text-gray-500 rounded-xl px-4 py-3 text-sm cursor-not-allowed shadow-sm" 
              />
              <span className="text-[10px] text-gray-400 mt-1">Email cannot be changed directly.</span>
            </div>
          </div>
          
          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors flex items-center space-x-2 disabled:opacity-70"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-2xl p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#C9A94E30] flex items-center justify-center text-[#9A7B2F] group-hover:scale-110 transition-transform">
                <User size={20} />
              </div>
              <div>
                <span className="block text-xs text-[#706A60] uppercase tracking-wider font-semibold">Full Name</span>
                <span className="text-[#1A1A1A] font-medium text-lg mt-0.5 block">{userProfile.fullName}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-2xl p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#C9A94E30] flex items-center justify-center text-[#9A7B2F] group-hover:scale-110 transition-transform">
                <Mail size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs text-[#706A60] uppercase tracking-wider font-semibold">Email Address</span>
                <span className="text-[#1A1A1A] font-medium text-lg mt-0.5 block truncate">{userProfile.email}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-2xl p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#C9A94E30] flex items-center justify-center text-[#9A7B2F] group-hover:scale-110 transition-transform">
                <PhoneIcon size={20} />
              </div>
              <div>
                <span className="block text-xs text-[#706A60] uppercase tracking-wider font-semibold">Contact Phone</span>
                <span className="text-[#1A1A1A] font-medium text-lg mt-0.5 block">{userProfile.phone ? `+91 ${userProfile.phone}` : 'Not set'}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[#FCFBF9] border border-[#EFECE6] rounded-2xl p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#C9A94E30] flex items-center justify-center text-[#9A7B2F] group-hover:scale-110 transition-transform">
                <Calendar size={20} />
              </div>
              <div>
                <span className="block text-xs text-[#706A60] uppercase tracking-wider font-semibold">Member Since</span>
                <span className="text-[#1A1A1A] font-medium text-lg mt-0.5 block capitalize">{userProfile.createdAt}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
