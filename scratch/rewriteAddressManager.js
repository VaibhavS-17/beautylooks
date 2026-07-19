const fs = require('fs');
const path = 'c:/beautylooks/src/app/account/addresses/AddressManager.tsx';

let content = fs.readFileSync(path, 'utf8');

// Replace handleAddOrUpdateAddress and its related state with handleModalSubmit
const submitStart = content.indexOf('const handleAddOrUpdateAddress');
const returnStart = content.indexOf('return (', submitStart);

if (submitStart === -1 || returnStart === -1) {
  console.error("Could not find submit block");
  process.exit(1);
}

const newSubmitCode = `  const handleModalSubmit = async (formData: FormData) => {
    let res;
    if (editingAddress?.id) {
      res = await import('@/app/actions/accountActions').then(mod => mod.updateAddress(editingAddress.id!, formData));
    } else {
      res = await createAddress(formData);
    }

    if (res.error) {
      return { error: res.error };
    } else {
      if (res.data) {
        const savedAddr = {
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
      setIsModalOpen(false);
      setEditingAddress(null);
      return { success: true };
    }
  };

  `;

content = content.substring(0, submitStart) + newSubmitCode + content.substring(returnStart);

// Replace inline modal with AddressModal
const modalStartStr = '{isModalOpen && (';
const modalStart = content.indexOf(modalStartStr);
const endOfFile = content.lastIndexOf('</div>'); // The main wrapping div

if (modalStart === -1) {
  console.error("Could not find modal block");
  process.exit(1);
}

const newModalCode = `      <AddressModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        editingAddress={editingAddress as any}
        onSubmit={handleModalSubmit}
      />\n    `;

content = content.substring(0, modalStart) + newModalCode + content.substring(endOfFile);

fs.writeFileSync(path, content);
console.log("Updated AddressManager.tsx successfully!");
