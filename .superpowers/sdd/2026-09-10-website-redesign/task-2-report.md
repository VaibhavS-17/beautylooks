# Task 2: Transparent to Solid Navigation Report

## What was implemented
- Added logic in `Navbar.tsx` to detect if the user is on the homepage (`isHome`) and if the page has scrolled (`isScrolled`).
- Defined an `isTransparent` state which is true only when `isHome && !isScrolled`.
- Updated the main `nav` element class to be `absolute` when transparent, and `sticky` when solid.
- Passed down text color classes (`textColorClass`) derived from `isTransparent` to the navigation elements (logo, mobile menu, search, wishlist, cart, account icons) to be white when transparent, and `text-[var(--color-text-main)]` when solid.
- Updated the Cart badge to maintain contrast when transparent (`bg-white text-black`) vs solid.
- Passed the `isTransparent` prop to `NavLinks` and updated `NavLinks.tsx` to properly set text-white when active.

## Files changed
- `src/components/layout/Navbar.tsx`
- `src/components/layout/navbar/NavLinks.tsx`

## Self-review findings
- The changes accurately address the task requirements, making the navbar transparent and absolute-positioned on the homepage at the top, while becoming sticky and solid on scroll or on other pages.
- Tested using `npm run lint` and `npm run build`, which successfully completed with 0 errors.
- Text colors automatically switch to white when the background is transparent, ensuring legibility against the upcoming cinematic hero image.
- We modified `NavLinks.tsx` in addition to `Navbar.tsx` because passing the `isTransparent` prop explicitly is cleaner and more robust than trying to rely on a CSS variable hack to override text colors.

## Fix Report
- **Fixed Layout Jank / CLS**: Reverted the absolute positioning back to sticky so the navbar remains in-flow. This prevents the severe layout jump when scrolling past 50px, and prevents the navbar from obscuring the top announcement bar. The transparent state now simply overlays the upcoming hero section without disrupting the document flow.
- **Fixed Hydration Mismatch & Flash**: Updated useState for isScrolled to evaluate window.scrollY > 10 synchronously during the initial client render. This ensures the client boots with the correct scrolled state, eliminating the visual flash and delayed swap that previously occurred in useEffect. Added suppressHydrationWarning to the nav container to gracefully handle the intentional server/client mismatch when reloading while scrolled down.
