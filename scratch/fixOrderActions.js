const fs = require('fs');
const path = 'c:/beautylooks/src/app/actions/orderActions.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Fix shippingAddress: any;
content = content.replace(
  'shippingAddress: any;',
  'shippingAddress: Record<string, unknown>;'
);

// 2. Fix catch blocks and error type
content = content.replace(
  /catch \(error: any\)/g,
  'catch (error: unknown)'
);

// 3. Fix error?.error?.description
content = content.replace(
  /const errorMessage = error\?\.error\?\.description \|\| error\?\.description \|\| error\?\.message \|\| (.*?);/g,
  "const err = error as Record<string, any>;\n    const errorMessage = err?.error?.description || err?.description || err?.message || $1;"
);

fs.writeFileSync(path, content);
console.log('Fixed orderActions.ts');
