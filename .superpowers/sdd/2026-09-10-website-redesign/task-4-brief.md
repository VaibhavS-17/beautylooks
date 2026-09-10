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

