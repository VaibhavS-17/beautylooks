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
