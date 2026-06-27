import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-primary-dark pt-16 pb-8 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <Link href="/" className="block relative h-10 w-48 group">
                <Image
                  src="/images/brand/logo.png"
                  alt="Beauty Looks Mumbai"
                  fill
                  className="object-contain object-left mix-blend-multiply transition-opacity duration-300 group-hover:opacity-80"
                />
            </Link>
            <p className="text-text-muted text-sm mt-4">
              Simple • Genuine • Affordable. Your trusted destination for premium beauty and cosmetics in Mumbai.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-text-main uppercase tracking-widest text-xs mb-6">Shop</h4>
            <ul className="space-y-4">
              <li><Link href="/products" className="text-text-muted hover:text-accent text-sm transition-colors">All Products</Link></li>
              <li><Link href="/products?category=facial-kits" className="text-text-muted hover:text-accent text-sm transition-colors">Facial Kits</Link></li>
              <li><Link href="/products?category=serums-oils" className="text-text-muted hover:text-accent text-sm transition-colors">Serums & Oils</Link></li>
              <li><Link href="/products?category=cleansers-toners" className="text-text-muted hover:text-accent text-sm transition-colors">Cleansers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-main uppercase tracking-widest text-xs mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link href="/contact" className="text-text-muted hover:text-accent text-sm transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-text-muted hover:text-accent text-sm transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="text-text-muted hover:text-accent text-sm transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="text-text-muted hover:text-accent text-sm transition-colors">Returns</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-main uppercase tracking-widest text-xs mb-6">Newsletter</h4>
            <p className="text-text-muted text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="flex space-x-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-primary border border-border px-4 py-2 text-sm focus:outline-none focus:border-accent text-text-main"
                required
              />
              <button 
                type="submit" 
                className="bg-text-main text-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-text-muted text-xs">
            &copy; {new Date().getFullYear()} Beauty Looks Mumbai. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-text-muted hover:text-accent text-xs transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-text-muted hover:text-accent text-xs transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
