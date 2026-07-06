<p align="center">
  <img src="public/images/brand/logo.png" alt="Beauty Looks Mumbai" width="200" />
</p>

<h1 align="center">Beauty Looks Mumbai</h1>

<p align="center">
  <strong>Simple • Genuine • Affordable</strong>
</p>

<p align="center">
  A premium, production-grade e-commerce platform for beauty & skincare — built in Mumbai, for Mumbai.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/UPI-Zero_Fee-FF9900?logo=googlepay" alt="UPI" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Technical Highlights](#-technical-highlights)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Design System — "Soft Glamour"](#-design-system--soft-glamour)
- [Project Structure](#-project-structure)
- [Pages & Routes](#-pages--routes)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Scripts](#-scripts)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Beauty Looks Mumbai** is a full-featured, production-grade e-commerce storefront for beauty and skincare products. It is built with the Next.js 16 App Router, styled with a bespoke "Soft Glamour" design system, and backed by Supabase (PostgreSQL + RLS) for secure data access.

The platform is designed and maintained by the **Data Matrix Club (DMX)** at Rajiv Gandhi Institute of Technology (RGIT).

---

## 🧠 Technical Highlights

> These are the engineering decisions that set this project apart from typical e-commerce templates.

| Feature | Detail |
|---|---|
| **Zero-Fee UPI Payments** | Custom-built payment system using UPI deep-linking (`upi://pay`) and dynamic QR codes — bypasses payment gateways entirely, saving 2% on every transaction. |
| **Device-Adaptive Checkout** | Auto-detects mobile vs. desktop: mobile users get a native UPI Intent button (opens GPay/PhonePe directly), desktop users get a scannable QR code. |
| **UTR-Based Reconciliation** | Users submit their 12-digit UTR (Transaction Reference) after paying. Orders are held in `payment_verifying` status until admin confirms against bank statements. |
| **Row Level Security (RLS)** | Every table in Supabase has granular RLS policies — users can only access their own orders, addresses, and wishlists. Admin-only write access on products/categories. |
| **Server-Side Price Validation** | Order totals are re-calculated on the server from database prices to prevent client-side price tampering. |
| **Optimistic Stock Management** | Stock is decremented when UTR is submitted to reserve items, preventing overselling during verification. |
| **Dynamic SEO & Open Graph** | Product pages generate dynamic `og:title`, `og:image`, and `og:description` metadata for rich previews when shared on WhatsApp, Twitter, and social media. |
| **Zustand State Architecture** | Cart, Wishlist, and Admin Dashboard all use independent Zustand stores with `persist` middleware for cross-session state. |

---

## ✨ Features

### 🛍️ Storefront
- **Hero Banner** — Full-viewport animated hero with floating sparkle particles and dual CTA buttons.
- **Category Browsing** — Shop by category (Facial Kits, Serums & Oils, Cleansers, Face Masks) with rich image cards.
- **Product Catalog** — Multi-faceted filtering by category, brand, skin type, and price range. Sortable by price, popularity, and date.
- **Product Detail Pages** — Image zoom, tabbed description/reviews/shipping info, related product recommendations, breadcrumbs.
- **Search** — Debounced real-time search across the product catalog.

### 🛒 Shopping Experience
- **Cart** — Add/remove items, quantity controls, automatic delivery fee calculation (free above ₹499), persistent client-side state.
- **Cart Drawer** — Slide-in side-panel for quick cart access without leaving the current page.
- **Wishlist** — Save favorite products, move items to cart, heart icon toggle on product cards.
- **Checkout** — Full shipping form with saved addresses, order summary, and zero-fee UPI payment integration.

### 💳 Zero-Fee UPI Payment System
- **Mobile** — UPI Intent deep-linking opens any installed UPI app (Google Pay, PhonePe, Paytm, BHIM).
- **Desktop** — Dynamic QR code generation using `qrcode.react` for scan-to-pay.
- **Reconciliation** — User-submitted UTR verification with admin approval workflow.

### 👤 User Accounts
- **Login / Register** — Email-based auth with Google OAuth, password visibility toggle.
- **My Account** — Profile info, order history with status badges, saved address management (CRUD).
- **Product Reviews** — Purchase-verified reviews with star ratings (only buyers can review).

### 📝 Content
- **Blog** — Beauty tips & skincare guides with cover images, read-time estimates, and individual post pages.
- **About** — Brand story, mission, values, team section, and trust badges.
- **Contact** — Contact form with subject dropdown, WhatsApp/phone/email info cards.

### 🔧 Admin Dashboard
- **Dashboard Stats** — Live stat cards for total products, orders, revenue, and customers.
- **Order Management** — Interactive orders table with clickable status progression (pending → confirmed → shipped → delivered).
- **UTR Verification** — View submitted UTRs for `payment_verifying` orders and approve/reject.
- **Quick Actions** — Add product, create discount codes, and management shortcuts.

### 🎨 UI/UX
- **Glassmorphic Navbar** — Sticky header with backdrop blur, responsive mobile drawer with staggered animations.
- **Slim Announcement Bar** — Ultra-thin top ribbon with shipping info and phone number.
- **WhatsApp Floating Button** — Fixed bottom-right CTA linking to pre-filled WhatsApp message.
- **Responsive Design** — Fully mobile-first, works seamlessly on phones, tablets, and desktops.
- **Micro-Animations** — Hover effects, slide-up reveals, pulse animations, and smooth transitions throughout.

---

## 🛠 Tech Stack

| Layer            | Technology                                                         |
| ---------------- | ------------------------------------------------------------------ |
| **Framework**    | [Next.js 16](https://nextjs.org/) (App Router, React 19)          |
| **Language**     | [TypeScript 5](https://www.typescriptlang.org/) (strict mode)     |
| **Styling**      | [Tailwind CSS 4](https://tailwindcss.com/) + custom design tokens |
| **State**        | [Zustand 5](https://zustand-demo.pmnd.rs/) (Cart, Wishlist, Admin)|
| **Icons**        | [Lucide React](https://lucide.dev/)                               |
| **Fonts**        | Google Fonts — Playfair Display (headings), Inter (body)           |
| **Database**     | [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security)|
| **Payments**     | Custom Zero-Fee UPI (Intent + QR Code)                             |
| **QR Codes**     | [qrcode.react](https://www.npmjs.com/package/qrcode.react)        |
| **Deployment**   | [Vercel](https://vercel.com/)                                      |

---

## 🎨 Design System — "Soft Glamour"

The entire UI is built on a custom theme defined in `src/app/globals.css`:

| Token              | Value       | Usage                                |
| ------------------ | ----------- | ------------------------------------ |
| `--color-primary`      | `#FAF9F6`   | Warm cream background                |
| `--color-primary-dark` | `#F5F1E8`   | Slightly darker cream for sections   |
| `--color-secondary`    | `#FDF8F5`   | Soft blush cards & panels            |
| `--color-accent`       | `#C88E75`   | Rose gold — buttons, links, accents  |
| `--color-accent-light` | `#E8CDBF`   | Light rose gold — borders, hovers    |
| `--color-text-main`    | `#2C1E16`   | Deep espresso — primary text         |
| `--color-text-muted`   | `#6B5C52`   | Soft brown — secondary text          |
| `--color-border`       | `#E8E2D9`   | Warm subtle borders                  |

### Pre-built Component Classes
- `btn-primary` — Solid dark button with rose-gold hover
- `btn-secondary` — Outlined rose-gold button
- `btn-tertiary` — Soft blush button with subtle border
- `card-container` — Rounded card with soft shadow and hover lift
- `section-divider` — Decorative rose-gold gradient line
- `subtitle` — Uppercase tracked label in accent color

---

## 📂 Project Structure

```
BeautyLooksMumbai/
├── public/images/                       # Static assets (brand, categories, products, hero)
├── src/
│   ├── app/                             # Next.js App Router
│   │   ├── layout.tsx                   # Root layout — fonts, meta, TopBar, Navbar, Footer
│   │   ├── page.tsx                     # Homepage — hero, categories, bestsellers
│   │   ├── globals.css                  # Global styles & Soft Glamour design tokens
│   │   ├── products/
│   │   │   ├── page.tsx                 # Product catalog — filters, search, grid
│   │   │   └── [slug]/
│   │   │       ├── page.tsx             # Product detail — dynamic SEO, reviews
│   │   │       └── ProductDetailClient.tsx
│   │   ├── cart/page.tsx                # Shopping cart
│   │   ├── wishlist/page.tsx            # Wishlist
│   │   ├── checkout/page.tsx            # Checkout — UPI Intent + QR Code payment
│   │   ├── blog/                        # Blog listing & posts
│   │   ├── about/page.tsx               # About — brand story, values, team
│   │   ├── contact/page.tsx             # Contact — form + info cards
│   │   ├── login/page.tsx               # Login
│   │   ├── register/page.tsx            # Registration
│   │   ├── account/page.tsx             # User dashboard — profile, orders, addresses
│   │   ├── admin/page.tsx               # Admin dashboard — stats, orders, UTR verification
│   │   └── actions/
│   │       └── orderActions.ts          # Server actions — UPI order creation, UTR verification
│   ├── components/layout/
│   │   ├── TopBar.tsx                   # Announcement ribbon
│   │   ├── Navbar.tsx                   # Sticky glassmorphic navigation
│   │   ├── Footer.tsx                   # Multi-column footer
│   │   ├── CartDrawer.tsx               # Slide-in cart panel
│   │   └── WhatsAppButton.tsx           # Floating WhatsApp CTA
│   └── lib/
│       ├── types.ts                     # TypeScript interfaces
│       ├── data.ts                      # Utility functions (formatPrice, getDiscountPercent)
│       ├── store.ts                     # Zustand stores — Cart, Wishlist
│       └── adminStore.ts               # Zustand store — Admin Dashboard
├── supabase/migrations/                 # Database schema + RLS policies
├── package.json
└── README.md
```

---

## 🗺 Pages & Routes

| Route                      | Page                | Description                                    |
| -------------------------- | ------------------- | ---------------------------------------------- |
| `/`                        | Homepage            | Hero, categories, bestsellers, testimonials    |
| `/products`                | Product Catalog     | Filterable & searchable product grid           |
| `/products/[slug]`         | Product Detail      | Full product page with reviews & dynamic SEO   |
| `/cart`                    | Shopping Cart       | Cart items with quantity controls & summary    |
| `/wishlist`                | Wishlist             | Saved products with move-to-cart option         |
| `/checkout`                | Checkout            | UPI payment — mobile intent + desktop QR       |
| `/blog`                    | Blog Listing        | Beauty tips & skincare guides                  |
| `/blog/[slug]`             | Blog Post           | Individual article with related posts          |
| `/about`                   | About Us            | Brand story, mission, team                     |
| `/contact`                 | Contact             | Contact form + business info cards             |
| `/login`                   | Login               | Email/password + Google OAuth                  |
| `/register`                | Register            | Account creation form                          |
| `/account`                 | My Account          | Profile, orders, addresses                     |
| `/admin`                   | Admin Dashboard     | Stats, order management, UTR verification      |

---

## 🗄 Database Schema

The Supabase PostgreSQL schema includes **10 tables** with full **Row Level Security (RLS)** policies:

| Table            | Description                          | RLS Policy                                    |
| ---------------- | ------------------------------------ | --------------------------------------------- |
| `categories`     | Product categories                   | Public read, admin write                      |
| `brands`         | Product brands                       | Public read, admin write                      |
| `products`       | Product catalog                      | Public read (active only), admin write        |
| `profiles`       | User profiles (linked to auth.users) | Public read, users update own, admin full     |
| `addresses`      | Shipping addresses                   | Users manage own addresses only               |
| `orders`         | Customer orders + UPI UTR            | Users view own, admin full access             |
| `order_items`    | Line items per order                 | Users view own order items, admin full        |
| `reviews`        | Product reviews (1 per user/product) | Public read, users manage own                 |
| `wishlist_items`  | Saved products per user              | Users manage own wishlist only                |
| `blog_posts`     | Blog articles                        | Public read (published), admin full           |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A [Supabase](https://supabase.com/) project

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rajthakur20/BeautyLooksMumbai.git
cd BeautyLooksMumbai

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# UPI Payment (Zero-Fee)
MERCHANT_UPI_VPA=your-upi-id@bank
MERCHANT_BUSINESS_NAME=Beauty Looks Mumbai

# Razorpay (Legacy — optional fallback)
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
```

---

## 📜 Scripts

| Command          | Description                                |
| ---------------- | ------------------------------------------ |
| `npm run dev`    | Start development server (hot reload)      |
| `npm run build`  | Create optimized production build          |
| `npm run start`  | Serve the production build locally         |
| `npm run lint`   | Run ESLint checks                          |

---

## 🌐 Deployment

This project is optimized for **Vercel** deployment:

1. Push your code to GitHub.
2. Import the repository in the [Vercel Dashboard](https://vercel.com/new).
3. Add all environment variables in Vercel settings.
4. Deploy — Vercel auto-detects Next.js and handles the build.

For the Supabase database:
1. Create a new project at [supabase.com](https://supabase.com).
2. Run the migration file (`supabase/migrations/001_initial_schema.sql`) in the Supabase SQL Editor.
3. RLS policies are automatically applied with the migration.

---

## 🤝 Contributing

This project is maintained by the **Data Matrix Club (DMX)** at RGIT. Contributions are welcome!

### Guidelines
- Use **TypeScript** strictly — avoid `any`.
- Follow the **Soft Glamour** design system — use CSS variables, not hardcoded colors.
- Keep components **small and modular**.
- Ensure all pages are **mobile-responsive**.
- Test your changes with `npm run build` before committing.

### Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📞 Contact

- **Phone**: [8879655807](tel:+918879655807)
- **WhatsApp**: [Chat with us](https://wa.me/918879655807)
- **Email**: hello@beautylooksmumbai.com
- **Instagram**: [@beauty.looks.mumbai](https://instagram.com/beauty.looks.mumbai)

---

## 📄 License

© 2026 Beauty Looks Mumbai. All rights reserved.

---

<p align="center">
  Made with ❤️ in Mumbai
</p>
