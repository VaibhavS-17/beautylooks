const fs = require('fs');

const modalPath = 'c:/beautylooks/src/components/account/AddressModal.tsx';
let modalContent = fs.readFileSync(modalPath, 'utf8');
modalContent = modalContent.replace(/border-b-2 border-red-600/g, 'border border-red-600');
fs.writeFileSync(modalPath, modalContent);


const checkoutPath = 'c:/beautylooks/src/app/checkout/page.tsx';
let checkoutContent = fs.readFileSync(checkoutPath, 'utf8');

// Replace border-b-2 with border in checkout
checkoutContent = checkoutContent.replace(/border-b-2 border-red-600/g, 'border border-red-600');

// Replace the guest checkout fields block to match AddressModal layout but keeping Pincode on top
const guestStartStr = '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">';
const guestStart = checkoutContent.indexOf(guestStartStr);
if (guestStart !== -1) {
  const guestEnd = checkoutContent.indexOf('              ) : (', guestStart);
  if (guestEnd !== -1) {
    const newGuestFields = `<div className="grid grid-cols-1 gap-4">
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
                          <input ref={(el) => { inputRefs.current['state'] = el; }} type="text" name="state" value={formData.state} onChange={handleInputChange} readOnly className="w-full bg-transparent focus:outline-none text-gray-900 text-sm opacity-80" />
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

                    {/* Email */}
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
                        <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">House/ Flat/ Office No.</label>
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
                  </div>
                </div>
`; // Note: I appended the closing tags just like previous script

    checkoutContent = checkoutContent.substring(0, guestStart) + newGuestFields + checkoutContent.substring(guestEnd);
  }
}

fs.writeFileSync(checkoutPath, checkoutContent);
console.log("Updated guest checkout UI successfully!");
