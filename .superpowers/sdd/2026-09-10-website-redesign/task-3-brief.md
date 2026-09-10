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

