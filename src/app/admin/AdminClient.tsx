'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  LayoutDashboard, ShoppingBag, Package, Tag, Award, FileText, Settings, HelpCircle,
  Loader2, Check, X, Globe, ArrowUpRight, Menu, MessageSquare, Star
} from 'lucide-react';
import { 
  createProduct, updateProduct, deleteProductAdmin,
  createBrand, updateBrand, deleteBrand,
  createCategory, updateCategory, deleteCategory,
  createBlog, updateBlog, deleteBlog,
  updateSiteSettings, updateOrderStatusAdmin,
  deleteReviewAdmin
} from '@/app/actions/adminActions';

// Type definitions
interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'failed';
  date: string;
  failedAt?: string | null;
  shippingAddress?: any;
  items?: Array<{ name: string; quantity: number; unitPrice: number; image?: string }>;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  is_published: boolean;
  published_at: string | null;
}

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  skinType: 'all' | 'oily' | 'dry' | 'combination' | 'sensitive';
  images: string[];
  brandId: string | null;
  categoryId: string | null;
  brand: string;
  category: string;
  faqs: Array<{ question: string; answer: string }>;
}

export interface AdminReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  customerName: string;
  customerPhone: string | null;
  productId: string | null;
  productName: string;
  productSlug: string | null;
  productImage: string | null;
}

interface AdminClientProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    grossRevenue: number;
    activeCustomers: number;
  };
  recentOrders: AdminOrder[];
  categories: CategoryItem[];
  brands: BrandItem[];
  products: AdminProduct[];
  blogPosts: BlogItem[];
  reviews: AdminReview[];
  siteSettings: {
    hero_title: string;
    hero_subtitle: string;
    hero_description: string;
    hero_image_url: string;
    hero_button_text: string;
    hero_button_link: string;
    common_faqs?: Array<{ question: string; answer: string }>;
  };
}

type TabType = 'dashboard' | 'orders' | 'products' | 'faqs' | 'categories' | 'brands' | 'blogs' | 'reviews' | 'settings';

// Dynamic imports of heavy components to optimize compilation speeds
const TabLoader = () => (
  <div className="w-full h-full animate-pulse space-y-6">
    <div className="flex justify-between items-center pb-6 border-b border-[#EFECE6]">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-stone-100 rounded-lg"></div>
        <div className="h-4 w-64 bg-stone-100 rounded-lg"></div>
      </div>
      <div className="h-10 w-32 bg-stone-100 rounded-xl"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-32 bg-stone-50 rounded-2xl border border-[#EFECE6]"></div>
      ))}
    </div>
    <div className="h-[400px] w-full bg-stone-50 rounded-2xl border border-[#EFECE6]"></div>
  </div>
);

const DashboardTab = dynamic(() => import('./tabs/DashboardTab'), { ssr: false, loading: TabLoader });
const OrdersTab = dynamic(() => import('./tabs/OrdersTab'), { ssr: false, loading: TabLoader });
const ProductsTab = dynamic(() => import('./tabs/ProductsTab'), { ssr: false, loading: TabLoader });
const FaqsTab = dynamic(() => import('./tabs/FaqsTab'), { ssr: false, loading: TabLoader });
const CategoriesTab = dynamic(() => import('./tabs/CategoriesTab'), { ssr: false, loading: TabLoader });
const BrandsTab = dynamic(() => import('./tabs/BrandsTab'), { ssr: false, loading: TabLoader });
const BlogsTab = dynamic(() => import('./tabs/BlogsTab'), { ssr: false, loading: TabLoader });
const ReviewsTab = dynamic(() => import('./tabs/ReviewsTab'), { ssr: false, loading: TabLoader });
const SettingsTab = dynamic(() => import('./tabs/SettingsTab'), { ssr: false, loading: TabLoader });

export default function AdminClient({ 
  stats, recentOrders: initialOrders, categories: initialCategories, brands: initialBrands, products: initialProducts, blogPosts: initialBlogs, reviews: initialReviews = [], siteSettings 
}: AdminClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab state with URL query persistence
  const [activeTab, setActiveTabState] = useState<TabType>('dashboard');

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as TabType;
    if (tabFromUrl && ['dashboard', 'orders', 'products', 'faqs', 'categories', 'brands', 'blogs', 'reviews', 'settings'].includes(tabFromUrl)) {
      setActiveTabState(tabFromUrl);
    }
  }, [searchParams]);

  const setActiveTab = (tab: TabType, extraParams?: Record<string, string>) => {
    setIsMobileMenuOpen(false);
    setActiveTabState(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => url.searchParams.set(k, v));
    } else {
      url.searchParams.delete('filter');
    }
    window.history.pushState({}, '', url.toString());
  };

  // Local state arrays for instant optimistic updates without hard reloads
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [brands, setBrands] = useState<BrandItem[]>(initialBrands);
  const [products, setProducts] = useState<AdminProduct[]>(initialProducts);
  const [blogPosts, setBlogPosts] = useState<BlogItem[]>(initialBlogs);
  const [reviews, setReviews] = useState<AdminReview[]>(initialReviews);

  // Sync state if server props update
  useEffect(() => { setOrders(initialOrders); }, [initialOrders]);
  useEffect(() => { setCategories(initialCategories); }, [initialCategories]);
  useEffect(() => { setBrands(initialBrands); }, [initialBrands]);
  useEffect(() => { setProducts(initialProducts); }, [initialProducts]);
  useEffect(() => { setBlogPosts(initialBlogs); }, [initialBlogs]);
  useEffect(() => { setReviews(initialReviews); }, [initialReviews]);

  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Action loaders
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const triggerToast = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(null), 4000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // Order Status handler
  const handleOrderStatus = async (orderId: string, status: any) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await updateOrderStatusAdmin(orderId, status);
      if (res.error) {
        triggerToast(res.error, true);
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        triggerToast(`Order #${orderId.slice(0, 8)} → ${status.charAt(0).toUpperCase() + status.slice(1)}`);
        router.refresh();
      }
    } catch (err: any) {
      triggerToast('An unexpected error occurred while updating order status.', true);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Product Delete
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    setDeletingProductId(id);
    const res = await deleteProductAdmin(id);
    setDeletingProductId(null);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast('Product deleted!');
      setProducts(prev => prev.filter(p => p.id !== id));
      router.refresh();
    }
  };

  // Brand Delete
  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Delete this brand?')) return;
    setDeletingBrandId(id);
    const res = await deleteBrand(id);
    setDeletingBrandId(null);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast('Brand deleted!');
      setBrands(prev => prev.filter(b => b.id !== id));
      router.refresh();
    }
  };

  // Review Delete
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;
    setDeletingReviewId(reviewId);
    try {
      const res = await deleteReviewAdmin(reviewId);
      if (res.error) {
        triggerToast(res.error, true);
      } else {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        triggerToast('Review deleted successfully.');
      }
    } catch (err: any) {
      triggerToast('An unexpected error occurred while deleting review.', true);
    } finally {
      setDeletingReviewId(null);
    }
  };

  // Category Delete
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    setDeletingCategoryId(id);
    const res = await deleteCategory(id);
    setDeletingCategoryId(null);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast('Category deleted!');
      setCategories(prev => prev.filter(c => c.id !== id));
      router.refresh();
    }
  };

  // Blog Delete
  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    setDeletingBlogId(id);
    const res = await deleteBlog(id);
    setDeletingBlogId(null);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast('Blog post deleted!');
      setBlogPosts(prev => prev.filter(b => b.id !== id));
      router.refresh();
    }
  };

  // Product CRUD Submits
  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit = false) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = isEdit ? await updateProduct(formData) : await createProduct(formData);
    setLoading(false);
    
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast(isEdit ? 'Product updated successfully!' : 'Product added successfully!');
      router.refresh();
    }
  };

  // Brand CRUD Submits
  const handleBrandSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit = false) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = isEdit ? await updateBrand(formData) : await createBrand(formData);
    setLoading(false);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast(isEdit ? 'Brand updated!' : 'Brand added!');
      router.refresh();
    }
  };

  // Category CRUD Submits
  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit = false) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = isEdit ? await updateCategory(formData) : await createCategory(formData);
    setLoading(false);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast(isEdit ? 'Category updated!' : 'Category added!');
      router.refresh();
    }
  };

  // Blog CRUD Submits
  const handleBlogSubmit = async (e: React.FormEvent<HTMLFormElement>, isEdit = false) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = isEdit ? await updateBlog(formData) : await createBlog(formData);
    setLoading(false);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast(isEdit ? 'Blog post updated!' : 'Blog post created!');
      router.refresh();
    }
  };

  // Settings Submit
  const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await updateSiteSettings(formData);
    setLoading(false);
    if (res.error) triggerToast(res.error, true);
    else {
      triggerToast('Hero Settings updated successfully!');
      router.refresh();
    }
  };



  return (
    <div className="w-full min-h-screen bg-[#FBF9F6] text-[#1C1917] flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-[#1C1917] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
            <img src="/images/brand/logo.png" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-xs tracking-wide text-white">Beauty Looks</h1>
            <p className="text-[8px] text-[#CA8A04] tracking-widest uppercase font-bold">Store Management</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1C1917] text-white flex flex-col justify-between shrink-0 border-r border-[#2A2725] select-none h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
          <div className="p-6 border-b border-[#2A2725] flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1 shrink-0 shadow-sm border border-stone-200 overflow-hidden">
              <img
                src="/images/brand/logo.png"
                alt="Beauty Looks Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h1 className="font-display font-semibold text-sm tracking-wide text-white">Beauty Looks</h1>
              <p className="text-[9px] text-[#CA8A04] tracking-widest uppercase font-bold">Store Management</p>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: null },
              { id: 'orders', label: 'Orders', icon: ShoppingBag, count: orders.length },
              { id: 'products', label: 'Products', icon: Package, count: products.length },
              { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
              { id: 'faqs', label: 'Common FAQs', icon: HelpCircle, count: siteSettings.common_faqs?.length || 4 },
              { id: 'categories', label: 'Categories', icon: Tag, count: categories.length },
              { id: 'brands', label: 'Brands', icon: Award, count: brands.length },
              { id: 'blogs', label: 'Journal', icon: FileText, count: blogPosts.length },
              { id: 'settings', label: 'Store Settings', icon: Settings, count: null },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all text-left ${
                    isActive 
                      ? 'bg-[#CA8A04] text-white shadow-md' 
                      : 'text-[#9CA3AF] hover:bg-[#2A2725] hover:text-white'
                  }`}
                >
                  <span className="flex items-center space-x-3">
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </span>
                  {tab.count !== null && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#2A2725] text-[#9CA3AF]'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#2A2725] space-y-2">

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-xs font-semibold text-white/90"
          >
            <span className="flex items-center space-x-2">
              <Globe size={14} />
              <span>Public Storefront</span>
            </span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 min-h-screen p-4 md:p-8 md:ml-64 relative flex flex-col justify-between w-full max-w-7xl mx-auto">
        <div>
          {/* Top toast alerts */}
          {error && (
            <div className="fixed top-6 right-6 z-50 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-xl flex items-center space-x-2 animate-bounce">
              <X size={16} />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="fixed top-6 right-6 z-50 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl shadow-xl flex items-center space-x-2">
              <Check size={16} className="text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Render Active Tab dynamically */}
          {activeTab === 'dashboard' && (
            <DashboardTab stats={stats} orders={orders} products={products} onViewAllOrders={() => setActiveTab('orders')} onNavigateToProducts={(filter?: string) => filter ? setActiveTab('products', { filter }) : setActiveTab('products')} />
          )}

          {activeTab === 'orders' && (
            <OrdersTab 
              orders={orders}
              updatingOrderId={updatingOrderId}
              handleOrderStatus={handleOrderStatus}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              products={products}
              categories={categories}
              brands={brands}
              deletingProductId={deletingProductId}
              handleDeleteProduct={handleDeleteProduct}
              handleProductSubmit={handleProductSubmit}
              loading={loading}
            />
          )}

          {activeTab === 'faqs' && (
            <FaqsTab
              siteSettings={siteSettings}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab
              categories={categories}
              deletingCategoryId={deletingCategoryId}
              handleDeleteCategory={handleDeleteCategory}
              handleCategorySubmit={handleCategorySubmit}
              loading={loading}
            />
          )}

          {activeTab === 'brands' && (
            <BrandsTab
              brands={brands}
              deletingBrandId={deletingBrandId}
              handleDeleteBrand={handleDeleteBrand}
              handleBrandSubmit={handleBrandSubmit}
              loading={loading}
            />
          )}

          {activeTab === 'blogs' && (
            <BlogsTab
              blogPosts={blogPosts}
              deletingBlogId={deletingBlogId}
              handleDeleteBlog={handleDeleteBlog}
              handleBlogSubmit={handleBlogSubmit}
              loading={loading}
            />
          )}

          {activeTab === 'reviews' && (
            <ReviewsTab
              reviews={reviews}
              deletingReviewId={deletingReviewId}
              handleDeleteReview={handleDeleteReview}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              siteSettings={siteSettings}
              handleSettingsSubmit={handleSettingsSubmit}
              loading={loading}
            />
          )}
        </div>

        {/* Footer info */}
        <footer className="mt-16 text-center text-[10px] uppercase font-bold tracking-widest text-[#8A8177] select-none border-t border-[#EFECE6] pt-4">
          Beauty Looks Mumbai · Admin Management Console
        </footer>
      </main>
    </div>
  );
}
