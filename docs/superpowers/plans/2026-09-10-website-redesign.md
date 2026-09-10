# Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the visual identity of Beautylooks to an Immersive & Modern, Light Mode First design with a cinematic full-screen hero.

**Architecture:** We will strip away heavy backgrounds and thick borders across the application, update the typography to be clean and modern, implement a transparent-to-solid navigation bar for the homepage, restructure the homepage hero into a full-bleed 100vh container, and update the product detail page to a sticky-scroll layout.

**Tech Stack:** Next.js, React, Tailwind CSS v4, Framer Motion (or CSS animations).

**Spec:** `docs/superpowers/specs/2026-09-10-website-redesign-design.md`

## Global Constraints
- Must use Light Mode First theme with crisp whites, off-whites, and stark dark text.
- Must not introduce layout jank or degrade Core Web Vitals.
- Mobile responsiveness must be maintained.

---

### Task 1: Global Theme & CSS Foundations

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx` (if font changes are needed)

**Interfaces:**
- Produces: CSS utility classes and Tailwind overrides for the new minimalist aesthetic.

- [ ] **Step 1: Update globals.css with new aesthetic variables**
```css
/* In src/app/globals.css */
@theme {
  --color-background: #ffffff;
  --color-foreground: #111827;
  --color-muted: #f3f4f6;
  --color-border: #e5e7eb;
}
/* Ensure body uses the clean background and sans-serif font */
body {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}
/* Remove heavy global borders or box-shadows if any */
```

- [ ] **Step 2: Commit global theme changes**
```bash
git add src/app/globals.css
git commit -m "style: implement light mode first aesthetic foundation"
```

---

### Task 2: Transparent to Solid Navigation

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: The `usePathname` hook to detect if we are on the homepage.
- Produces: A Navbar that is transparent and absolute positioned at the top of the homepage, but becomes sticky and solid white upon scrolling or on other pages.

- [ ] **Step 1: Implement transparent state in Navbar**
Update `Navbar.tsx` to accept or calculate an `isTransparent` state based on scroll position (if on homepage).
```tsx
const [isScrolled, setIsScrolled] = useState(false);
const pathname = usePathname();
const isHome = pathname === '/';

useEffect(() => {
  const handleScroll = () => setIsScrolled(window.scrollY > 50);
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

const navClasses = `fixed w-full z-50 transition-colors duration-300 ${
  isHome && !isScrolled ? 'bg-transparent text-white' : 'bg-white text-gray-900 border-b border-gray-100'
}`;
```

- [ ] **Step 2: Commit Navbar changes**
```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: implement transparent to solid navbar transition"
```

---

### Task 3: Cinematic Full-Screen Hero

**Files:**
- Modify: `src/app/HomeClient.tsx`

**Interfaces:**
- Consumes: Navbar's transparent layout.
- Produces: A full-bleed 100vh hero section.

- [ ] **Step 1: Rebuild the hero section**
Replace the current hero in `HomeClient.tsx` with a 100vh container.
```tsx
<div className="relative w-full h-screen overflow-hidden">
  {/* Background Media */}
  <div className="absolute inset-0 bg-gray-900">
    <img src="/path/to/cinematic-lifestyle.jpg" className="w-full h-full object-cover opacity-70" alt="Hero" />
  </div>
  {/* Content */}
  <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">Discover Your Glow</h1>
    <p className="text-lg md:text-2xl font-light mb-8 max-w-2xl">Premium skincare for a modern lifestyle.</p>
    <Link href="/products" className="px-8 py-4 bg-white text-black font-semibold uppercase tracking-wider hover:bg-gray-100 transition">
      Shop Collection
    </Link>
  </div>
</div>
```

- [ ] **Step 2: Commit HomeClient changes**
```bash
git add src/app/HomeClient.tsx
git commit -m "feat: build cinematic full screen hero"
```

---

### Task 4: Modernize Product Grids

**Files:**
- Modify: `src/components/product/ProductGrid.tsx`
- Modify: (If exists) `ProductCard` component within the grid.

**Interfaces:**
- Produces: Borderless, edge-to-edge image product cards with hover animations.

- [ ] **Step 1: Remove borders and update hover states**
In the product card mapping in `ProductGrid.tsx`, ensure the container has no borders and the image fills the width.
```tsx
<div className="group flex flex-col cursor-pointer">
  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-4">
    <img src={product.image} className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" alt={product.name} />
  </div>
  <h3 className="text-sm font-semibold text-gray-900">{product.name}</h3>
  <p className="text-sm text-gray-500 mt-1">${product.price}</p>
</div>
```

- [ ] **Step 2: Commit Product Grid changes**
```bash
git add src/components/product/ProductGrid.tsx
git commit -m "style: modernize product grids and cards"
```

---

### Task 5: Sticky Product Detail Page

**Files:**
- Modify: `src/app/products/[slug]/ProductDetailClient.tsx`
- Modify: `src/components/product/ProductGallery.tsx`
- Modify: `src/components/product/ProductPurchasePanel.tsx`

**Interfaces:**
- Consumes: The modernized component styling.
- Produces: A split-screen product page where images scroll and the purchase panel stays pinned.

- [ ] **Step 1: Implement CSS Grid/Flex for Sticky Layout**
Update `ProductDetailClient.tsx` wrapper:
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
    {/* Left Column: Scrollable Image Gallery */}
    <div className="mb-10 lg:mb-0">
      <ProductGallery images={product.images} />
    </div>
    {/* Right Column: Sticky Purchase Panel */}
    <div className="lg:sticky lg:top-24 self-start">
      <ProductPurchasePanel product={product} />
    </div>
  </div>
</div>
```

- [ ] **Step 2: Commit Product Detail changes**
```bash
git add src/app/products/[slug]/ProductDetailClient.tsx
git commit -m "feat: implement sticky scroll product detail layout"
```

---

### Task 6: Simplify Cart & Checkout Styles

**Files:**
- Modify: `src/components/layout/CartDrawer.tsx`
- Modify: Checkout files if necessary.

**Interfaces:**
- Produces: A cleaner, whitespace-heavy cart drawer without heavy bounding boxes.

- [ ] **Step 1: Clean up CartDrawer styles**
Remove heavy backgrounds or thick borders inside the drawer. Use thin dividers (`divide-y divide-gray-100`).
```tsx
<div className="flex flex-col h-full bg-white">
  {/* Header */}
  <div className="px-4 py-6 border-b border-gray-100">...</div>
  {/* Item List */}
  <div className="flex-1 overflow-y-auto px-4 divide-y divide-gray-100">
     {/* Cart Items with minimal padding */}
  </div>
  {/* Footer with clean CTA */}
  <div className="border-t border-gray-100 px-4 py-6">
    <button className="w-full py-4 bg-black text-white uppercase tracking-wider">Checkout</button>
  </div>
</div>
```

- [ ] **Step 2: Commit CartDrawer changes**
```bash
git add src/components/layout/CartDrawer.tsx
git commit -m "style: simplify cart drawer UI"
```
