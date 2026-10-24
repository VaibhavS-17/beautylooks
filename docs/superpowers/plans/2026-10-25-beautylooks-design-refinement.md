# BeautyLooks Production-Quality Design Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine BeautyLooks into an art-directed, distinctive, premium beauty experience that honors the genuine Mumbai salon-care brand while eliminating generic AI anti-patterns, fake urgency, and unstyled ghost classes.

**Architecture:** Strengthen the design token layer in `globals.css` with a cohesive warm luxury palette and standard component utilities; eliminate deceptive urgency and fabricated metrics across product surfaces; standardize product cards across the homepage, catalog, and wishlist; elevate typography hierarchy with purposeful serif and sans-serif pairing; and restore broken styles on auth, account, and editorial pages.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, Lucide React, Zustand, Supabase SSR, Razorpay.

**Spec:** USER_REQUEST "BEAUTYLOOKS — Production-Quality Design Refinement"

## Global Constraints
- Preserve all existing routes, database queries, authentication flows, Razorpay checkout, search, filtering, and cart store logic.
- Do not introduce additional dependencies.
- Fix all unstyled ghost classes (`btn-gold`, `btn-outline-gold`, `glass-card`, `text-gold-gradient`, `input-dark`).
- Remove fabricated data: invented in-cart counts, artificial stock urgency flames, and false manufacturing claims.
- Maintain responsive layout integrity across mobile (375px+), tablet, and desktop (1440px+).
- Ensure strict semantic HTML (single `<h1>` per page, appropriate headings, accessible interactive controls).

---

### Task 1: Design System & Token Architecture

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/product/StarRating.tsx`

**Interfaces:**
- Consumes: Tailwind v4 `@theme` directives, existing CSS custom properties.
- Produces: Cohesive warm luxury beauty tokens (`--color-accent`: `#8F6E47`, `--color-accent-hover`: `#785B38`, `--color-primary`: `#FAF8F5`, `--color-secondary`: `#F5F1EB`, `--color-border`: `#E8E2DA`, `--color-text-main`: `#1C1917`, `--color-text-muted`: `#68625B`), standardized button utilities (`.btn-primary`, `.btn-secondary`, `.btn-accent`), backwards-compatible class bridges (`.btn-gold`, `.btn-outline-gold`, `.glass-card`, `.text-gold-gradient`, `.input-dark`), and refined star ratings.

- [ ] **Step 1: Update `globals.css` with refined luxury tokens and component utilities**
Refine `@theme` tokens in `src/app/globals.css`:
```css
@theme {
  --color-background: #ffffff;
  --color-foreground: #1c1917;
  --color-muted: #f5f1eb;
  --color-border: #e8e2da;
  
  --color-primary: #faf8f5;
  --color-primary-dark: #f3efe8;
  --color-secondary: #f4efe9;
  --color-accent: #8f6e47;
  --color-accent-hover: #785b38;
  --color-accent-soft: #f5efe6;
  --color-accent-light: #d6baa0;
  
  --color-text-main: #1c1917;
  --color-text-muted: #68625b;
  --color-brand-dark: #141211;
  
  --font-sans: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-serif: var(--font-playfair), Georgia, serif;
...
```
Add class bridges:
```css
.btn-gold {
  @apply inline-flex items-center justify-center px-6 py-3.5 bg-accent text-white text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-brand-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs;
}

.btn-outline-gold {
  @apply inline-flex items-center justify-center px-6 py-3.5 bg-transparent border border-border text-text-main text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-secondary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed;
}

.glass-card {
  @apply bg-white border border-border rounded-2xl shadow-xs;
}

.text-gold-gradient {
  @apply text-accent font-serif;
}

.input-dark {
  @apply border border-border bg-white text-text-main placeholder:text-text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent rounded-xl transition-colors;
}
```

- [ ] **Step 2: Update `StarRating.tsx` to use semantic token colors**
Replace hardcoded `#CA8A04` in `src/components/product/StarRating.tsx` with `fill-accent text-accent` and `text-accent/30`.

- [ ] **Step 3: Verify build compilation**
Run `npm run build` to confirm CSS and StarRating changes compile without error.

- [ ] **Step 4: Commit design system foundations**
```bash
git add src/app/globals.css src/components/product/StarRating.tsx
git commit -m "style: establish refined luxury beauty tokens and component utilities"
```

---

### Task 2: Homepage Experience & Semantic Hierarchy

**Files:**
- Modify: `src/app/HomeClient.tsx`

**Interfaces:**
- Consumes: `featuredProducts`, `categories`, `blogPosts`, `siteSettings` props.
- Produces: Polished homepage with correct heading hierarchy, elegant concern and category navigation, standardized product cards, and authentic editorial storytelling.

- [ ] **Step 1: Fix heading hierarchy and hero styling**
- Retain the single `<h1>` for `{siteSettings.hero_title}`.
- Change the philosophy section headline from `<h1>` to `<h2>`.
- Remove drop-shadows and replace with clean typography, using `font-serif italic text-accent` for editorial highlights.

- [ ] **Step 2: Refine "Shop by Concern" and "Shop by Category"**
- In "Shop by Concern", replace heavy black gradients with an elegant, warm tinted overlay with smooth hover state.
- In "Shop by Category", replace harsh placeholder text with refined serif presentation.

- [ ] **Step 3: Standardize "Cult Favorites" product cards**
- Remove the animated `🔥 Only 1 left in stock` urgency flame.
- Show clean, honest stock messaging (`Only 1 left in stock` in discreet text without pulsing fire emojis).
- Standardize the card layout: consistent image container (`aspect-[3/4]`), brand name in `text-accent uppercase tracking-widest`, clean title line-clamp, formatted price and sale comparison, and a unified `btn-primary` or `btn-accent` button.
- Remove `bg-[url('/noise.png')] opacity-[0.03]` noise background.

- [ ] **Step 4: Verify homepage rendering**
Check that `HomeClient.tsx` compiles and has valid React markup.

- [ ] **Step 5: Commit homepage refinements**
```bash
git add src/app/HomeClient.tsx
git commit -m "refactor(home): polish editorial hierarchy, product cards, and remove artificial urgency"
```

---

### Task 3: Product Catalog & Category Browsing

**Files:**
- Modify: `src/components/product/ProductGrid.tsx`
- Modify: `src/app/products/ProductsClient.tsx`

**Interfaces:**
- Consumes: Products, categories, and brands from Supabase.
- Produces: Cohesive, responsive product grid with seamless filters and unified card styling.

- [ ] **Step 1: Harmonize `ProductGrid.tsx` cards with homepage aesthetic**
- Align product cards with the homepage: aspect ratio, typography hierarchy, price badges, and buttons.
- Remove `🔥` urgency fire emoji and pulsing animation.
- Replace `style={{ fontFamily: 'Playfair Display, serif' }}` with Tailwind's `font-serif`.
- Ensure "Quick View" and "Add to Cart" affordances are clean, intuitive, and accessible on both touch and mouse devices.

- [ ] **Step 2: Refine `ProductsClient.tsx` filter and search layout**
- Ensure search suggestions dropdown, category pill tabs, and filter drawer feel responsive and polished.
- Use `text-accent` and `bg-secondary` instead of hardcoded ad-hoc styles.

- [ ] **Step 3: Verify products page build**
Run `npm run build` to verify type safety and bundle integrity.

- [ ] **Step 4: Commit catalog refinements**
```bash
git add src/components/product/ProductGrid.tsx src/app/products/ProductsClient.tsx
git commit -m "refactor(products): unify catalog grid cards and remove artificial scarcity"
```

---

### Task 4: Product Detail Page & Purchase Panel

**Files:**
- Modify: `src/components/product/ProductPurchasePanel.tsx`
- Modify: `src/components/product/ProductDetailsAccordion.tsx`
- Modify: `src/app/products/[slug]/ProductDetailClient.tsx`

**Interfaces:**
- Consumes: Product details, reviews, inventory status.
- Produces: Honest, credible, high-conversion product purchasing experience.

- [ ] **Step 1: Eliminate fabricated urgency and fake subscription in `ProductPurchasePanel.tsx`**
- Delete the invented `peopleInCart` calculation (`(hash % 10) + 3`) and "🔥 High demand: Currently in X people's carts".
- Remove the nonfunctional "Subscribe & Save 15%" radio selector that has no subscription infrastructure, and present a clear, confident price display with genuine stock availability and genuine shipping guarantees (e.g. "Free delivery on orders over ₹499 • Dispatched from Mumbai").
- Clean up button styling: primary "Buy Now" and "Add to Cart" with consistent typography and feedback.

- [ ] **Step 2: Clean up claims in `ProductDetailsAccordion.tsx`**
- Remove fabricated claims ("Eco-conscious glass vessel preserves active stability" on boxed/sachet facial kits).
- Replace with authentic salon retail assurances: "100% Genuine product sourced directly from official brand distributors", "Fresh batch guaranteed", "Complimentary consultation available via WhatsApp".
- Refine accordion typography and spacing.

- [ ] **Step 3: Polish `ProductDetailClient.tsx`**
- Standardize the sticky gallery, breadcrumb, and related products layout.

- [ ] **Step 4: Verify product details build**
Run `npm run build` to verify.

- [ ] **Step 5: Commit product detail refinements**
```bash
git add src/components/product/ProductPurchasePanel.tsx src/components/product/ProductDetailsAccordion.tsx src/app/products/[slug]/ProductDetailClient.tsx
git commit -m "refactor(pdp): remove fake urgency/subscription and ground details in authentic salon retail assurances"
```

---

### Task 5: Authentication, About & Account Experience

**Files:**
- Modify: `src/app/login/ClientPage.tsx`
- Modify: `src/app/register/ClientPage.tsx`
- Modify: `src/app/forgot-password/page.tsx`
- Modify: `src/app/reset-password/page.tsx`
- Modify: `src/app/about/ClientPage.tsx`
- Modify: `src/app/wishlist/WishlistClient.tsx`

**Interfaces:**
- Consumes: Supabase auth handlers, wishlist store, user profile.
- Produces: Professional, trustworthy auth and supporting pages with zero unstyled ghost classes.

- [ ] **Step 1: Fix auth pages (`login`, `register`, `forgot-password`, `reset-password`)**
- Remove blurry orbs (`filter blur-[100px] opacity-10`).
- Ensure all inputs use `.input-dark` or crisp border styling with clear labels and focus rings.
- Ensure all action buttons use `.btn-gold` / `.btn-primary` and `.btn-outline-gold` with visible backgrounds and hover states.

- [ ] **Step 2: Refine `about/ClientPage.tsx`**
- Replace arbitrary blur orb and placeholder `Glow` watermark with a clean editorial hero.
- Highlight the authentic story of Beauty Looks Mumbai: genuine salon products, founder Pramod Thakur, direct WhatsApp advisory, and local fast shipping.

- [ ] **Step 3: Refine `WishlistClient.tsx`**
- Unify wishlist cards with the standard product card style.
- Remove `🔥 Only 1 left` fire urgency and `animate-ping`.

- [ ] **Step 4: Verify build and lint**
Run `npm run build` and `npm run lint`.

- [ ] **Step 5: Commit auth, about, and wishlist updates**
```bash
git add src/app/login/ClientPage.tsx src/app/register/ClientPage.tsx src/app/forgot-password/page.tsx src/app/reset-password/page.tsx src/app/about/ClientPage.tsx src/app/wishlist/WishlistClient.tsx
git commit -m "refactor(auth/about): fix button styling, remove blur orbs, and polish editorial layout"
```

---

### Task 6: Final Verification & Design Audit Review

**Files:**
- Inspect and verify all affected files across the repo.

**Steps:**
- [ ] **Step 1: Run production build and type check**
Run `npm run build` and check for any TypeScript or compiler errors.

- [ ] **Step 2: Run linter**
Run `npm run lint` and verify zero errors.

- [ ] **Step 3: Document before-and-after improvements**
Prepare the final executive report covering problems resolved, visual direction implemented, files changed, and verification evidence.
