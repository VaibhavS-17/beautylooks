// Product data types for Beauty Looks Mumbai
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice: number | null;
  categoryId: string;
  category: string;
  brandId: string;
  brand: string;
  skinType: 'all' | 'oily' | 'dry' | 'combination' | 'sensitive';
  stockQuantity: number;
  isFeatured: boolean;
  isActive: boolean;
  images: string[];
  rating: number;
  reviewCount: number;
  badge?: 'new' | 'bestseller' | 'sale';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingAddress: Address;
  items: OrderItem[];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
}

export interface Address {
  id?: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'customer' | 'admin';
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  authorName: string;
  authorAvatar?: string;
  isPublished: boolean;
  publishedAt: string;
  createdAt: string;
  readTime: number;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar?: string;
  rating: number;
  comment: string;
}
