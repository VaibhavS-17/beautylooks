export default function TopBar() {
  return (
    <div className="bg-text-main text-primary py-1.5 px-4 w-full text-[10px] tracking-[0.2em] uppercase font-medium">
      <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-6 max-w-7xl mx-auto">
        <span>Complimentary Shipping on all orders over ₹1499</span>
        <span className="hidden sm:inline opacity-40">|</span>
        <a href="tel:+918879655807" className="hover:text-accent transition-colors mt-1 sm:mt-0">
          Client Services: 8879655807
        </a>
      </div>
    </div>
  );
}
