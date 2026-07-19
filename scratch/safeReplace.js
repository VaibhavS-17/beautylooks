const fs = require('fs');

const file = 'src/app/checkout/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Remove handleAddressSubmit
const submitStart = content.indexOf('const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {');
const submitEndStr = '  };\n\n  const handleDeleteAddress';
const submitEnd = content.indexOf(submitEndStr);

if (submitStart !== -1 && submitEnd !== -1) {
  const codeToRemove = content.substring(submitStart, submitEnd + '  };\n\n'.length);
  // Sanity check
  if (codeToRemove.includes('setModalLoading(false);')) {
    content = content.replace(codeToRemove, '');
    console.log('Removed handleAddressSubmit');
  } else {
    console.log('Sanity check failed for handleAddressSubmit');
  }
} else {
  console.log('Could not find handleAddressSubmit start or end');
}

// 2. Remove modalError / modalLoading state variables
const mlIdx = content.indexOf('  const [modalLoading, setModalLoading] = useState(false);\n');
if (mlIdx !== -1) {
  content = content.replace('  const [modalLoading, setModalLoading] = useState(false);\n', '');
  console.log('Removed modalLoading');
} else if (content.indexOf('  const [modalLoading, setModalLoading] = useState(false);\r\n') !== -1) {
  content = content.replace('  const [modalLoading, setModalLoading] = useState(false);\r\n', '');
  console.log('Removed modalLoading (CRLF)');
}

const meIdx = content.indexOf('  const [modalError, setModalError] = useState<string | null>(null);\n');
if (meIdx !== -1) {
  content = content.replace('  const [modalError, setModalError] = useState<string | null>(null);\n', '');
  console.log('Removed modalError');
} else if (content.indexOf('  const [modalError, setModalError] = useState<string | null>(null);\r\n') !== -1) {
  content = content.replace('  const [modalError, setModalError] = useState<string | null>(null);\r\n', '');
  console.log('Removed modalError (CRLF)');
}

// 3. Replace Address Modal
const modalStart = content.indexOf('{/* Address Modal */}');
const modalEnd = content.indexOf('    </div>\n  );\n}\n\nexport default function CheckoutPage');

if (modalStart !== -1 && modalEnd !== -1) {
  const modalCode = content.substring(modalStart - 6, modalEnd);
  // Sanity check
  if (modalCode.includes('editingAddress ? \'Edit Address\' : \'Add New Address\'')) {
    const newModal = `      {/* Address Modal */}
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
              await loadAddresses();
              setIsAddressModalOpen(false);
              return { success: true };
            }
            return { error: 'Unknown error occurred' };
          } catch (err) {
            return { error: err.message || 'Failed to save address' };
          }
        }}
      />\n`;
    content = content.replace(modalCode, newModal);
    console.log('Replaced Address Modal');
  } else {
    console.log('Sanity check failed for Address Modal');
  }
} else {
  console.log('Could not find Address Modal start or end');
}

// 4. Replace Guest Checkout Fields
const shippingStart = content.indexOf('<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">');
const shippingEnd = content.indexOf('</div>\n                </div>\n              ) : (\n                <div className="hidden">', shippingStart);

if (shippingStart !== -1 && shippingEnd !== -1) {
  const shippingCode = content.substring(shippingStart, shippingEnd);
  
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
                    </div>`;

  content = content.replace(shippingCode, newShippingForm);
  console.log('Replaced Guest Checkout Shipping Form');
} else {
  console.log('Could not find Guest Checkout Shipping Form start or end', { shippingStart, shippingEnd });
}

fs.writeFileSync(file, content);
console.log('Done.');
