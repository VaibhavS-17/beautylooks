const fs = require('fs');
const path = 'c:/beautylooks/src/components/account/AddressModal.tsx';

const newContent = `'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';

interface SavedAddress {
  id?: string;
  label: string;
  full_name?: string;
  fullName?: string;
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

export function AddressModal({ isOpen, onClose, editingAddress, onSubmit }: AddressModalProps) {
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  
  // Controlled fields
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [label, setLabel] = useState('Home');

  useEffect(() => {
    if (isOpen) {
      setCity(editingAddress?.city || '');
      setState(editingAddress?.state || '');
      setPincode(editingAddress?.pincode || '');
      setFullName(editingAddress?.full_name ?? editingAddress?.fullName ?? '');
      setPhone(editingAddress?.phone || '');
      setLine1(editingAddress?.line1 || '');
      setLine2(editingAddress?.line2 || '');
      setLabel(editingAddress?.label || 'Home');
      setError(null);
      setSubmitted(false);
    }
  }, [isOpen, editingAddress]);

  if (!isOpen) return null;

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value;
    setPincode(pin);
    
    if (pin.length === 6 && /^\\d+$/.test(pin)) {
      setPincodeLoading(true);
      try {
        const response = await fetch(\`https://api.postalpincode.in/pincode/\${pin}\`);
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
    setSubmitted(true);
    
    // Check if required fields are filled
    if (!fullName || !phone || !pincode || !city || !state || !line1 || !line2) {
      return; // Stop if required fields are missing
    }

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

  const renderField = (
    labelName: string, 
    name: string, 
    value: string, 
    onChange: (e: any) => void, 
    isRequired: boolean, 
    placeholder: string = '', 
    type: string = 'text',
    maxLength?: number,
    loading?: boolean,
    isTextArea?: boolean,
    readOnly?: boolean
  ) => {
    const showError = submitted && isRequired && !value.trim();
    
    return (
      <div className="flex flex-col">
        <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${showError ? 'border-b-2 border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
          <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">{labelName}</label>
          {isTextArea ? (
            <textarea 
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              readOnly={readOnly}
              rows={2}
              className={\`w-full bg-transparent focus:outline-none text-gray-900 text-sm resize-none \${readOnly ? 'opacity-80' : ''}\`}
            />
          ) : (
            <input 
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              maxLength={maxLength}
              readOnly={readOnly}
              className={\`w-full bg-transparent focus:outline-none text-gray-900 text-sm \${readOnly ? 'opacity-80' : ''}\`}
            />
          )}
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-[#C9A94E] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        {showError && (
          <div className="flex items-center justify-between text-red-600 mt-1.5 px-1">
            <span className="text-xs">This is required</span>
            <AlertTriangle size={14} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm sm:p-6 pb-20 sm:pb-6">
      <div className="bg-primary rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-primary/90 backdrop-blur-md z-10 px-6 py-5 border-b border-border flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-display text-xl text-text-main font-semibold">
              {editingAddress ? 'Edit Address' : 'Address'}
            </h3>
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
          <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200">
                {error}
              </div>
            )}

            {/* Address Label Select */}
            <div className="flex flex-col">
              <div className="bg-[#F3F4F6] rounded-xl px-4 py-2 relative border border-transparent focus-within:border-border">
                <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Save Address As</label>
                <select 
                  name="label" 
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-gray-900 text-sm appearance-none"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office / Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderField("Full Name", "fullName", fullName, (e) => setFullName(e.target.value), true)}
              {renderField("Phone Number", "phone", phone, (e) => setPhone(e.target.value), true, "", "tel")}
            </div>

            {/* Pincode & City/State */}
            {renderField("Pincode", "pincode", pincode, handlePincodeChange, true, "e.g. 400082", "text", 6, pincodeLoading)}
            
            <div className="grid grid-cols-2 gap-4">
              {renderField("City", "city", city, (e) => setCity(e.target.value), true, "", "text", undefined, false, false, true)}
              {renderField("State", "state", state, (e) => setState(e.target.value), true, "", "text", undefined, false, false, true)}
            </div>

            {/* Street Address */}
            {renderField("House/ Flat/ Office No.", "line1", line1, (e) => setLine1(e.target.value), true)}
            {renderField("Road Name/ Area /Colony", "line2", line2, (e) => setLine2(e.target.value), true, "", "text", undefined, false, true)}

            <div className="flex items-center space-x-3 pt-2 pb-2 px-1">
              <input type="checkbox" name="isDefault" id="isDefault" value="true" defaultChecked={isDefault} className="w-4 h-4 text-[#9A7B2F] border-border rounded focus:ring-[#9A7B2F]" />
              <label htmlFor="isDefault" className="text-sm font-medium text-text-main">Set as default shipping address</label>
            </div>
          </form>
        </div>

        {/* Footer */}
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
`;

fs.writeFileSync(path, newContent);
console.log("Updated AddressModal.tsx successfully!");
