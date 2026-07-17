'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface SavedAddress {
  id?: string;
  label: string;
  full_name?: string;
  fullName?: string; // Support both naming conventions
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default?: boolean;
  isDefault?: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAddress: SavedAddress | null;
  onSubmit: (formData: FormData) => Promise<any>;
}

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Other'
];

export function AddressModal({ isOpen, onClose, editingAddress, onSubmit }: AddressModalProps) {
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Controlled fields for pincode lookup
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCity(editingAddress?.city || '');
      setState(editingAddress?.state || '');
      setPincode(editingAddress?.pincode || '');
      setError(null);
    }
  }, [isOpen, editingAddress]);

  if (!isOpen) return null;

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value;
    setPincode(pin);
    
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      setPincodeLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setCity(postOffice.District);
          setState(postOffice.State);
        }
      } catch (err) {
        console.error("Failed to fetch pincode details", err);
      }
      setPincodeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setModalLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await onSubmit(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setModalLoading(false);
    }
  };

  const isDefault = editingAddress?.is_default ?? editingAddress?.isDefault ?? false;
  const fullName = editingAddress?.full_name ?? editingAddress?.fullName ?? '';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:p-6 pb-20 sm:pb-6">
      {/* Changed z-index from 60 to 100 to ensure it's above the bottom nav bar (z-50). Added pb-20 for mobile. */}
      {/* Changed max-h from 85vh to 75vh to make the card smaller on mobile so bottom buttons aren't hidden. */}
      <div className="bg-primary rounded-2xl shadow-xl w-full max-w-lg max-h-[75vh] flex flex-col relative overflow-hidden">
        
        {/* Header - Fixed */}
        <div className="bg-primary/90 backdrop-blur-md z-10 px-6 py-5 border-b border-border flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-display text-xl text-text-main">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">Please provide your valid shipping details</p>
          </div>
          <button 
            onClick={onClose}
            className="text-text-muted hover:text-text-main transition-colors p-2 -mr-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto no-scrollbar flex-1 p-6">
          <form id="address-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col sm:col-span-2">
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Address Label</label>
                <select name="label" defaultValue={editingAddress?.label || 'Home'} required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors appearance-none shadow-sm">
                  <option value="Home">Home</option>
                  <option value="Office">Office / Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Full Name *</label>
                <input type="text" name="fullName" defaultValue={fullName} placeholder="e.g. Priya Sharma" required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Phone Number *</label>
                <input type="tel" name="phone" defaultValue={editingAddress?.phone || ''} placeholder="e.g. 9876543210" required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
              </div>

              <div className="flex flex-col sm:col-span-2">
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Street Address *</label>
                <input type="text" name="line1" defaultValue={editingAddress?.line1 || ''} placeholder="Flat, House no., Building, Company" required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
              </div>

              <div className="flex flex-col sm:col-span-2">
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Apartment, Suite, etc. (Optional)</label>
                <input type="text" name="line2" defaultValue={editingAddress?.line2 || ''} placeholder="Area, Colony, Street, Sector" className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
              </div>

              <div className="flex flex-col sm:col-span-2 relative">
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Pincode *</label>
                <input type="text" name="pincode" placeholder="e.g. 400050" required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" value={pincode} onChange={handlePincodeChange} maxLength={6} />
                {pincodeLoading && (
                  <div className="absolute right-4 top-10">
                    <div className="w-4 h-4 border-2 border-[#C9A94E] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col">
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">City *</label>
                <input type="text" name="city" required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">State *</label>
                <select name="state" required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors appearance-none shadow-sm" value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="">Select State</option>
                  {indianStates.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>

              <div className="flex items-center space-x-3 sm:col-span-2 pt-2 pb-4">
                <input type="checkbox" name="isDefault" id="isDefault" value="true" defaultChecked={isDefault} className="w-4 h-4 text-[#9A7B2F] border-border rounded focus:ring-[#9A7B2F]" />
                <label htmlFor="isDefault" className="text-sm font-medium text-text-main">Set as default shipping address</label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 border-t border-border bg-primary shrink-0 flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={onClose}
            disabled={modalLoading}
            className="px-6 py-3 text-sm font-medium text-text-muted hover:text-text-main transition-colors"
          >
            Cancel
          </button>
          <button 
            form="address-form"
            type="submit" 
            disabled={modalLoading} 
            className="btn-primary py-3 px-8 text-sm flex items-center space-x-2"
          >
            {modalLoading && <Loader2 size={16} className="animate-spin" />}
            <span>{editingAddress ? 'Update Address' : 'Save Address'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
