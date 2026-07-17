'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Trash2, MapPinned, X } from 'lucide-react';
import { createAddress, deleteAddress } from '@/app/actions/accountActions';

interface AddressItem {
  id?: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function AddressManager({ initialAddresses }: { initialAddresses: AddressItem[] }) {
  const [addresses, setAddresses] = useState<AddressItem[]>(initialAddresses);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newAddressForm, setNewAddressForm] = useState({ city: '', state: '', pincode: '' });
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const pin = e.target.value;
    setNewAddressForm(prev => ({ ...prev, pincode: pin }));
    
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      setPincodeLoading(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === "Success") {
          const postOffice = data[0].PostOffice[0];
          setNewAddressForm(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State
          }));
        }
      } catch (err) {
        console.error("Failed to fetch pincode details", err);
      }
      setPincodeLoading(false);
    }
  };

  const handleDeleteAddress = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to remove this address?')) return;

    const res = await deleteAddress(id);
    if (res.error) {
      alert(res.error);
    } else {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  const handleEditClick = (addr: AddressItem) => {
    setEditingAddress(addr);
    setNewAddressForm({ city: addr.city, state: addr.state, pincode: addr.pincode });
    setIsModalOpen(true);
  };

  const handleOpenNewModal = () => {
    setEditingAddress(null);
    setNewAddressForm({ city: '', state: '', pincode: '' });
    setIsModalOpen(true);
  };

  const handleAddOrUpdateAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setModalLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Check if we are updating or creating
    let res;
    if (editingAddress?.id) {
      // Import updateAddress if not already imported, but let's assume it's imported above. Wait! We need to make sure updateAddress is imported.
      // We will add it to the import below, but for now we'll call it dynamically or assume it's imported.
      res = await import('@/app/actions/accountActions').then(mod => mod.updateAddress(editingAddress.id!, formData));
    } else {
      res = await createAddress(formData);
    }

    if (res.error) {
      setError(res.error);
      setModalLoading(false);
    } else {
      setIsModalOpen(false);
      setModalLoading(false);
      setNewAddressForm({ city: '', state: '', pincode: '' });
      
      if (res.data) {
        const savedAddr: AddressItem = {
          id: res.data.id,
          label: res.data.label,
          fullName: res.data.full_name,
          phone: res.data.phone,
          line1: res.data.line1,
          line2: res.data.line2 || undefined,
          city: res.data.city,
          state: res.data.state,
          pincode: res.data.pincode,
          isDefault: res.data.is_default
        };
        
        setAddresses(prev => {
          let updated = savedAddr.isDefault 
            ? prev.map(a => ({ ...a, isDefault: false })) 
            : prev;
            
          if (editingAddress?.id) {
            return updated.map(a => a.id === savedAddr.id ? savedAddr : a);
          } else {
            return [savedAddr, ...updated];
          }
        });
      }
      setEditingAddress(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#EFECE6] pb-4 px-1">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-wider text-[#9A7B2F] uppercase">
            Shipping Addresses
          </h3>
          <p className="text-xs text-[#8A8177] mt-0.5 font-light">Manage your saved delivery destinations.</p>
        </div>
        <button
          onClick={handleOpenNewModal}
          className="w-full sm:w-auto px-4 py-2 bg-[#9A7B2F] hover:bg-[#1C1917] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm shrink-0"
        >
          <Plus size={14} />
          <span>Add New Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-full bg-[#F9F7F3] border border-[#EFECE6] flex items-center justify-center mx-auto text-[#4E463F]">
            <MapPinned size={24} strokeWidth={1.25} />
          </div>
          <div>
            <h4 className="font-display font-medium text-base text-[#1A1A1A]">No Addresses Found</h4>
            <p className="text-sm text-[#4E463F] mt-1 font-light leading-relaxed">
              Add a shipping address to speed up your checkout process next time.
            </p>
          </div>
          <button 
            onClick={handleOpenNewModal} 
            className="btn-gold text-sm inline-block py-2.5 px-6 shadow-sm"
          >
            Add shipping address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="border border-[#EFECE6] rounded-xl p-5 bg-[#FCFBF9] text-sm space-y-3 relative shadow-sm hover:border-[#C9A94E40] transition-colors">
              {addr.isDefault && (
                <span className="absolute top-4 right-4 bg-[#C9A94E15] text-[#9A7B2F] text-xs font-semibold py-0.5 px-2 rounded-full uppercase border border-[#C9A94E30]">
                  Default
                </span>
              )}
              
              <div className="flex items-center space-x-2 text-[#9A7B2F] font-semibold text-sm">
                <MapPin size={14} />
                <span>{addr.label}</span>
              </div>
              
              <div className="space-y-1 text-[#5C554D] font-light text-left">
                <span className="block font-semibold text-[#1A1A1A]">{addr.fullName}</span>
                <span className="block">{addr.line1}</span>
                {addr.line2 && <span className="block">{addr.line2}</span>}
                <span className="block">{addr.city}, {addr.state} - {addr.pincode}</span>
                <span className="block pt-1">📞 +91 {addr.phone}</span>
              </div>

              <div className="flex justify-between items-center border-t border-[#EFECE6] pt-3 text-xs mt-2">
                <span className="text-[#9A7B2F] font-semibold">Verified Address</span>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleEditClick(addr)}
                    className="text-[#9A7B2F] hover:text-[#7A6125] font-semibold flex items-center space-x-1"
                  >
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteAddress(addr.id)} 
                    className="text-[#C62828] hover:text-red-700 font-semibold flex items-center space-x-1"
                  >
                    <Trash2 size={12} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-primary rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto relative no-scrollbar">
            <div className="sticky top-0 bg-primary/90 backdrop-blur-md z-10 px-6 py-5 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="font-display text-xl text-text-main">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                <p className="text-xs text-text-muted mt-0.5">Please provide your valid shipping details</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-text-muted hover:text-text-main transition-colors p-2 -mr-2"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddOrUpdateAddress} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-200">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col sm:col-span-2">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Address Label</label>
                  <select name="label" defaultValue={editingAddress?.label || "Home"} className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors appearance-none shadow-sm">
                    <option value="Home">Home</option>
                    <option value="Office">Office / Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Full Name *</label>
                  <input type="text" name="fullName" defaultValue={editingAddress?.fullName} placeholder="e.g. Priya Sharma" required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Phone Number *</label>
                  <input type="tel" name="phone" defaultValue={editingAddress?.phone} placeholder="e.g. 9876543210" required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                </div>

                <div className="flex flex-col sm:col-span-2">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Street Address *</label>
                  <input type="text" name="line1" defaultValue={editingAddress?.line1} placeholder="Flat, House no., Building, Company" required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                </div>

                <div className="flex flex-col sm:col-span-2">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Apartment, Suite, etc. (Optional)</label>
                  <input type="text" name="line2" defaultValue={editingAddress?.line2} placeholder="Area, Colony, Street, Sector" required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" />
                </div>
                
                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">City *</label>
                  <input type="text" name="city" required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" value={newAddressForm.city} onChange={(e) => setNewAddressForm({...newAddressForm, city: e.target.value})} />
                </div>

                <div className="flex flex-col">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">State *</label>
                  <input type="text" name="state" required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" value={newAddressForm.state} onChange={(e) => setNewAddressForm({...newAddressForm, state: e.target.value})} />
                </div>

                <div className="flex flex-col sm:col-span-2 relative">
                  <label className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">Pincode *</label>
                  <input type="text" name="pincode" placeholder="e.g. 400050" required className="border border-border bg-secondary rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-text-main transition-colors shadow-sm" value={newAddressForm.pincode} onChange={handlePincodeChange} maxLength={6} />
                  {pincodeLoading && (
                    <div className="absolute right-4 top-10">
                      <div className="w-4 h-4 border-2 border-[#C9A94E] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3 sm:col-span-2 pt-2">
                  <input type="checkbox" name="isDefault" id="isDefault" defaultChecked={editingAddress?.isDefault} className="w-4 h-4 text-[#9A7B2F] border-border rounded focus:ring-[#9A7B2F]" />
                  <label htmlFor="isDefault" className="text-sm font-medium text-text-main">Set as default shipping address</label>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-end space-x-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                  className="px-6 py-3 text-sm font-medium text-text-muted hover:text-text-main transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={modalLoading} 
                  className="btn-primary py-3 px-8 text-sm flex items-center space-x-2"
                >
                  {modalLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>{editingAddress ? 'Update Address' : 'Save Address'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
