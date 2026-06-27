<p align="center">
  <img src="public/images/brand/logo.png" alt="Beauty Looks Mumbai" width="200" />
</p>

<h1 align="center">Beauty Looks Mumbai</h1>

<p align="center">
  <strong>Simple • Genuine • Affordable</strong>
</p>

<p align="center">
  A premium e-commerce platform for beauty, skincare & cosmetics — built in Mumbai, for Mumbai.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase" alt="Supabase" />
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
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

## ✨ Features

### 🛍️ Storefront
- **Hero Banner** — Full-viewport animated hero with floating sparkle particles and dual CTA buttons.
- **Category Browsing** — Shop by category (Facial Kits, Serums & Oils, Cleansers, Face Masks) with rich image cards.
- **Product Catalog** — Multi-faceted filtering by category, brand, skin type, and price range. Sortable by price, popularity, and date.
- **Product Detail Pages** — Image zoom on hover, tabbed description/reviews/shipping info, related product recommendations, breadcrumb navigation.
- **Search** — Debounced real-time search across the product catalog.

### 🛒 Shopping Experience
- **Cart** — Add/remove items, quantity controls, automatic delivery fee calculation (free above ₹499), persistent client-side state.
- **Cart Drawer** — Slide-in side-panel for quick cart access without leaving the current page.
- **Wishlist** — Save favorite products, move items to cart, heart icon toggle on product cards.
- **Checkout** — Full shipping form with Indian state dropdown, order summary, Razorpay payment integration (ready for connection).

### 👤 User Accounts
- **Login / Register** — Email-based auth forms with Google OAuth placeholder, password visibility toggle.
- **My Account** — Profile info, order history with status badges, saved address management.

### 📝 Content
- **Blog** — Beauty tips & skincare guides with cover images, read-time estimates, and individual post pages.
- **About** — Brand story, mission, values, team section, and trust badges.
- **Contact** — Contact form with subject dropdown, WhatsApp/phone/email info cards.

### 🔧 Admin Dashboard
- **Dashboard Stats** — Live stat cards for total products, orders, revenue, and customers (powered by Zustand store).
- **Order Management** — Interactive recent-orders table with clickable status progression (pending → confirmed → shipped → delivered).
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
| **Payments**     | Razorpay (integration-ready)                                       |
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
├── public/                              # Static assets served by Next.js
│   └── images/
│       ├── brand/
│       │   └── logo.png                 # Brand logo
│       ├── categories/
│       │   ├── cleansers.png            # Category card images
│       │   ├── facial-kits.png
│       │   ├── masks.png
│       │   └── serums.png
│       ├── products/
│       │   ├── cleanser-1.png           # Product images
│       │   ├── facial-kit-1.png
│       │   ├── mask-1.png
│       │   ├── moisturizer-1.png
│       │   ├── scrub-1.png
│       │   ├── serum-1.png
│       │   ├── sunscreen-1.png
│       │   └── toner-1.png
│       └── hero-beauty.png              # Homepage hero banner
│
├── src/
│   ├── app/                             # Next.js App Router (pages & layouts)
│   │   ├── layout.tsx                   # Root layout — fonts, meta, TopBar, Navbar, Footer
│   │   ├── page.tsx                     # Homepage — hero, categories, bestsellers, testimonials
│   │   ├── globals.css                  # Global styles & Soft Glamour design tokens
│   │   ├── favicon.ico
│   │   │
│   │   ├── products/
│   │   │   ├── page.tsx                 # Product catalog — filters, search, grid
│   │   │   └── [slug]/
│   │   │       └── page.tsx             # Product detail — image zoom, tabs, reviews
│   │   │
│   │   ├── cart/
│   │   │   └── page.tsx                 # Shopping cart — items, quantity, summary
│   │   ├── wishlist/
│   │   │   └── page.tsx                 # Wishlist — saved products grid
│   │   ├── checkout/
│   │   │   └── page.tsx                 # Checkout — shipping form + order summary
│   │   │
│   │   ├── blog/
│   │   │   ├── page.tsx                 # Blog listing — card grid
│   │   │   └── [slug]/
│   │   │       └── page.tsx             # Blog post detail
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx                 # About — brand story, values, team
│   │   ├── contact/
│   │   │   └── page.tsx                 # Contact — form + info cards
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx                 # Login page
│   │   ├── register/
│   │   │   └── page.tsx                 # Registration page
│   │   ├── account/
│   │   │   └── page.tsx                 # User dashboard — profile, orders, addresses
│   │   │
│   │   └── admin/
│   │       └── page.tsx                 # Admin dashboard — stats, orders table, quick actions
│   │
│   ├── components/
│   │   └── layout/
│   │       ├── TopBar.tsx               # Slim announcement ribbon
│   │       ├── Navbar.tsx               # Sticky glassmorphic navigation + mobile drawer
│   │       ├── Footer.tsx               # Multi-column footer with newsletter signup
│   │       ├── CartDrawer.tsx           # Slide-in cart side-panel
│   │       └── WhatsAppButton.tsx       # Floating WhatsApp CTA button
│   │
│   └── lib/
│       ├── types.ts                     # TypeScript interfaces (Product, Order, CartItem, etc.)
│       ├── data.ts                      # Mock product data, categories, brands, blog posts
│       ├── store.ts                     # Zustand stores — useCartStore, useWishlistStore
│       └── adminStore.ts               # Zustand store — useAdminStore (dashboard state)
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql       # Full database schema + RLS policies
│
├── package.json                         # Dependencies & scripts
├── tsconfig.json                        # TypeScript configuration
├── next.config.ts                       # Next.js configuration
├── postcss.config.mjs                   # PostCSS (Tailwind CSS plugin)
├── eslint.config.mjs                    # ESLint configuration
└── README.md                            # This file
```

---

## 🗺 Pages & Routes

| Route                      | Page                | Description                                    |
| -------------------------- | ------------------- | ---------------------------------------------- |
| `/`                        | Homepage            | Hero, categories, bestsellers, testimonials, newsletter |
| `/products`                | Product Catalog     | Filterable & searchable product grid           |
| `/products/[slug]`         | Product Detail      | Full product page with reviews & related items |
| `/cart`                    | Shopping Cart       | Cart items with quantity controls & summary    |
| `/wishlist`                | Wishlist             | Saved products with move-to-cart option         |
| `/checkout`                | Checkout            | Shipping form + order summary                  |
| `/blog`                    | Blog Listing        | Beauty tips & skincare guides                  |
| `/blog/[slug]`             | Blog Post           | Individual article with related posts          |
| `/about`                   | About Us            | Brand story, mission, team                     |
| `/contact`                 | Contact             | Contact form + business info cards             |
| `/login`                   | Login               | Email/password + Google OAuth                  |
| `/register`                | Register            | Account creation form                          |
| `/account`                 | My Account          | Profile, orders, addresses                     |
| `/admin`                   | Admin Dashboard     | Stats, order management, quick actions         |

---

## 🗄 Database Schema

The Supabase PostgreSQL schema is defined in `supabase/migrations/001_initial_schema.sql` and includes **10 tables** with full **Row Level Security (RLS)** policies:

| Table            | Description                          | RLS Policy                                    |
| ---------------- | ------------------------------------ | --------------------------------------------- |
| `categories`     | Product categories                   | Public read, admin write                      |
| `brands`         | Product brands                       | Public read, admin write                      |
| `products`       | Product catalog                      | Public read (active only), admin write        |
| `profiles`       | User profiles (linked to auth.users) | Public read, users update own, admin full     |
| `addresses`      | Shipping addresses                   | Users manage own addresses only               |
| `orders`         | Customer orders                      | Users view own, admin full access             |
| `order_items`    | Line items per order                 | Users view own order items, admin full        |
| `reviews`        | Product reviews (1 per user/product) | Public read, users manage own                 |
| `wishlist_items`  | Saved products per user              | Users manage own wishlist only                |
| `blog_posts`     | Blog articles                        | Public read (published), admin full           |

### Custom Enums
- `skin_type_enum`: `all`, `oily`, `dry`, `combination`, `sensitive`
- `order_status_enum`: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`
- `user_role_enum`: `customer`, `admin`

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A [Supabase](https://supabase.com/) project (for production — the app runs with mock data by default)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/rajthakur20/BeautyLooksMumbai.git
cd BeautyLooksMumbai

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root (only needed when connecting to Supabase):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Note**: The app ships with mock data in `src/lib/data.ts` and works fully without Supabase configured. Environment variables are only needed when you integrate the live database.

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
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in Vercel settings.
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
  Made with ❤️ in Mumbai by <strong>Data Matrix Club (DMX)</strong> at RGIT
</p>
