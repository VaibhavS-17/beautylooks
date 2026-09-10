# Task 3: Cinematic Full-Screen Hero Report

## What was implemented
Rebuilt the hero section in HomeClient.tsx to feature a 100vh full-bleed hero container. Replaced the dynamic image carousel structure with the exact layout specified in the task brief, utilizing an img tag for a full screen background, overlaid with the cinematic title, description, and "Shop Collection" call-to-action button. 

## Files changed
- src/app/HomeClient.tsx

## Self-review findings
- The layout is precisely as requested in the task brief.
- HomeClient.tsx no longer uses Next.js Image component or dynamic siteSettings for the hero section; this complies exactly with the requested specifications but removes dynamic CMS functionality.
- Lint verified without fatal errors.
- The HomeClient.tsx layout utilizes w-full h-screen and relative positioning which allows the background media to correctly size itself and the transparent navbar to float over it seamlessly.

## Fixes Applied
- **Critical**: Restored 
ext/image with priority for the background media to preserve Core Web Vitals and prevent layout jank, removing the static img tag.
- **Important**: Restored dynamic CMS bindings for siteSettings.hero_title, siteSettings.hero_description, siteSettings.hero_button_link, and siteSettings.hero_button_text.
- **Important**: Restored mobile-specific image rendering logic using heroMobileImageUrl.
- **Minor**: Replaced h-screen with h-[100dvh] for better mobile address bar behavior.
