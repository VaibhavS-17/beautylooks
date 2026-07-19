const fs = require('fs');

const path = 'c:/beautylooks/src/app/products/[slug]/ProductDetailClient.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports
const importsToAdd = `import { ProductPurchasePanel } from '@/components/product/ProductPurchasePanel';
import { ProductDetailsAccordion } from '@/components/product/ProductDetailsAccordion';`;

content = content.replace(
  "import { Product } from '@/lib/types';",
  "import { Product } from '@/lib/types';\n" + importsToAdd
);

// 2. Remove useState hooks that are now in child components
content = content.replace(/const \[peopleInCart, setPeopleInCart\] = useState\(0\);\n/g, '');
content = content.replace(/const \[countdownStr, setCountdownStr\] = useState\(''\);\n/g, '');
content = content.replace(/const \[deliveryDate, setDeliveryDate\] = useState\(''\);\n/g, '');
content = content.replace(/const \[openFaqIndex, setOpenFaqIndex\] = useState<number \| null>\(null\);\n/g, '');

// 3. Remove useEffect for the above
const effectToRemove = `  useEffect(() => {
    // Generate a pseudo-random number of people based on product ID
    const hash = product.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    setPeopleInCart((hash % 10) + 3); // 3 to 12 people
    
    // Countdown timer for next-day delivery (resets every day at 6 PM)
    const updateCountdown = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(18, 0, 0, 0); // 6 PM cutoff
      if (now > cutoff) {
        cutoff.setDate(cutoff.getDate() + 1); // Next day
      }
      const diff = cutoff.getTime() - now.getTime();
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdownStr(\`\${hrs} hrs \${mins} mins\`);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute
    
    // Delivery date calculation (Current date + 3 days)
    const del = new Date();
    del.setDate(del.getDate() + 3);
    setDeliveryDate(del.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    
    return () => clearInterval(interval);
  }, [product.id]);`;

content = content.replace(effectToRemove, '');

// 4. Remove DEFAULT_FAQS and faqsToRender
const defaultFaqsRegex = /\/\/ --- Constants & Fallbacks ---[\s\S]*?const faqsToRender =.*?;\n\n/m;
content = content.replace(defaultFaqsRegex, '');

// 5. Replace Purchase Panel area
const purchasePanelStart = '{/* --- Purchase Types --- */}';
const purchasePanelEnd = '{/* --- Details / Formulations / FAQs --- */}';

const purchasePanelRegex = new RegExp(purchasePanelStart.replace(/[.*+?^\${}()|[\\]\\]/g, '\\$&') + '[\\s\\S]*?(?=' + purchasePanelEnd.replace(/[.*+?^\${}()|[\\]\\]/g, '\\$&') + ')');

content = content.replace(purchasePanelRegex, 
  `<ProductPurchasePanel
              product={product}
              quantity={quantity}
              setQuantity={setQuantity}
              isSubscription={isSubscription}
              setIsSubscription={setIsSubscription}
              handleShare={handleShare}
              isShared={isShared}
              setNotifyModalOpen={setNotifyModalOpen}
            />\n\n            `
);


// 6. Replace Accordion area
const accordionStart = '{/* --- Details / Formulations / FAQs --- */}';
const accordionEnd = '{/* 5. You May Also Like (Cross-sell) */}';

const accordionRegex = new RegExp(accordionStart.replace(/[.*+?^\${}()|[\\]\\]/g, '\\$&') + '[\\s\\S]*?(?=' + accordionEnd.replace(/[.*+?^\${}()|[\\]\\]/g, '\\$&') + ')');

content = content.replace(accordionRegex, 
  `<ProductDetailsAccordion product={product} />\n\n      `
);

fs.writeFileSync(path, content);
console.log('Done refactoring');
