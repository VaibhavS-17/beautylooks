### Task 2: Transparent to Solid Navigation

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: The `usePathname` hook to detect if we are on the homepage.
- Produces: A Navbar that is transparent and absolute positioned at the top of the homepage, but becomes sticky and solid white upon scrolling or on other pages.

- [ ] **Step 1: Implement transparent state in Navbar**
Update `Navbar.tsx` to accept or calculate an `isTransparent` state based on scroll position (if on homepage).
```tsx
const [isScrolled, setIsScrolled] = useState(false);
const pathname = usePathname();
const isHome = pathname === '/';

useEffect(() => {
  const handleScroll = () => setIsScrolled(window.scrollY > 50);
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

const navClasses = `fixed w-full z-50 transition-colors duration-300 ${
  isHome && !isScrolled ? 'bg-transparent text-white' : 'bg-white text-gray-900 border-b border-gray-100'
}`;
```

- [ ] **Step 2: Commit Navbar changes**
```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: implement transparent to solid navbar transition"
```

---

