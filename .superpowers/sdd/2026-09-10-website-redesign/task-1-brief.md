### Task 1: Global Theme & CSS Foundations

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx` (if font changes are needed)

**Interfaces:**
- Produces: CSS utility classes and Tailwind overrides for the new minimalist aesthetic.

- [ ] **Step 1: Update globals.css with new aesthetic variables**
```css
/* In src/app/globals.css */
@theme {
  --color-background: #ffffff;
  --color-foreground: #111827;
  --color-muted: #f3f4f6;
  --color-border: #e5e7eb;
}
/* Ensure body uses the clean background and sans-serif font */
body {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}
/* Remove heavy global borders or box-shadows if any */
```

- [ ] **Step 2: Commit global theme changes**
```bash
git add src/app/globals.css
git commit -m "style: implement light mode first aesthetic foundation"
```

---

