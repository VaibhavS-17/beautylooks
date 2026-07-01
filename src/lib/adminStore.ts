import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Category, Brand } from './types';
import { categories as staticCategories, brands as staticBrands } from './data';

export interface AdminOrder {
  id: string;
  customer: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  date: string;
}

export interface NewProductForm {
  name: string;
  brand: string;
  brandLogo?: string;
  category: string;
  categoryId: string;
  categoryImage?: string;
  price: string;
  salePrice: string;
  description: string;
  shortDescription: string;
  stockQuantity: string;
  skinType: string;
  badge: string;
  isFeatured: boolean;
}

interface AdminState {
  totalProducts: number;
  totalOrders: number;
  grossRevenue: number;
  activeCustomers: number;

  recentOrders: AdminOrder[];

  // Dynamic entities added by admin
  adminProducts: Product[];
  adminCategories: Category[];
  adminBrands: Brand[];

  // Modal state
  isAddProductModalOpen: boolean;

  // Actions
  updateOrderStatus: (orderId: string, status: AdminOrder['status']) => void;
  addDiscountCode: () => void;
  syncSchema: () => void;
  openAddProductModal: () => void;
  closeAddProductModal: () => void;
  addProductFull: (form: NewProductForm) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      totalProducts: 12,
      totalOrders: 48,
      grossRevenue: 124500,
      activeCustomers: 156,

      adminProducts: [],
      adminCategories: [],
      adminBrands: [],

      isAddProductModalOpen: false,

      recentOrders: [
        { id: 'BLM-398274', customer: 'Priya Sharma', amount: 1499, status: 'confirmed', date: '2026-06-25' },
        { id: 'BLM-398273', customer: 'Rahul Mehta', amount: 399, status: 'pending', date: '2026-06-24' },
        { id: 'BLM-398272', customer: 'Ananya Iyer', amount: 1845, status: 'shipped', date: '2026-06-23' },
        { id: 'BLM-398271', customer: 'Siddharth Shah', amount: 948, status: 'delivered', date: '2026-06-22' },
        { id: 'BLM-398270', customer: 'Divya Nair', amount: 549, status: 'delivered', date: '2026-06-20' },
      ],

      updateOrderStatus: (orderId, newStatus) =>
        set((state) => ({
          recentOrders: state.recentOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          ),
        })),

      addDiscountCode: () =>
        set((state) => ({
          activeCustomers: state.activeCustomers + 1,
        })),

      syncSchema: () =>
        set((state) => ({
          grossRevenue: state.grossRevenue + Math.floor(Math.random() * 5000),
        })),

      openAddProductModal: () => set({ isAddProductModalOpen: true }),
      closeAddProductModal: () => set({ isAddProductModalOpen: false }),

      addProductFull: (form: NewProductForm) =>
        set((state) => {
          const id = `admin-prod-${Date.now()}`;
          const productSlug = form.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          // 1. Process brand
          let brandId = '';
          let finalBrandName = form.brand.trim();
          const existingBrands = [...staticBrands, ...state.adminBrands];
          const matchedBrand = existingBrands.find(
            (b) => b.name.toLowerCase() === finalBrandName.toLowerCase()
          );

          let brandSlug = '';
          const newBrands = [...state.adminBrands];

          if (matchedBrand) {
            brandId = matchedBrand.id;
            finalBrandName = matchedBrand.name;
          } else {
            brandId = `brand-custom-${Date.now()}`;
            brandSlug = finalBrandName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            const newBrand: Brand = {
              id: brandId,
              name: finalBrandName,
              slug: brandSlug,
              logoUrl: form.brandLogo || '', // Use custom brand logo or leave blank for initials display
            };
            newBrands.push(newBrand);
          }

          // 2. Process category
          let categoryId = '';
          let finalCategoryName = form.category.trim();
          const existingCats = [...staticCategories, ...state.adminCategories];
          const matchedCat = existingCats.find(
            (c) => c.name.toLowerCase() === finalCategoryName.toLowerCase()
          );

          let catSlug = '';
          const newCategories = [...state.adminCategories];

          if (matchedCat) {
            categoryId = matchedCat.id;
            finalCategoryName = matchedCat.name;
          } else {
            categoryId = `cat-custom-${Date.now()}`;
            catSlug = finalCategoryName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            const newCat: Category = {
              id: categoryId,
              name: finalCategoryName,
              slug: catSlug,
              description: `${finalCategoryName} products and collections.`,
              imageUrl: form.categoryImage || '', // Custom category image or empty
              productCount: 1,
            };
            newCategories.push(newCat);
          }

          const newProduct: Product = {
            id,
            name: form.name,
            slug: productSlug,
            description: form.description || form.shortDescription || form.name,
            shortDescription: form.shortDescription || form.name,
            price: parseFloat(form.price) || 0,
            salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
            categoryId: categoryId,
            category: finalCategoryName,
            brandId: brandId,
            brand: finalBrandName,
            skinType: (form.skinType as Product['skinType']) || 'all',
            stockQuantity: parseInt(form.stockQuantity) || 10,
            isFeatured: form.isFeatured,
            isActive: true,
            images: ['/images/products/facial-kit-1.png'],
            rating: 0,
            reviewCount: 0,
            badge: (form.badge as Product['badge']) || undefined,
          };

          return {
            adminProducts: [newProduct, ...state.adminProducts],
            adminCategories: newCategories,
            adminBrands: newBrands,
            totalProducts: state.totalProducts + 1,
            isAddProductModalOpen: false,
          };
        }),
    }),
    {
      name: 'blm-admin',
    }
  )
);
