import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';

<<<<<<< HEAD
import React, { useState } from 'react';
import {
  Package, ShoppingBag, IndianRupee, Users, ArrowUpRight,
  Plus, RefreshCw, BarChart2, X, Sparkles, TrendingUp,
  Tag, CheckCircle2, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';
import { formatPrice, categories, brands as staticBrands } from '@/lib/data';
import { useAdminStore, AdminOrder, NewProductForm } from '@/lib/adminStore';

const defaultForm: NewProductForm = {
  name: '',
  brand: '',
  brandLogo: '',
  category: 'Facial Kits',
  categoryId: 'cat-1',
  categoryImage: '',
  price: '',
  salePrice: '',
  description: '',
  shortDescription: '',
  stockQuantity: '10',
  skinType: 'all',
  badge: '',
  isFeatured: false,
};

export default function AdminDashboardPage() {
  const {
    totalProducts,
    totalOrders,
    grossRevenue,
    activeCustomers,
    recentOrders,
    adminProducts,
    adminCategories,
    adminBrands,
    isAddProductModalOpen,
    updateOrderStatus,
    addDiscountCode,
    syncSchema,
    openAddProductModal,
    closeAddProductModal,
    addProductFull,
  } = useAdminStore();

  const [form, setForm] = useState<NewProductForm>(defaultForm);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Track modes for select vs custom brand/category input
  const [brandMode, setBrandMode] = useState<'select' | 'custom'>('select');
  const [categoryMode, setCategoryMode] = useState<'select' | 'custom'>('select');

  // Merge static lists with dynamic ones added by admin
  const allBrands = [...staticBrands, ...adminBrands];
  const allCategories = [...categories, ...adminCategories];

  const stats = [
    { label: 'Total Products', value: totalProducts.toString(), icon: Package, change: `+${adminProducts.length} admin added`, color: 'from-rose-50 to-pink-50', iconBg: 'bg-rose-100 text-rose-600' },
    { label: 'Total Orders', value: totalOrders.toString(), icon: ShoppingBag, change: '+12 this week', color: 'from-amber-50 to-yellow-50', iconBg: 'bg-amber-100 text-amber-600' },
    { label: 'Gross Revenue', value: formatPrice(grossRevenue), icon: IndianRupee, change: '+18% growth', color: 'from-emerald-50 to-teal-50', iconBg: 'bg-emerald-100 text-emerald-600' },
    { label: 'Active Customers', value: activeCustomers.toString(), icon: Users, change: '+24 new signups', color: 'from-violet-50 to-purple-50', iconBg: 'bg-violet-100 text-violet-600' },
  ];
=======
export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login?redirect=/admin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/account');
  }
>>>>>>> 58bf54a70e694778aedb044d20c8563e9cc75a20

  // Fetch real statistics
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  const { count: activeCustomers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer');

  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .not('status', 'eq', 'cancelled');

  const grossRevenue = (revenueData || []).reduce((sum, item) => sum + Number(item.total_amount), 0);

  // Fetch recent orders with customer profile join
  const { data: recentOrdersData } = await supabase
    .from('orders')
    .select(`
      id,
      total_amount,
      status,
      created_at,
      profiles (
        full_name,
        phone
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  const mappedOrders = (recentOrdersData || []).map((ord: any) => ({
    id: ord.id,
    customerName: ord.profiles?.full_name || 'Anonymous Customer',
    customerEmail: ord.profiles?.phone ? `+91 ${ord.profiles.phone}` : 'Registered Customer',
    amount: Number(ord.total_amount),
    status: ord.status,
    date: new Date(ord.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  }));

  // Fetch categories & brands for dropdowns
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  const { data: brands } = await supabase
    .from('brands')
    .select('id, name')
    .order('name');

  const stats = {
    totalProducts: totalProducts || 0,
    totalOrders: totalOrders || 0,
    grossRevenue: grossRevenue || 0,
    activeCustomers: activeCustomers || 0
  };

  const handleFormChange = (field: keyof NewProductForm, value: string | boolean) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'category' && typeof value === 'string') {
        const cat = allCategories.find(c => c.name.toLowerCase() === value.toLowerCase());
        if (cat) {
          updated.categoryId = cat.id;
        } else {
          updated.categoryId = ''; // will be generated dynamically
        }
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.brand || !form.category || !form.price) return;
    addProductFull(form);
    setForm(defaultForm);
    setBrandMode('select');
    setCategoryMode('select');
    setSuccessMsg(`"${form.name}" added successfully!`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
<<<<<<< HEAD
    <div className="w-full min-h-screen bg-[#FAF9F6] py-10 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-8 mb-8 border-b border-[#E8E2D9]">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-8 bg-gradient-to-b from-[#C88E75] to-[#a06b52] rounded-full" />
              <h1 className="text-3xl sm:text-4xl font-bold text-[#2C1E16]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Admin Dashboard
              </h1>
            </div>
            <p className="text-xs text-[#6B5C52] mt-1 font-light ml-5">
              Store operations · Sales analytics · Product management
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => syncSchema()}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest border border-[#E8E2D9] text-[#6B5C52] rounded-xl hover:bg-[#F5F1E8] transition-all"
            >
              <RefreshCw size={14} />
              <span>Sync</span>
            </button>
            <button
              onClick={openAddProductModal}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest bg-[#2C1E16] text-white rounded-xl hover:bg-[#C88E75] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 transform"
            >
              <Plus size={14} />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-pulse">
            <CheckCircle2 size={16} />
            {successMsg}
          </div>
        )}

        {/* Demo Notice */}
        <div className="bg-gradient-to-r from-[#FDF8F5] to-[#FAF9F6] border border-[#C88E75]/20 p-4 rounded-2xl text-xs text-[#2C1E16] mb-8 flex items-center gap-2.5 shadow-sm">
          <Sparkles size={14} className="text-[#C88E75]" />
          <span><strong className="text-[#C88E75]">Live Sandbox:</strong> Products added here appear instantly in the main shop. Click order statuses to advance them!</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl border border-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 transform`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-[#6B5C52] font-semibold uppercase tracking-wider">{stat.label}</span>
                  <div className={`p-2 rounded-xl ${stat.iconBg}`}>
                    <Icon size={16} strokeWidth={1.5} />
                  </div>
                </div>
                <span className="block text-2xl font-bold text-[#2C1E16]" style={{ fontFamily: 'Playfair Display, serif' }}>{stat.value}</span>
                <span className="block text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp size={10} />
                  {stat.change}
                </span>
              </div>
            );
          })}
        </div>

        {/* Admin Products List (if any) */}
        {adminProducts.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#E8E2D9] shadow-sm p-6 mb-8">
            <h3 className="font-bold text-sm text-[#2C1E16] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Package size={16} className="text-[#C88E75]" />
              Recently Added Products ({adminProducts.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminProducts.slice(0, 6).map(p => (
                <div key={p.id} className="bg-[#FAF9F6] rounded-xl p-4 border border-[#E8E2D9] hover:border-[#C88E75]/40 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-bold text-[#C88E75] uppercase tracking-widest">{p.brand}</span>
                      <p className="text-sm font-semibold text-[#2C1E16] mt-0.5 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-[#6B5C52] mt-1">{p.category}</p>
                    </div>
                    <span className="text-sm font-bold text-[#2C1E16]">₹{p.price}</span>
                  </div>
                  {p.badge && (
                    <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#C88E75]/10 text-[#C88E75] rounded-full">
                      {p.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Recent Orders Table */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
            <div className="flex justify-between items-center border-b border-[#E8E2D9] pb-4 mb-4">
              <h3 className="font-bold text-sm tracking-wider text-[#2C1E16] uppercase flex items-center gap-2">
                <ShoppingBag size={15} className="text-[#C88E75]" />
                Recent Orders
              </h3>
              <button className="text-xs text-[#C88E75] hover:text-[#2C1E16] font-semibold flex items-center gap-1 transition-colors">
                <span>View All</span>
                <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#6B5C52]">
                <thead>
                  <tr className="border-b border-[#E8E2D9] text-[#2C1E16] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAF9F6] transition-colors">
                      <td className="py-3 px-3 font-bold text-[#2C1E16] text-[10px]">{order.id}</td>
                      <td className="py-3 px-3 font-medium text-[#2C1E16]">{order.customer}</td>
                      <td className="py-3 px-3 font-semibold text-[#C88E75]">{formatPrice(order.amount)}</td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleStatusChange(order.id, order.status)}
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all hover:scale-105 ${
                            order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                            order.status === 'delivered' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                            'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {order.status}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-[#6B5C52]">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & Analytics */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm space-y-3">
              <h3 className="font-bold text-sm tracking-wider text-[#2C1E16] uppercase border-b border-[#E8E2D9] pb-3">
                Quick Actions
              </h3>
              <button
                onClick={() => addDiscountCode()}
                className="w-full text-left py-3 px-4 rounded-xl bg-[#FAF9F6] hover:bg-[#FDF8F5] border border-[#E8E2D9] hover:border-[#C88E75]/30 text-xs font-medium text-[#2C1E16] transition-all flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  <Tag size={13} className="text-[#C88E75]" />
                  Create discount code
                </span>
                <Plus size={13} className="text-[#C88E75] group-hover:rotate-90 transition-transform" />
              </button>
              <button
                onClick={openAddProductModal}
                className="w-full text-left py-3 px-4 rounded-xl bg-[#FAF9F6] hover:bg-[#FDF8F5] border border-[#E8E2D9] hover:border-[#C88E75]/30 text-xs font-medium text-[#2C1E16] transition-all flex items-center justify-between group"
              >
                <span className="flex items-center gap-2">
                  <Package size={13} className="text-[#C88E75]" />
                  List new product
                </span>
                <ArrowUpRight size={13} className="text-[#C88E75] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#2C1E16] to-[#3d2b1f] p-6 rounded-2xl shadow-sm space-y-4 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <BarChart2 size={80} className="text-white" />
              </div>
              <div className="flex items-center gap-2 text-[#C88E75] font-semibold text-sm">
                <BarChart2 size={16} />
                <span className="uppercase tracking-wider text-xs font-bold">Weekly Overview</span>
              </div>
              <p className="text-xs text-white/70 font-light leading-relaxed">
                Sales have grown by <strong className="text-white font-semibold">+18%</strong> vs previous week. Top locations: Carter Road & Bandra.
              </p>
              <div className="space-y-2">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#C88E75] to-[#e8a98a] w-3/4 rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-white/50 font-medium">
                  <span>Conversion: 3.2%</span>
                  <span>Goal: 4.0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeAddProductModal}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-[#E8E2D9] px-8 py-6 flex justify-between items-center rounded-t-3xl z-10">
              <div>
                <h2 className="text-xl font-bold text-[#2C1E16]" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Add New Product
                </h2>
                <p className="text-xs text-[#6B5C52] mt-0.5">List products with customizable brands and categories</p>
              </div>
              <button
                onClick={closeAddProductModal}
                className="p-2 rounded-full hover:bg-[#FAF9F6] text-[#6B5C52] hover:text-[#2C1E16] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-[#2C1E16] uppercase tracking-widest mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleFormChange('name', e.target.value)}
                  placeholder="e.g. Lotus Gold Facial Kit"
                  required
                  className="w-full border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#2C1E16] focus:outline-none focus:border-[#C88E75] focus:ring-2 focus:ring-[#C88E75]/10 transition-all placeholder:text-[#6B5C52]/40 bg-[#FAF9F6]"
                />
              </div>

              {/* Brand Selector (Dropdown + Custom Input) */}
              <div>
                <label className="block text-xs font-semibold text-[#2C1E16] uppercase tracking-widest mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                {brandMode === 'select' ? (
                  <select
                    value={form.brand}
                    onChange={e => {
                      if (e.target.value === '__new_brand__') {
                        setBrandMode('custom');
                        handleFormChange('brand', '');
                      } else {
                        handleFormChange('brand', e.target.value);
                      }
                    }}
                    required
                    className="w-full border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#2C1E16] focus:outline-none focus:border-[#C88E75] bg-[#FAF9F6] cursor-pointer"
                  >
                    <option value="">Select an existing brand...</option>
                    {allBrands.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                    <option value="__new_brand__" className="text-[#C88E75] font-semibold">+ Add New Brand...</option>
                  </select>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={form.brand}
                        onChange={e => handleFormChange('brand', e.target.value)}
                        placeholder="Type a new brand name..."
                        required
                        className="flex-grow border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#2C1E16] focus:outline-none focus:border-[#C88E75] focus:ring-2 focus:ring-[#C88E75]/10 bg-[#FAF9F6]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBrandMode('select');
                          handleFormChange('brand', '');
                          handleFormChange('brandLogo', '');
                        }}
                        className="text-xs text-[#C88E75] hover:text-[#2C1E16] underline font-semibold cursor-pointer shrink-0"
                      >
                        Choose from list
                      </button>
                    </div>
                    {/* Optional Brand Logo URL */}
                    <div className="relative">
                      <input
                        type="text"
                        value={form.brandLogo || ''}
                        onChange={e => handleFormChange('brandLogo', e.target.value)}
                        placeholder="Brand Logo Image URL (optional)"
                        className="w-full pl-10 pr-4 py-2 text-xs border border-[#E8E2D9] rounded-xl focus:outline-none focus:border-[#C88E75] bg-[#FAF9F6] text-[#2C1E16]"
                      />
                      <ImageIcon size={14} className="absolute left-3.5 top-3 text-[#6B5C52]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Category Selector (Dropdown + Custom Input) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C1E16] uppercase tracking-widest mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  {categoryMode === 'select' ? (
                    <select
                      value={form.category}
                      onChange={e => {
                        if (e.target.value === '__new_category__') {
                          setCategoryMode('custom');
                          handleFormChange('category', '');
                        } else {
                          handleFormChange('category', e.target.value);
                        }
                      }}
                      required
                      className="w-full border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#2C1E16] focus:outline-none focus:border-[#C88E75] bg-[#FAF9F6] cursor-pointer"
                    >
                      <option value="">Select an existing category...</option>
                      {allCategories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                      <option value="__new_category__" className="text-[#C88E75] font-semibold">+ Add New Category...</option>
                    </select>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={form.category}
                          onChange={e => handleFormChange('category', e.target.value)}
                          placeholder="Type a new category name..."
                          required
                          className="flex-grow border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#2C1E16] focus:outline-none focus:border-[#C88E75] focus:ring-2 focus:ring-[#C88E75]/10 bg-[#FAF9F6]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryMode('select');
                            handleFormChange('category', 'Facial Kits');
                            handleFormChange('categoryImage', '');
                          }}
                          className="text-xs text-[#C88E75] hover:text-[#2C1E16] underline font-semibold cursor-pointer shrink-0"
                        >
                          Choose from list
                        </button>
                      </div>
                      {/* Optional Category Image URL */}
                      <div className="relative">
                        <input
                          type="text"
                          value={form.categoryImage || ''}
                          onChange={e => handleFormChange('categoryImage', e.target.value)}
                          placeholder="Category Image URL (optional)"
                          className="w-full pl-10 pr-4 py-2 text-xs border border-[#E8E2D9] rounded-xl focus:outline-none focus:border-[#C88E75] bg-[#FAF9F6] text-[#2C1E16]"
                        />
                        <ImageIcon size={14} className="absolute left-3.5 top-3 text-[#6B5C52]" />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2C1E16] uppercase tracking-widest mb-2">Skin Type</label>
                  <select
                    value={form.skinType}
                    onChange={e => handleFormChange('skinType', e.target.value)}
                    className="w-full border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#2C1E16] focus:outline-none focus:border-[#C88E75] bg-[#FAF9F6] cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="oily">Oily</option>
                    <option value="dry">Dry</option>
                    <option value="combination">Combination</option>
                    <option value="sensitive">Sensitive</option>
                  </select>
                </div>
              </div>

              {/* Price & Sale Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C1E16] uppercase tracking-widest mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={e => handleFormChange('price', e.target.value)}
                    placeholder="e.g. 1299"
                    required
                    className="w-full border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#2C1E16] focus:outline-none focus:border-[#C88E75] focus:ring-2 focus:ring-[#C88E75]/10 transition-all placeholder:text-[#6B5C52]/40 bg-[#FAF9F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C1E16] uppercase tracking-widest mb-2">Sale Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.salePrice}
                    onChange={e => handleFormChange('salePrice', e.target.value)}
                    placeholder="Leave blank if no sale"
                    className="w-full border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#2C1E16] focus:outline-none focus:border-[#C88E75] focus:ring-2 focus:ring-[#C88E75]/10 transition-all placeholder:text-[#6B5C52]/40 bg-[#FAF9F6]"
                  />
                </div>
              </div>

              {/* Stock & Badge Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2C1E16] uppercase tracking-widest mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={e => handleFormChange('stockQuantity', e.target.value)}
                    className="w-full border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#2C1E16] focus:outline-none focus:border-[#C88E75] bg-[#FAF9F6]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2C1E16] uppercase tracking-widest mb-2">Badge</label>
                  <select
                    value={form.badge}
                    onChange={e => handleFormChange('badge', e.target.value)}
                    className="w-full border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#2C1E16] focus:outline-none focus:border-[#C88E75] bg-[#FAF9F6] cursor-pointer"
                  >
                    <option value="">None</option>
                    <option value="new">New</option>
                    <option value="bestseller">Bestseller</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-semibold text-[#2C1E16] uppercase tracking-widest mb-2">Short Description</label>
                <input
                  type="text"
                  value={form.shortDescription}
                  onChange={e => handleFormChange('shortDescription', e.target.value)}
                  placeholder="Brief tagline shown on product card"
                  className="w-full border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#2C1E16] focus:outline-none focus:border-[#C88E75] focus:ring-2 focus:ring-[#C88E75]/10 transition-all placeholder:text-[#6B5C52]/40 bg-[#FAF9F6]"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-semibold text-[#2C1E16] uppercase tracking-widest mb-2">Full Description</label>
                <textarea
                  value={form.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                  placeholder="Detailed product description..."
                  rows={3}
                  className="w-full border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-[#2C1E16] focus:outline-none focus:border-[#C88E75] focus:ring-2 focus:ring-[#C88E75]/10 transition-all placeholder:text-[#6B5C52]/40 bg-[#FAF9F6] resize-none"
                />
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleFormChange('isFeatured', !form.isFeatured)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.isFeatured ? 'bg-[#C88E75]' : 'bg-[#E8E2D9]'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isFeatured ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
                <span className="text-xs font-semibold text-[#2C1E16] uppercase tracking-wider">Feature on Homepage</span>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAddProductModal}
                  className="flex-1 py-3.5 border border-[#E8E2D9] text-xs font-semibold uppercase tracking-widest text-[#6B5C52] rounded-xl hover:bg-[#FAF9F6] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-[#2C1E16] text-white text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-[#C88E75] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  List Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
=======
    <AdminClient 
      stats={stats} 
      recentOrders={mappedOrders}
      categories={categories || []}
      brands={brands || []}
    />
>>>>>>> 58bf54a70e694778aedb044d20c8563e9cc75a20
  );
}
