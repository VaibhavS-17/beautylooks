const fs = require('fs');
const path = 'c:/beautylooks/src/app/checkout/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update handleInputChange to clear formErrors when typing
const handleInputOld = `  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (selectedAddressId && name !== 'email') setSelectedAddressId(null);
  };`;
const handleInputNew = `  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (selectedAddressId && name !== 'email') setSelectedAddressId(null);
    if ((formErrors as any)[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete (newErrors as any)[name];
        return newErrors;
      });
    }
  };`;

content = content.replace(handleInputOld, handleInputNew);

// 2. Remove the asterisks (*) from guest checkout labels
// Find the start of the guest fields
const guestStartStr = '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">';
const guestStart = content.indexOf(guestStartStr);
if (guestStart !== -1) {
  const guestEnd = content.indexOf('              ) : (', guestStart);
  if (guestEnd !== -1) {
    let guestFields = content.substring(guestStart, guestEnd);
    
    guestFields = guestFields.replace(/Pincode \*/g, 'Pincode');
    guestFields = guestFields.replace(/City \*/g, 'City');
    guestFields = guestFields.replace(/State \*/g, 'State');
    guestFields = guestFields.replace(/Full Name \*/g, 'Full Name');
    guestFields = guestFields.replace(/Phone Number \*/g, 'Phone Number');
    guestFields = guestFields.replace(/Email Address \*/g, 'Email Address');
    guestFields = guestFields.replace(/House\/ Flat\/ Office No\. \*/g, 'House/ Flat/ Office No.');
    guestFields = guestFields.replace(/Road Name\/ Area \/Colony \*/g, 'Road Name/ Area /Colony');
    
    content = content.substring(0, guestStart) + guestFields + content.substring(guestEnd);
  }
}

fs.writeFileSync(path, content);
console.log("Updated guest checkout fields and handleInputChange successfully!");
