const fs = require('fs');

const pageFile = 'src/app/checkout/page.tsx';
let pageContent = fs.readFileSync(pageFile, 'utf-8');

// 1. Remove setModalError(null)
const setModalErrorRe = /    setModalError\(null\);\r?\n/;
if (setModalErrorRe.test(pageContent)) {
  pageContent = pageContent.replace(setModalErrorRe, '');
  console.log('Removed setModalError from openAddressModal');
}

// 2. Rewrite Guest Checkout Fields
const shippingRe = /<div className="grid grid-cols-1 gap-4">[\s\S]*?<\/div>\r?\n                <\/div>\r?\n              \) : \(\r?\n                <div className="hidden">/m;

if (shippingRe.test(pageContent)) {
  const newShippingForm = `<div className="grid grid-cols-1 gap-5">
                    {/* Full Name */}
                    <div className="flex flex-col">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">Full Name *</label>
                      <div className="relative">
                        <input ref={(el) => { inputRefs.current['fullName'] = el; }} type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className={\`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A94E] shadow-sm transition-all \${formErrors.fullName ? 'border-red-600' : 'border-gray-200'}\`} />
                        {formErrors.fullName && (
                          <div className="absolute right-0 -bottom-5 flex items-center text-red-600 mt-1">
                            <span className="text-[10px] mr-1">Required</span>
                            <AlertTriangle size={12} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">Contact Phone *</label>
                      <div className="relative">
                        <input ref={(el) => { inputRefs.current['phone'] = el; }} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={\`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A94E] shadow-sm transition-all \${formErrors.phone ? 'border-red-600' : 'border-gray-200'}\`} />
                        {formErrors.phone && (
                          <div className="absolute right-0 -bottom-5 flex items-center text-red-600 mt-1">
                            <span className="text-[10px] mr-1">Required</span>
                            <AlertTriangle size={12} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="flex flex-col">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">Email Address *</label>
                      <div className="relative">
                        <input ref={(el) => { inputRefs.current['email'] = el; }} type="email" name="email" value={formData.email} onChange={handleInputChange} className={\`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A94E] shadow-sm transition-all \${formErrors.email ? 'border-red-600' : 'border-gray-200'}\`} />
                        {formErrors.email && (
                          <div className="absolute right-0 -bottom-5 flex items-center text-red-600 mt-1">
                            <span className="text-[10px] mr-1">Required</span>
                            <AlertTriangle size={12} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Address Line 1 */}
                    <div className="flex flex-col">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">Street Address *</label>
                      <div className="relative">
                        <input ref={(el) => { inputRefs.current['addressLine1'] = el; }} type="text" name="addressLine1" value={formData.addressLine1} onChange={handleInputChange} className={\`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A94E] shadow-sm transition-all \${formErrors.addressLine1 ? 'border-red-600' : 'border-gray-200'}\`} />
                        {formErrors.addressLine1 && (
                          <div className="absolute right-0 -bottom-5 flex items-center text-red-600 mt-1">
                            <span className="text-[10px] mr-1">Required</span>
                            <AlertTriangle size={12} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Address Line 2 */}
                    <div className="flex flex-col">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">Area, Colony, Street, Sector *</label>
                      <div className="relative">
                        <input ref={(el) => { inputRefs.current['addressLine2'] = el; }} type="text" name="addressLine2" value={formData.addressLine2} onChange={handleInputChange} className={\`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A94E] shadow-sm transition-all \${formErrors.addressLine2 ? 'border-red-600' : 'border-gray-200'}\`} />
                        {formErrors.addressLine2 && (
                          <div className="absolute right-0 -bottom-5 flex items-center text-red-600 mt-1">
                            <span className="text-[10px] mr-1">Required</span>
                            <AlertTriangle size={12} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* City */}
                    <div className="flex flex-col">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">City *</label>
                      <div className="relative">
                        <input ref={(el) => { inputRefs.current['city'] = el; }} type="text" name="city" value={formData.city} onChange={handleInputChange} readOnly className={\`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A94E] shadow-sm transition-all opacity-80 \${formErrors.city ? 'border-red-600' : 'border-gray-200'}\`} />
                        {formErrors.city && (
                          <div className="absolute right-0 -bottom-5 flex items-center text-red-600 mt-1">
                            <span className="text-[10px] mr-1">Required</span>
                            <AlertTriangle size={12} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* State */}
                    <div className="flex flex-col">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">State *</label>
                      <div className="relative">
                        <select ref={(el) => { inputRefs.current['state'] = el; }} name="state" value={formData.state} onChange={handleInputChange} className={\`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A94E] shadow-sm transition-all appearance-none \${formErrors.state ? 'border-red-600' : 'border-gray-200'}\`}>
                          <option value="">Select State</option>
                          {indianStates.map((s) => (<option key={s} value={s}>{s}</option>))}
                        </select>
                        {formErrors.state && (
                          <div className="absolute right-0 -bottom-5 flex items-center text-red-600 mt-1">
                            <span className="text-[10px] mr-1">Required</span>
                            <AlertTriangle size={12} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pincode */}
                    <div className="flex flex-col">
                      <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">Pincode *</label>
                      <div className="relative">
                        <input ref={(el) => { inputRefs.current['pincode'] = el; }} type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} maxLength={6} placeholder="e.g. 400082" className={\`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A94E] shadow-sm transition-all \${formErrors.pincode ? 'border-red-600' : 'border-gray-200'}\`} />
                        {formErrors.pincode && (
                          <div className="absolute right-0 -bottom-5 flex items-center text-red-600 mt-1">
                            <span className="text-[10px] mr-1">Required</span>
                            <AlertTriangle size={12} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="hidden">`;

  pageContent = pageContent.replace(shippingRe, newShippingForm);
  console.log('Replaced Guest Checkout Shipping Form');
} else {
  console.log('Could not find Guest Checkout Shipping Form');
}
fs.writeFileSync(pageFile, pageContent);

// 3. Rewrite AddressModal.tsx
const modalFile = 'src/components/account/AddressModal.tsx';
let modalContent = fs.readFileSync(modalFile, 'utf-8');

const renderFieldRe = /  const renderField = \([\s\S]*?    \);\r?\n  \};\r?\n/m;
if (renderFieldRe.test(modalContent)) {
  const newRenderField = `  const renderField = (
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
      <div className="flex flex-col mb-4">
        <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">{labelName} {isRequired && '*'}</label>
        <div className="relative">
          {isTextArea ? (
            <textarea 
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              readOnly={readOnly}
              rows={2}
              className={\`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A94E] shadow-sm transition-all resize-none \${showError ? 'border-red-600' : 'border-gray-200'} \${readOnly ? 'opacity-80' : ''}\`}
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
              className={\`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A94E] shadow-sm transition-all \${showError ? 'border-red-600' : 'border-gray-200'} \${readOnly ? 'opacity-80' : ''}\`}
            />
          )}
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-[#C9A94E] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {showError && (
            <div className="absolute right-0 -bottom-5 flex items-center text-red-600 mt-1">
              <span className="text-[10px] mr-1">Required</span>
              <AlertTriangle size={12} />
            </div>
          )}
        </div>
      </div>
    );
  };\n`;
  modalContent = modalContent.replace(renderFieldRe, newRenderField);
  console.log('Replaced AddressModal renderField');
} else {
  console.log('Could not find AddressModal renderField');
}

// 4. AddressModal Grid Layout
const modalLayoutRe = /              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">[\s\S]*?              <\/div>\r?\n\r?\n              <div className="pt-6 border-t border-border flex justify-end space-x-4">/m;
if (modalLayoutRe.test(modalContent)) {
  const newModalLayout = `              <div className="grid grid-cols-1 gap-1">
                <div className="flex flex-col sm:col-span-1 mb-2">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">Address Label *</label>
                  <select name="label" value={label} onChange={(e) => setLabel(e.target.value)} required className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A94E] shadow-sm transition-all appearance-none">
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {renderField('Full Name', 'fullName', fullName, (e) => setFullName(e.target.value), true)}
                {renderField('Contact Phone', 'phone', phone, (e) => setPhone(e.target.value), true, '', 'tel', 15)}
                {renderField('Street Address', 'line1', line1, (e) => setLine1(e.target.value), true)}
                {renderField('Area, Colony, Street, Sector', 'line2', line2, (e) => setLine2(e.target.value), true)}
                {renderField('City', 'city', city, (e) => setCity(e.target.value), true, '', 'text', undefined, false, false, true)}
                
                <div className="flex flex-col mb-4">
                  <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">State *</label>
                  <div className="relative">
                    <select name="state" value={state} onChange={(e) => setState(e.target.value)} required className={\`w-full bg-white border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A94E] shadow-sm transition-all appearance-none \${submitted && !state ? 'border-red-600' : 'border-gray-200'}\`}>
                      <option value="">Select State</option>
                      {['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'].map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                    {submitted && !state && (
                      <div className="absolute right-0 -bottom-5 flex items-center text-red-600 mt-1">
                        <span className="text-[10px] mr-1">Required</span>
                        <AlertTriangle size={12} />
                      </div>
                    )}
                  </div>
                </div>

                {renderField('Pincode', 'pincode', pincode, handlePincodeChange, true, 'e.g. 400082', 'text', 6, pincodeLoading)}
                
                <div className="flex items-center space-x-3 pt-2 mb-4">
                  <input type="checkbox" id="isDefault" name="isDefault" value="true" defaultChecked={isDefault} className="w-4 h-4 text-[#9A7B2F] border-border rounded focus:ring-[#9A7B2F]" />
                  <label htmlFor="isDefault" className="text-sm font-medium text-text-main">Set as default shipping address</label>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-end space-x-4">`;
  modalContent = modalContent.replace(modalLayoutRe, newModalLayout);
  console.log('Replaced AddressModal Layout');
} else {
  console.log('Could not find AddressModal Layout');
}
fs.writeFileSync(modalFile, modalContent);

console.log('Done.');
