### Task 5: Sticky Product Detail Page

**Files:**
- Modify: `src/app/products/[slug]/ProductDetailClient.tsx`
- Modify: `src/components/product/ProductGallery.tsx`
- Modify: `src/components/product/ProductPurchasePanel.tsx`

**Interfaces:**
- Consumes: The modernized component styling.
- Produces: A split-screen product page where images scroll and the purchase panel stays pinned.

- [ ] **Step 1: Implement CSS Grid/Flex for Sticky Layout**
Update `ProductDetailClient.tsx` wrapper:
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
    {/* Left Column: Scrollable Image Gallery */}
    <div className="mb-10 lg:mb-0">
      <ProductGallery images={product.images} />
    </div>
    {/* Right Column: Sticky Purchase Panel */}
    <div className="lg:sticky lg:top-24 self-start">
      <ProductPurchasePanel product={product} />
    </div>
  </div>
</div>
```

- [ ] **Step 2: Commit Product Detail changes**
```bash
git add src/app/products/[slug]/ProductDetailClient.tsx
git commit -m "feat: implement sticky scroll product detail layout"
```

---

