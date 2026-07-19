const fs = require('fs');
const path = 'c:/beautylooks/src/app/checkout/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const submitStartStr = '  const handleAddressSubmit = async (e: React.FormEvent<HTMLFormElement>) => {';
const submitStart = content.indexOf(submitStartStr);
if(submitStart === -1) {
  console.error("Could not find handleAddressSubmit");
  process.exit(1);
}
const deleteStart = content.indexOf('const handleDeleteAddress', submitStart);
const submitEnd = content.lastIndexOf('  };', deleteStart) + 4;

const newSubmit = `  const handleModalSubmit = async (formDataObj: FormData) => {
    setModalError(null);
    setModalLoading(true);

    let res;
    if (editingAddress) {
      res = await updateAddress(editingAddress.id, formDataObj);
    } else {
      res = await createAddress(formDataObj);
    }

    if (res.error) {
      setModalError(res.error);
      setModalLoading(false);
      return { error: res.error };
    } else if (res.data) {
      setIsAddressModalOpen(false);
      
      const newAddr: SavedAddress = {
        id: res.data.id,
        user_id: res.data.user_id,
        label: res.data.label,
        full_name: res.data.full_name,
        phone: res.data.phone,
        line1: res.data.line1,
        line2: res.data.line2,
        city: res.data.city,
        state: res.data.state,
        pincode: res.data.pincode,
        is_default: res.data.is_default
      };

      if (editingAddress) {
        setSavedAddresses(prev => prev.map(a => a.id === editingAddress.id ? newAddr : (newAddr.is_default ? { ...a, is_default: false } : a)));
      } else {
        setSavedAddresses(prev => {
          const updated = newAddr.is_default ? prev.map(a => ({ ...a, is_default: false })) : prev;
          return [newAddr, ...updated];
        });
      }
      setModalLoading(false);
      return { success: true };
    }
  };
`;

content = content.substring(0, submitStart) + newSubmit + content.substring(submitEnd);

const modalStartStr = '{isAddressModalOpen && (';
const modalStart = content.indexOf(modalStartStr);
if (modalStart === -1) {
  console.error("Could not find isAddressModalOpen block");
  process.exit(1);
}

const exportStart = content.indexOf('export default function CheckoutPage() {');
const endOfCheckoutContent = content.lastIndexOf('  );', exportStart);

// find the `)}` that closes the modal
const modalEnd = content.lastIndexOf(')}', endOfCheckoutContent);

const newModal = `<AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        editingAddress={editingAddress as any}
        onSubmit={handleModalSubmit}
      />`;

// There are spaces before `{isAddressModalOpen && (` that we should keep, so we replace from `modalStart` to `modalEnd + 2`.
content = content.substring(0, modalStart) + newModal + content.substring(modalEnd + 2);

fs.writeFileSync(path, content);
console.log("Updated checkout/page.tsx successfully!");
