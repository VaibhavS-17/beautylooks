# Beautylooks Full Website Redesign Specification

## 1. Overview
A complete visual and architectural overhaul of the Beautylooks e-commerce website. The primary goal is to modernize the visual identity, adopting an "Immersive & Modern" aesthetic with a "Light Mode First" foundation and a "Cinematic Full-Screen" hero experience.

## 2. Core Aesthetic
*   **Vibe:** Immersive, modern, premium, and clean.
*   **Theme:** Light Mode First. Crisp whites (`#FFFFFF`), subtle off-whites (`#FAFAFA`), and stark black/dark gray typography for high contrast.
*   **Typography:** Modern, geometric sans-serif (e.g., Inter or similar) with tight tracking on bold headings and highly legible body copy.
*   **Imagery:** Full-bleed, edge-to-edge product and lifestyle photography.

## 3. Architecture & Global Layout
*   **Navigation (`Navbar`):** Implement a `transparent` variant for the homepage that sits over the cinematic hero. It will transition to a solid white background with black text upon scrolling or when navigating to other routes.
*   **CSS / Tailwind:** Overhaul `globals.css` and Tailwind configurations to strip out heavy backgrounds, replacing them with the new minimalist palette.
*   **Animations:** Introduce lightweight, scroll-triggered fade-in and slide-up animations across the application to enhance the premium feel.

## 4. Homepage Design
*   **Hero Section (`HomeClient.tsx`):** Replace the current hero with a `100vh` full-bleed container. It will feature a high-quality background (image/video) with a subtle dark overlay to ensure text legibility and a prominent CTA.
*   **Product Grids:** Overhaul product cards to use larger imagery, remove borders, and add elegant hover states (e.g., secondary image reveal).

## 5. Product & Shopping Flow
*   **Product Detail Page (`ProductDetailClient.tsx`):** Redesign the layout to feature a large, immersive image gallery. The product details and "Add to Cart" panel will be pinned (sticky) to the side, ensuring the CTA remains visible during scrolling.
*   **Cart & Checkout:** Strip away heavy visual noise (dark boxes, thick borders). Rely on ample whitespace and delicate dividers.
*   **Form Elements:** Modernize input fields with clean, minimal borders and subtle focus states.

## 6. Testing & Validation
*   Ensure the transparent-to-solid navigation transition works smoothly across all screen sizes.
*   Verify that scroll animations perform well without causing layout jank or layout shifts (Core Web Vitals).
*   Test the sticky product detail layout on both desktop and mobile viewports.
