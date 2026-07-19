const fs = require('fs');

const file = 'src/app/checkout/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Replace inline Address Modal with the imported component
const modalStartIdx = content.indexOf('{/* Address Modal */}');
const modalEndIdx = content.indexOf('</main>');

if (modalStartIdx !== -1 && modalEndIdx !== -1) {
  const modalCode = content.substring(modalStartIdx, modalEndIdx);
  const newModalCode = `{/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        editingAddress={editingAddress}
        onSubmit={async (formDataObj) => {
          try {
            let res;
            if (editingAddress) {
              res = await updateAddress(editingAddress.id, formDataObj);
            } else {
              res = await createAddress(formDataObj);
            }
            if (res?.error) {
              return { error: res.error };
            } else if (res.data) {
              // Note: loadAddresses() handles updating savedAddresses
              await loadAddresses();
              setIsAddressModalOpen(false);
              return { success: true };
            }
            return { error: 'Unknown error occurred' };
          } catch (err) {
            return { error: err.message || 'Failed to save address' };
          }
        }}
      />
    `;
  content = content.replace(modalCode, newModalCode);
}

// 2. Remove the old handleAddressSubmit completely
const handleAddressSubmitStart = content.indexOf('const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {');
if (handleAddressSubmitStart !== -1) {
  const handleAddressSubmitEnd = content.indexOf('  };\n\n  const handleDeleteAddress', handleAddressSubmitStart) + 4;
  const handleAddressSubmitCode = content.substring(handleAddressSubmitStart, handleAddressSubmitEnd);
  
  const modalErrorStart = content.indexOf('const [modalError, setModalError] = useState<string | null>(null);');
  const modalLoadingStart = content.indexOf('const [modalLoading, setModalLoading] = useState(false);');
  
  content = content.replace(handleAddressSubmitCode, '');
  if (modalErrorStart !== -1) content = content.replace('  const [modalError, setModalError] = useState<string | null>(null);\n', '');
  if (modalLoadingStart !== -1) content = content.replace('  const [modalLoading, setModalLoading] = useState(false);\n', '');
}


// 3. Replace the Guest Checkout Shipping Information Form
// Look for the "Shipping Information" header
const shippingFormStart = content.indexOf('<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">');
if (shippingFormStart !== -1) {
  const nextDiv = content.indexOf('</div>\n                </div>\n              ) : (\n                <div className="hidden">', shippingFormStart);
  
  if (nextDiv !== -1) {
    const oldShippingForm = content.substring(shippingFormStart, nextDiv);
    const newShippingForm = `<div className="grid grid-cols-1 gap-4">
                    {/* Pincode (Full Width) */}
                    <div className="flex flex-col">
                      <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.pincode ? 'border border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                        <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Pincode</label>
                        <input ref={(el) => { inputRefs.current['pincode'] = el; }} type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} maxLength={6} placeholder="e.g. 400082" className="w-full bg-transparent focus:outline-none text-gray-900 text-sm" />
                      </div>
                      {formErrors.pincode && (
                        <div className="flex items-center justify-between text-red-600 mt-1.5 px-1">
                          <span className="text-xs">This is required</span>
                          <AlertTriangle size={14} />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* City */}
                      <div className="flex flex-col">
                        <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.city ? 'border border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                          <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">City</label>
                          <input ref={(el) => { inputRefs.current['city'] = el; }} type="text" name="city" value={formData.city} onChange={handleInputChange} readOnly className="w-full bg-transparent focus:outline-none text-gray-900 text-sm opacity-80" />
                        </div>
                        {formErrors.city && (
                          <div className="flex items-center justify-between text-red-600 mt-1.5 px-1">
                            <span className="text-xs">This is required</span>
                            <AlertTriangle size={14} />
                          </div>
                        )}
                      </div>

                      {/* State */}
                      <div className="flex flex-col">
                        <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.state ? 'border border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                          <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">State</label>
                          <select ref={(el) => { inputRefs.current['state'] = el; }} name="state" value={formData.state} onChange={handleInputChange} className="w-full bg-transparent focus:outline-none appearance-none text-gray-900 text-sm">
                            <option value="">Select State</option>
                            {indianStates.map((s) => (<option key={s} value={s}>{s}</option>))}
                          </select>
                        </div>
                        {formErrors.state && (
                          <div className="flex items-center justify-between text-red-600 mt-1.5 px-1">
                            <span className="text-xs">This is required</span>
                            <AlertTriangle size={14} />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="flex flex-col">
                        <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.fullName ? 'border border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                          <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Full Name</label>
                          <input ref={(el) => { inputRefs.current['fullName'] = el; }} type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-transparent focus:outline-none text-gray-900 text-sm" />
                        </div>
                        {formErrors.fullName && (
                          <div className="flex items-center justify-between text-red-600 mt-1.5 px-1">
                            <span className="text-xs">This is required</span>
                            <AlertTriangle size={14} />
                          </div>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div className="flex flex-col">
                        <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.phone ? 'border border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                          <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Phone Number</label>
                          <input ref={(el) => { inputRefs.current['phone'] = el; }} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-transparent focus:outline-none text-gray-900 text-sm" />
                        </div>
                        {formErrors.phone && (
                          <div className="flex items-center justify-between text-red-600 mt-1.5 px-1">
                            <span className="text-xs">This is required</span>
                            <AlertTriangle size={14} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="flex flex-col">
                      <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.email ? 'border border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                        <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Email Address</label>
                        <input ref={(el) => { inputRefs.current['email'] = el; }} type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-transparent focus:outline-none text-gray-900 text-sm" />
                      </div>
                      {formErrors.email && (
                        <div className="flex items-center justify-between text-red-600 mt-1.5 px-1">
                          <span className="text-xs">This is required</span>
                          <AlertTriangle size={14} />
                        </div>
                      )}
                    </div>

                    {/* Address Line 1 */}
                    <div className="flex flex-col">
                      <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.addressLine1 ? 'border border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                        <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Street Address</label>
                        <input ref={(el) => { inputRefs.current['addressLine1'] = el; }} type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className="w-full bg-transparent focus:outline-none text-gray-900 text-sm" />
                      </div>
                      {formErrors.addressLine1 && (
                        <div className="flex items-center justify-between text-red-600 mt-1.5 px-1">
                          <span className="text-xs">This is required</span>
                          <AlertTriangle size={14} />
                        </div>
                      )}
                    </div>

                    {/* Address Line 2 */}
                    <div className="flex flex-col">
                      <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.addressLine2 ? 'border border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                        <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Road Name/ Area /Colony</label>
                        <input ref={(el) => { inputRefs.current['addressLine2'] = el; }} type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className="w-full bg-transparent focus:outline-none text-gray-900 text-sm" />
                      </div>
                      {formErrors.addressLine2 && (
                        <div className="flex items-center justify-between text-red-600 mt-1.5 px-1">
                          <span className="text-xs">This is required</span>
                          <AlertTriangle size={14} />
                        </div>
                      )}
                    </div>
                  `;
    
    content = content.replace(oldShippingForm, newShippingForm);
  }
}

fs.writeFileSync(file, content);
console.log('Successfully updated checkout/page.tsx');
