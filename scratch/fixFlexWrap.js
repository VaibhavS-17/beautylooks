const fs = require('fs');
let file, content;

file = 'src/app/HomeClient.tsx';
if (fs.existsSync(file)) {
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className=\"flex items-center justify-between mb-4\"/g, 'className=\"flex flex-wrap items-center justify-between mb-4 gap-2\"');
  fs.writeFileSync(file, content);
}

file = 'src/app/account/orders/[orderId]/page.tsx';
if (fs.existsSync(file)) {
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className=\"flex items-center justify-between mb-8\"/g, 'className=\"flex flex-wrap items-center justify-between mb-8 gap-4\"');
  content = content.replace(/className=\"flex items-center space-x-4\"/g, 'className=\"flex flex-wrap items-center gap-4\"');
  fs.writeFileSync(file, content);
}

file = 'src/app/products/[slug]/ProductDetailClient.tsx';
if (fs.existsSync(file)) {
  content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className=\"flex items-center space-x-4 mb-6\"/g, 'className=\"flex flex-wrap items-center gap-4 mb-6\"');
  fs.writeFileSync(file, content);
}
