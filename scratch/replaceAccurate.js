const fs = require('fs');

const path = 'c:/beautylooks/src/app/products/[slug]/ProductDetailClient.tsx';
let content = fs.readFileSync(path, 'utf8');

const errorMsg = (msg) => { console.error(msg); process.exit(1); }

// 1. Remove state hooks
content = content.replace(/const \[peopleInCart, setPeopleInCart\].*?\n/g, '');
content = content.replace(/const \[countdownStr, setCountdownStr\].*?\n/g, '');
content = content.replace(/const \[deliveryDate, setDeliveryDate\].*?\n/g, '');
content = content.replace(/const \[openFaqIndex, setOpenFaqIndex\].*?\n/g, '');

// 2. Remove useEffect block
const effectStartStr = '  useEffect(() => {\n    // Generate a static "random" number';
const effectEndStr = '  }, [product.id]);';

const effectStart = content.indexOf(effectStartStr);
if (effectStart === -1) errorMsg('Could not find useEffect start');
let effectEnd = content.indexOf(effectEndStr, effectStart);
if (effectEnd === -1) errorMsg('Could not find useEffect end');
effectEnd += effectEndStr.length;

content = content.slice(0, effectStart) + content.slice(effectEnd);

// 3. Replace Purchase Panel
const purchaseStartStr = '{/* Subscribe & Save Mockup */}';
const purchaseEndStr = '{/* Frequently Bought Together Mock */}';

const pStart = content.indexOf(purchaseStartStr);
if (pStart === -1) errorMsg('Could not find Subscribe & Save start');
const pEnd = content.indexOf(purchaseEndStr, pStart);
if (pEnd === -1) errorMsg('Could not find Frequently Bought Together end');

const purchaseReplacement = `<ProductPurchasePanel
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              isSubscription={isSubscription}
              setIsSubscription={setIsSubscription}
              handleShare={handleShare}
              isShared={isShared}
              setNotifyModalOpen={setNotifyModalOpen}
            />\n\n            `;

content = content.slice(0, pStart) + purchaseReplacement + content.slice(pEnd);

// 4. Replace Accordions (all instances!)
// Wait, we have DUPLICATE blocks of "{/* ── Vertical Stacked Sections ── */}"
// Let's replace EVERYTHING from the first "{/* ── Vertical Stacked Sections ── */}" 
// to the end of the file or before the final closing tags?
// Let's see what's at the end of the file.
