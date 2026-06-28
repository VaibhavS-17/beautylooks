const fs = require('fs');

const files = [
  'c:/beautylooks/src/app/admin/AdminClient.tsx',
  'c:/beautylooks/src/app/account/AccountClient.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace text-xs with text-sm
    content = content.replace(/text-xs/g, 'text-sm');
    
    // Replace text-[10px] with text-xs
    content = content.replace(/text-\[10px\]/g, 'text-xs');
    
    // Replace text-[9px] with text-xs
    content = content.replace(/text-\[9px\]/g, 'text-xs');
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}
