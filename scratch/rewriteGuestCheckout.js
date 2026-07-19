const fs = require('fs');
const path = 'c:/beautylooks/src/app/checkout/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix user_id build error
content = content.replace('        user_id: res.data.user_id,\n', '');

// 2. Add AlertTriangle to lucide-react import
if (!content.includes('AlertTriangle')) {
  content = content.replace(
    "import { ArrowLeft, CheckCircle2, ShieldCheck, Loader2, MapPin, Smartphone, CreditCard, MessageCircle, Check, Plus, Trash2, Edit2, X } from 'lucide-react';",
    "import { ArrowLeft, CheckCircle2, ShieldCheck, Loader2, MapPin, Smartphone, CreditCard, MessageCircle, Check, Plus, Trash2, Edit2, X, AlertTriangle } from 'lucide-react';"
  );
}

// 3. Rewrite guest checkout fields
const guestStartStr = '<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">';
const guestStart = content.indexOf(guestStartStr);
if (guestStart === -1) {
  console.error("Could not find guest fields block");
  process.exit(1);
}

const guestEnd = content.indexOf('              ) : (', guestStart);
if (guestEnd === -1) {
  console.error("Could not find guest block end");
  process.exit(1);
}

const newGuestFields = `<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pincode (Full Width) */}
                    <div className="flex flex-col sm:col-span-2">
                      <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.pincode ? 'border-b-2 border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                        <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Pincode *</label>
                        <input ref={(el) => { inputRefs.current['pincode'] = el; }} type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} maxLength={6} placeholder="e.g. 400082" className="w-full bg-transparent focus:outline-none text-gray-900 text-sm" />
                      </div>
                      {formErrors.pincode && (
                        <div className="flex items-center justify-between text-red-600 mt-1.5 px-1">
                          <span className="text-xs">This is required</span>
                          <AlertTriangle size={14} />
                        </div>
                      )}
                    </div>

                    {/* City */}
                    <div className="flex flex-col">
                      <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.city ? 'border-b-2 border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                        <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">City *</label>
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
                      <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.state ? 'border-b-2 border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                        <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">State *</label>
                        <input ref={(el) => { inputRefs.current['state'] = el; }} type="text" name="state" value={formData.state} onChange={handleInputChange} readOnly className="w-full bg-transparent focus:outline-none text-gray-900 text-sm opacity-80" />
                      </div>
                      {formErrors.state && (
                        <div className="flex items-center justify-between text-red-600 mt-1.5 px-1">
                          <span className="text-xs">This is required</span>
                          <AlertTriangle size={14} />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:col-span-2">
                      <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.fullName ? 'border-b-2 border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                        <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Full Name *</label>
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
                      <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.phone ? 'border-b-2 border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                        <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Phone Number *</label>
                        <input ref={(el) => { inputRefs.current['phone'] = el; }} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-transparent focus:outline-none text-gray-900 text-sm" />
                      </div>
                      {formErrors.phone && (
                        <div className="flex items-center justify-between text-red-600 mt-1.5 px-1">
                          <span className="text-xs">This is required</span>
                          <AlertTriangle size={14} />
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col">
                      <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.email ? 'border-b-2 border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                        <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Email Address *</label>
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
                    <div className="flex flex-col sm:col-span-2">
                      <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.addressLine1 ? 'border-b-2 border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                        <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">House/ Flat/ Office No. *</label>
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
                    <div className="flex flex-col sm:col-span-2">
                      <div className={\`bg-[#F3F4F6] rounded-xl px-4 py-2 relative transition-all \${formErrors.addressLine2 ? 'border-b-2 border-red-600' : 'border border-transparent focus-within:border-border'}\`}>
                        <label className="text-[11px] font-medium text-gray-500 mb-0.5 block">Road Name/ Area /Colony *</label>
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
`; // Add back the `</div>` that we replaced up to `              ) : (`

content = content.substring(0, guestStart) + newGuestFields + content.substring(guestEnd);

fs.writeFileSync(path, content);
console.log("Updated guest checkout fields successfully!");
