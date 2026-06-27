import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminOrder {
  id: string;
  customer: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  date: string;
}

interface AdminState {
  totalProducts: number;
  totalOrders: number;
  grossRevenue: number;
  activeCustomers: number;
  
  recentOrders: AdminOrder[];

  // Actions
  updateOrderStatus: (orderId: string, status: AdminOrder['status']) => void;
  addDiscountCode: () => void;
  syncSchema: () => void;
  addProduct: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      totalProducts: 12,
      totalOrders: 48,
      grossRevenue: 124500,
      activeCustomers: 156,
      
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
          activeCustomers: state.activeCustomers + 1, // just a mock effect
        })),

      syncSchema: () =>
        set((state) => ({
          grossRevenue: state.grossRevenue + Math.floor(Math.random() * 5000), // mock effect
        })),

      addProduct: () =>
        set((state) => ({
          totalProducts: state.totalProducts + 1,
        })),
    }),
    {
      name: 'blm-admin',
    }
  )
);
