# BeautyLooks Mumbai — Implementation Plan

Compiled from the 4-agent audit (Backend & Server Actions, Storefront Pages, Layout & Design System, Database & Admin). 126 issues found across the four reports. This plan reorders them by **actual risk and dependency**, not by which auditor found them, so fixing in order makes sense.

## How to use this

Work top to bottom. Phase 0 items are things that can lose money, leak data, or corrupt orders — fix these before touching anything else, including new features. Each item lists the file(s) involved and the concrete fix, not just the symptom.

---

## Audit summary

| Domain | 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low | Total |
|---|---|---|---|---|---|
| Backend & Server Actions | 6 | 8 | 12 | 9 | 35 |
| Storefront Pages | 3 | 9 | 15 | 12 | 39 |
| Layout & Design System | 3 | 7 | 10 | 8 | 28 |
| Database & Admin | 2 | 7 | 9 | 6 | 24 |
| **Total** | **14** | **31** | **46** | **35** | **126** |

---

## Phase 0 — Security & data-integrity blockers

These are the items where a single exploit or race condition costs real money or exposes data. Do these first, in this order.

- [ ] **Confirm `profiles.is_admin` self-escalation is actually closed.** Migration `001` allowed users to update their own `is_admin` via the permissive `auth.uid() = id` UPDATE policy; `003_security_fixes.sql` adds an explicit deny. Don't assume — run a test as a non-admin user attempting `UPDATE profiles SET is_admin = true WHERE id = auth.uid()` against production/staging and confirm it's rejected.
- [ ] **Webhook signature verification** (`src/app/api/webhooks/route.ts`). Currently accepts any POST with no HMAC check, no IP allowlist, no replay protection. Add signature verification against whatever provider is calling it before processing any payload.
- [ ] **Stock race condition** (`src/app/actions/orderActions.ts`, `createOrder`). Read-then-write pattern (`SELECT stock` → check → separate `UPDATE`) allows overselling under concurrent orders. Replace with a single atomic Postgres function: `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1 RETURNING stock`, and treat 0 rows returned as "out of stock."

- [ ] **`verifyPayment` doesn't actually check admin status** — only calls `auth.getUser()`, not the `profiles.is_admin` flag. If RLS is ever misconfigured, any logged-in user could verify payments. Add the explicit `is_admin` check (and extract it into one shared helper — it's currently copy-pasted across every admin action).
- [ ] **In-memory rate limiting is a no-op in production** (`src/lib/rate-limit.ts`). The `Map`-based limiter resets on every cold start and isn't shared across serverless instances — it's not actually limiting anything. Replace with Upstash Redis (or a Supabase table-based counter) for: login, password reset, back-in-stock subscribe, and order creation.
- [ ] **No route-level auth protection.** `middleware.ts` refreshes the session but never redirects unauthenticated users away from `/admin`, `/account`, `/checkout` — protection is entirely page-level, meaning the URL itself is reachable. Add matcher-based redirects in middleware for these path prefixes.
- [ ] **HTML injection in transactional emails** (`src/lib/emailService.ts`). `product.name` (line ~140–160) is interpolated directly into email HTML with no escaping — a crafted product name becomes stored XSS in the admin's inbox. Sanitize/escape before interpolation.
- [ ] **Missing DB-level `CHECK` constraints** that currently only exist (partially) in app code:
  - `products.stock >= 0` — direct SQL updates can currently push stock negative.
  - `reviews.rating BETWEEN 1 AND 5`.
  - `discount_codes.discount_percent > 0 AND discount_percent <= 100` — admin can currently create a 200% discount with no guard.
- [ ] **`orders.status` is free-text, not an enum.** No constraint stops it from being set to an arbitrary string, and `updateOrderStatus` has no state-machine validation — an admin action (or bug) can move an order from `delivered` back to `payment_verifying`. Convert to a Postgres `ENUM` and add explicit allowed-transition checks in `adminActions.ts`.
- [ ] **`order_items.product_id` has no `ON DELETE` behavior set for a deleted product.** Deleting a product referenced in an existing order will throw a raw FK violation instead of failing gracefully. Either switch products to soft-delete (`is_active = false`, which the schema already supports) or add `ON DELETE SET NULL` + a "deleted product" placeholder in the UI.
- [ ] **Server actions swallow errors generically** (`catch (error) { return { error: 'Something went wrong' } }` in `orderActions.ts` and others). Add structured logging (even `console.error` with context is better than nothing pre-Sentry) so production issues are debuggable.

---

## Phase 1 — Functional bugs blocking real usage

These aren't security issues, but they're either broken features customers will hit or revenue left on the table.

- [ ] **Discount codes exist but can't be used.** `discount_codes` table + `createDiscountCode` action exist, but checkout (`src/app/checkout/page.tsx`) has no "Apply Coupon" field at all. Wire it up — this is the single biggest "why did we build this" gap in the audit.
- [ ] **`InvoicePrintView.tsx` is fully built and completely unused.** No page links to it. Add a "Download Invoice" action on the account order history and/or admin order detail view.
- [ ] **Wishlist is localStorage-only despite a `wishlist_items` table existing in the DB.** Wishlist is lost on logout/device change. Sync `useWishlistStore` to Supabase for logged-in users (keep localStorage as the guest fallback, merge on login).
- [ ] **Review "purchased" check is case-sensitive** (`reviewActions.ts`, `submitReview`): compares against `'delivered'` but a stored status of `'Delivered'` fails the check silently, blocking legitimate reviews. Normalize case in the query or fix status casing at the source once the ENUM (Phase 0) lands.

- [ ] **Broken breadcrumb → filter link.** Product detail breadcrumbs link to `/products?category={slug}`, but the products page doesn't read that query param to pre-filter. Fix `/products/page.tsx` to hydrate filter state from the URL (this also fixes "filters reset on refresh," a separate reported issue).
- [ ] **No stock check before "Move to Cart" from wishlist** — can add an out-of-stock item straight to cart.
- [ ] **No stock check / debounce on cart quantity changes**, and no loading state on "Add to Cart" — both allow double-submits / adding negative or absurd quantities. Add `quantity > 0` and an upper bound tied to actual stock in `useCartStore`.
- [ ] **Google OAuth fails silently** if the redirect URL isn't configured in Supabase — surface an actual error state on `/login` instead of nothing happening.
- [ ] **Password confirmation only validated client-side** in `auth.ts` — add the server-side check too.

---

## Phase 2 — Admin dashboard overhaul

The admin panel works for a tiny catalog but won't scale, and several built features (recharts, audit log table) are sitting unused.

- [ ] **Split the single `src/app/admin/page.tsx` monolith** into route-based sub-pages/components (Dashboard, Orders, Products, Discounts, Blog, Customers) — it's currently one very large file covering everything.
- [ ] **Add pagination everywhere in admin**: orders list, products list, reviews. All currently fetch every row.
- [ ] **Combine the 4 separate dashboard-stat queries into one RPC/view** instead of 4 round trips per page load.
- [ ] **Add confirmation dialogs** before: order status changes, product/category delete. Right now these are one accidental click away from irreversible state changes.
- [ ] **Add search/filter/date-range** to the orders and products admin tables.
- [ ] **Build the discount code management UI** — codes can be created via the action but there's no admin screen to view/edit/deactivate them.
- [ ] **Build blog post admin CRUD** — `blog_posts` table exists, posts are queried on the storefront, but there's no way to create/edit one short of raw SQL.
- [ ] **Wire up `admin_activity_log`** — the table was added in `002_admin_features.sql` but nothing ever writes to it. Either use it (log admin mutations) or drop it.
- [ ] **Surface the low-stock materialized view** (added in `008_performance_and_inventory.sql`) somewhere in the admin UI — it exists in the DB but isn't shown anywhere.
- [ ] **Add CSV/Excel export** for orders and products.
- [ ] **Add an order detail view** in admin (line items, shipping address, payment history) — currently only a flat status-update row per order.
- [ ] **Add analytics charts** using `recharts`, which is already a dependency but unused — sales over time, top products.

---

## Phase 3 — Accessibility & design-system consistency

Mostly mechanical fixes, but they compound (a modal with no focus trap is both an accessibility bug and a usability bug).

- [ ] **Add focus traps + `Escape`-to-close + `role="dialog" aria-modal="true"`** to `CartDrawer.tsx`, the mobile nav drawer in `Navbar.tsx`, and `NotifyMeModal.tsx`. None of the three currently trap focus, so keyboard/screen-reader users can tab into page content behind an open overlay.
- [ ] **Add `prefers-reduced-motion` support globally** — no media query for it exists anywhere in `globals.css` or the individual animated components.
- [ ] **Add `focus-visible` styles** to `.btn-primary` / `.btn-secondary` / `.btn-tertiary` — buttons currently have no visible focus ring.
- [ ] **Replace hardcoded colors with design tokens** across `Navbar.tsx`, `Footer.tsx`, and `MobileBottomNav.tsx` (`text-[#C88E75]`, `bg-red-500`, `bg-white`, etc. instead of the existing `--color-*` variables). Also define the missing token categories: `--radius-*`, `--shadow-*`, `--space-*`.
- [ ] **Add missing ARIA**: hamburger button `aria-label` + `aria-expanded`, search input `<label>`, user-menu `role="menu"`/`role="menuitem"`, cart count `aria-label="Cart, N items"`, star ratings `aria-label="4 out of 5 stars"` instead of raw ★ characters, tab panels on PDP using real `role="tablist"/tab/tabpanel"` instead of `div onClick`.
- [ ] **Add a skip-to-content link** in `layout.tsx` — currently absent.
- [ ] **Keyboard navigation**: image gallery thumbnails on PDP, and the FAQ accordion (currently `onClick`-only, no Enter/Space support).
- [ ] **Break up `Navbar.tsx` (~700 lines)** into `NavLinks`, `MobileDrawer`, `SearchBar`, `UserMenu`, `CartButton`.
- [ ] **Fix `z-index` stacking** between `CartDrawer` (z-50) and other overlays like `NotifyMeModal`, plus overlap risk between `ScrollToTop`, the WhatsApp button, and `MobileBottomNav` on small screens.

---

## Phase 4 — Storefront UX & SEO polish

- [ ] **Sticky "Add to Cart"** on the product detail page for mobile — currently scrolls out of view.
- [ ] **Touch targets to 44×44px minimum**: quantity selector buttons (currently 28×28), mobile filter toggle (currently 32×32).
- [ ] **Structured data**: `Product` schema on the catalog and PDP, `FAQPage` schema on `/faq`.
- [ ] **Filter UX on `/products`**: reflect filters in the URL (also fixes the breadcrumb bug above), add a "Clear all filters" action, active-filter chips, and a "Showing X of Y products" count.
- [ ] **Blog**: add pagination, search/category filter, and social share buttons on posts.
- [ ] **PDP additions**: "Recently viewed products," low-stock indicator ("Only 3 left"), share button (WhatsApp/copy link).
- [ ] **Fix the hydration mismatch** in the homepage hero — the sparkle animation uses `Math.random()` for positioning, which differs between server and client render. Seed it deterministically or move it to a client-only effect.
- [ ] **Contact form**: add a honeypot field (no CAPTCHA needed yet) since it currently has zero spam protection, and reset the form + show a persistent success state after submit.
- [ ] **Login**: redirect back to the page the user came from after login, instead of always to `/`.

---

## Phase 5 — Cleanup & decisions needed

Two things need a decision before anyone spends time on them:

- [x] **Razorpay vs Manual UTR**: The app previously had mixed UTR/manual tracking. **Decision Made:** We are exclusively using Razorpay for all payments (including UPI via Razorpay). Manual UTR verification has been stripped out to keep operations clean and rely on webhook/HMAC verification.
- [ ] **Hard delete vs. soft delete** for products/categories — several bugs above (orphaned order_items, orphaned products on category delete) trace back to hard deletes. Standardizing on `is_active = false` soft-deletes (the column already exists) fixes multiple issues at once rather than patching each one individually.

Smaller cleanup, do opportunistically:
- [ ] Add `version` + `migrate` to the Zustand `persist` config for cart/wishlist (schema changes currently risk a hydration crash for returning users).
- [ ] Add `sku` and `weight` columns to `products` (needed for inventory + shipping calculation later).
- [ ] Replace the hardcoded copyright year in `Footer.tsx` with `new Date().getFullYear()`.
- [ ] Add `loading="lazy"` to product grid images and a `sizes` attribute to category images.

---

## Suggested sequencing

Phase 0 is non-negotiable and should happen before any new feature work, including the coupon-code fix in Phase 1 — you don't want to launch a discount feature on top of an unpatched stock race condition. After that, Phases 1–4 can run in parallel across different people/sessions since they touch mostly separate files (backend actions vs. admin vs. layout components vs. storefront pages). Phase 5's two decisions should be made early since they affect how you approach the delete-related bugs in Phase 0/1.
