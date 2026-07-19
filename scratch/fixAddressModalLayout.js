const fs = require('fs');

const modalFile = 'src/components/account/AddressModal.tsx';
let modalContent = fs.readFileSync(modalFile, 'utf-8');

const layoutRe = /            \{\/\* Address Label Select \*\/\}[\s\S]*?              <label htmlFor="isDefault" className="text-sm font-medium text-text-main">Set as default shipping address<\/label>\r?\n            <\/div>\r?\n/m;

if (layoutRe.test(modalContent)) {
  const newLayout = `            {/* Address Label Select */}
            <div className="flex flex-col mb-4">
              <label className="text-[11px] font-bold text-gray-600 uppercase tracking-widest mb-1.5 block">Save Address As *</label>
              <select 
                name="label" 
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A94E] shadow-sm transition-all appearance-none"
              >
                <option value="Home">Home</option>
                <option value="Office">Office / Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {renderField("Full Name", "fullName", fullName, (e) => setFullName(e.target.value), true)}
              {renderField("Contact Phone", "phone", phone, (e) => setPhone(e.target.value), true, "", "tel", 15)}
              {renderField("Street Address", "line1", line1, (e) => setLine1(e.target.value), true)}
              {renderField("Area, Colony, Street, Sector", "line2", line2, (e) => setLine2(e.target.value), true)}
              {renderField("City", "city", city, (e) => setCity(e.target.value), true, "", "text", undefined, false, false, true)}
              {renderField("State", "state", state, (e) => setState(e.target.value), true, "", "text", undefined, false, false, true)}
              {renderField("Pincode", "pincode", pincode, handlePincodeChange, true, "e.g. 400082", "text", 6, pincodeLoading)}
            </div>

            <div className="flex items-center space-x-3 pt-2 pb-2 px-1 mt-4">
              <input type="checkbox" name="isDefault" id="isDefault" value="true" defaultChecked={isDefault} className="w-4 h-4 text-[#9A7B2F] border-border rounded focus:ring-[#9A7B2F]" />
              <label htmlFor="isDefault" className="text-sm font-medium text-text-main">Set as default shipping address</label>
            </div>\n`;

  modalContent = modalContent.replace(layoutRe, newLayout);
  console.log('Replaced AddressModal layout');
} else {
  console.log('Could not find AddressModal layout');
}

fs.writeFileSync(modalFile, modalContent);
console.log('Done.');
