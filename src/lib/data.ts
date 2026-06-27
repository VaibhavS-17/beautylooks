import { Product, Category, Brand, BlogPost, Testimonial } from './types';

// ============================================
// CATEGORIES
// ============================================
export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Facial Kits',
    slug: 'facial-kits',
    description: 'Complete facial kits for salon-like results at home. Curated sets for every skin type.',
    imageUrl: '/images/categories/facial-kits.png',
    productCount: 8,
  },
  {
    id: 'cat-2',
    name: 'Serums & Oils',
    slug: 'serums-oils',
    description: 'Potent serums and nourishing oils for targeted skincare treatments.',
    imageUrl: '/images/categories/serums.png',
    productCount: 6,
  },
  {
    id: 'cat-3',
    name: 'Cleansers',
    slug: 'cleansers',
    description: 'Gentle yet effective cleansers to purify and refresh your skin daily.',
    imageUrl: '/images/categories/cleansers.png',
    productCount: 5,
  },
  {
    id: 'cat-4',
    name: 'Face Masks',
    slug: 'face-masks',
    description: 'Luxurious face masks for deep cleansing, hydration, and radiant glow.',
    imageUrl: '/images/categories/masks.png',
    productCount: 5,
  },
];

// ============================================
// BRANDS
// ============================================
export const brands: Brand[] = [
  { id: 'brand-1', name: 'O3+', slug: 'o3-plus', logoUrl: '/images/brands/o3.png' },
  { id: 'brand-2', name: 'VLCC', slug: 'vlcc', logoUrl: '/images/brands/vlcc.png' },
  { id: 'brand-3', name: 'Lotus Herbals', slug: 'lotus-herbals', logoUrl: '/images/brands/lotus.png' },
  { id: 'brand-4', name: 'Mamaearth', slug: 'mamaearth', logoUrl: '/images/brands/mamaearth.png' },
  { id: 'brand-5', name: 'Biotique', slug: 'biotique', logoUrl: '/images/brands/biotique.png' },
  { id: 'brand-6', name: 'Plum', slug: 'plum', logoUrl: '/images/brands/plum.png' },
];

// ============================================
// PRODUCTS
// ============================================
export const products: Product[] = [
  // --- Facial Kits ---
  {
    id: 'prod-1',
    name: 'O3+ Bridal Facial Kit',
    slug: 'o3-bridal-facial-kit',
    description: 'A luxurious 6-step bridal facial kit that gives you salon-like results at home. Includes cleanser, exfoliating scrub, massage cream, face pack, serum, and moisturizer. Perfect for pre-wedding glow and special occasions. Enriched with vitamin E and natural extracts for radiant, flawless skin.',
    shortDescription: 'Complete 6-step bridal facial for radiant glow',
    price: 1899,
    salePrice: 1499,
    categoryId: 'cat-1',
    category: 'Facial Kits',
    brandId: 'brand-1',
    brand: 'O3+',
    skinType: 'all',
    stockQuantity: 25,
    isFeatured: true,
    isActive: true,
    images: ['/images/products/facial-kit-1.png'],
    rating: 4.8,
    reviewCount: 124,
    badge: 'bestseller',
  },
  {
    id: 'prod-2',
    name: 'VLCC Diamond Facial Kit',
    slug: 'vlcc-diamond-facial-kit',
    description: 'VLCC Diamond Facial Kit infused with diamond bhasma for skin polishing and brightening. This premium kit includes a diamond cleanser cum toner, diamond scrub, diamond gel, diamond cream, and diamond pack for a luminous, younger-looking complexion.',
    shortDescription: 'Diamond-infused 5-step facial for luminous skin',
    price: 1299,
    salePrice: 999,
    categoryId: 'cat-1',
    category: 'Facial Kits',
    brandId: 'brand-2',
    brand: 'VLCC',
    skinType: 'all',
    stockQuantity: 30,
    isFeatured: true,
    isActive: true,
    images: ['/images/products/facial-kit-1.png'],
    rating: 4.6,
    reviewCount: 89,
    badge: 'sale',
  },
  {
    id: 'prod-3',
    name: 'Lotus Herbals Gold Facial Kit',
    slug: 'lotus-herbals-gold-facial-kit',
    description: 'Experience the luxury of 24 carat gold with this Ayurvedic facial kit. Contains gold scrub, gold massage gel, gold pack, and gold moisturizer. Revitalizes dull skin, reduces fine lines, and imparts a youthful golden glow.',
    shortDescription: '24K gold-infused Ayurvedic facial treatment',
    price: 899,
    salePrice: null,
    categoryId: 'cat-1',
    category: 'Facial Kits',
    brandId: 'brand-3',
    brand: 'Lotus Herbals',
    skinType: 'all',
    stockQuantity: 40,
    isFeatured: true,
    isActive: true,
    images: ['/images/products/facial-kit-1.png'],
    rating: 4.7,
    reviewCount: 156,
    badge: 'bestseller',
  },
  {
    id: 'prod-4',
    name: 'Mamaearth Vitamin C Facial Kit',
    slug: 'mamaearth-vitamin-c-facial-kit',
    description: 'A complete vitamin C-powered facial kit for brightening and anti-aging. Made with natural ingredients including turmeric, saffron, and vitamin C. Free from toxins, parabens, and sulfates. Suitable for all skin types.',
    shortDescription: 'Natural vitamin C facial for bright, even skin',
    price: 1199,
    salePrice: 949,
    categoryId: 'cat-1',
    category: 'Facial Kits',
    brandId: 'brand-4',
    brand: 'Mamaearth',
    skinType: 'all',
    stockQuantity: 35,
    isFeatured: false,
    isActive: true,
    images: ['/images/products/facial-kit-1.png'],
    rating: 4.5,
    reviewCount: 67,
    badge: 'new',
  },
  // --- Serums ---
  {
    id: 'prod-5',
    name: 'Plum 10% Niacinamide Serum',
    slug: 'plum-niacinamide-serum',
    description: 'A lightweight, fast-absorbing face serum with 10% Niacinamide and Rice Water to minimize pores, control excess oil, and reduce dark spots. Vegan and cruelty-free formula for clear, refined skin.',
    shortDescription: '10% Niacinamide for pore minimizing & oil control',
    price: 649,
    salePrice: 549,
    categoryId: 'cat-2',
    category: 'Serums & Oils',
    brandId: 'brand-6',
    brand: 'Plum',
    skinType: 'oily',
    stockQuantity: 50,
    isFeatured: true,
    isActive: true,
    images: ['/images/products/serum-1.png'],
    rating: 4.7,
    reviewCount: 203,
    badge: 'bestseller',
  },
  {
    id: 'prod-6',
    name: 'Mamaearth Vitamin C Serum',
    slug: 'mamaearth-vitamin-c-serum',
    description: 'Enriched with Vitamin C and turmeric, this serum brightens skin tone, fades dark spots, and provides a natural radiance. Dermatologically tested, suitable for all skin types.',
    shortDescription: 'Vitamin C & turmeric for natural radiance',
    price: 599,
    salePrice: null,
    categoryId: 'cat-2',
    category: 'Serums & Oils',
    brandId: 'brand-4',
    brand: 'Mamaearth',
    skinType: 'all',
    stockQuantity: 45,
    isFeatured: false,
    isActive: true,
    images: ['/images/products/serum-1.png'],
    rating: 4.4,
    reviewCount: 178,
  },
  {
    id: 'prod-7',
    name: 'Biotique Bio Dandelion Serum',
    slug: 'biotique-bio-dandelion-serum',
    description: 'A youth-boosting ageless serum enriched with dandelion, nutmeg oil, and almond oil. Firms, tones, and tightens sagging skin. 100% botanical extracts with no preservatives.',
    shortDescription: 'Ageless lightening serum with botanical extracts',
    price: 449,
    salePrice: 399,
    categoryId: 'cat-2',
    category: 'Serums & Oils',
    brandId: 'brand-5',
    brand: 'Biotique',
    skinType: 'dry',
    stockQuantity: 30,
    isFeatured: false,
    isActive: true,
    images: ['/images/products/serum-1.png'],
    rating: 4.3,
    reviewCount: 92,
    badge: 'sale',
  },
  // --- Cleansers ---
  {
    id: 'prod-8',
    name: 'Plum Green Tea Gentle Cleanser',
    slug: 'plum-green-tea-cleanser',
    description: 'A gentle, soap-free face wash with green tea and glycolic acid. Clears impurities without drying the skin. Perfect for acne-prone and oily skin. 100% vegan.',
    shortDescription: 'Soap-free green tea cleanser for clear skin',
    price: 399,
    salePrice: null,
    categoryId: 'cat-3',
    category: 'Cleansers',
    brandId: 'brand-6',
    brand: 'Plum',
    skinType: 'oily',
    stockQuantity: 60,
    isFeatured: false,
    isActive: true,
    images: ['/images/products/cleanser-1.png'],
    rating: 4.5,
    reviewCount: 312,
  },
  {
    id: 'prod-9',
    name: 'Lotus Herbals Whiteglow Cleanser',
    slug: 'lotus-whiteglow-cleanser',
    description: 'A 3-in-1 deep cleansing skin whitening facial foam enriched with milk enzymes and papaya. Gently exfoliates, removes impurities, and brightens skin in one step.',
    shortDescription: 'Brightening 3-in-1 facial foam with milk enzymes',
    price: 349,
    salePrice: 299,
    categoryId: 'cat-3',
    category: 'Cleansers',
    brandId: 'brand-3',
    brand: 'Lotus Herbals',
    skinType: 'combination',
    stockQuantity: 55,
    isFeatured: false,
    isActive: true,
    images: ['/images/products/cleanser-1.png'],
    rating: 4.2,
    reviewCount: 145,
    badge: 'sale',
  },
  // --- Face Masks ---
  {
    id: 'prod-10',
    name: 'Mamaearth Ubtan Face Mask',
    slug: 'mamaearth-ubtan-face-mask',
    description: 'Traditional ubtan face mask with turmeric, saffron, and apricot oil. Exfoliates dead skin cells, removes tan, and gives an instant glow. Free from harmful chemicals.',
    shortDescription: 'Ubtan mask with turmeric & saffron for instant glow',
    price: 499,
    salePrice: 449,
    categoryId: 'cat-4',
    category: 'Face Masks',
    brandId: 'brand-4',
    brand: 'Mamaearth',
    skinType: 'all',
    stockQuantity: 40,
    isFeatured: true,
    isActive: true,
    images: ['/images/products/mask-1.png'],
    rating: 4.6,
    reviewCount: 234,
    badge: 'bestseller',
  },
  {
    id: 'prod-11',
    name: 'Biotique Bio Fruit Face Pack',
    slug: 'biotique-bio-fruit-face-pack',
    description: 'A youthful, brightening face pack with pineapple, tomato, and lemon extracts. Lightens complexion, smoothens skin texture, and reduces pigmentation. 100% natural.',
    shortDescription: 'Fruit-powered face pack for youthful complexion',
    price: 299,
    salePrice: null,
    categoryId: 'cat-4',
    category: 'Face Masks',
    brandId: 'brand-5',
    brand: 'Biotique',
    skinType: 'all',
    stockQuantity: 35,
    isFeatured: false,
    isActive: true,
    images: ['/images/products/mask-1.png'],
    rating: 4.3,
    reviewCount: 87,
  },
  {
    id: 'prod-12',
    name: 'O3+ Whitening Mask',
    slug: 'o3-whitening-mask',
    description: 'Professional whitening face mask from O3+ that visibly brightens and evens skin tone. Enriched with kojic acid and arbutin for effective melanin control. Ideal for salon and home use.',
    shortDescription: 'Professional whitening mask for even skin tone',
    price: 799,
    salePrice: 649,
    categoryId: 'cat-4',
    category: 'Face Masks',
    brandId: 'brand-1',
    brand: 'O3+',
    skinType: 'all',
    stockQuantity: 20,
    isFeatured: false,
    isActive: true,
    images: ['/images/products/mask-1.png'],
    rating: 4.5,
    reviewCount: 56,
    badge: 'sale',
  },
];

// ============================================
// BLOG POSTS
// ============================================
export const blogPosts: BlogPost[] = [
  {
    id: 'blog-1',
    title: '10 Steps to a Perfect At-Home Facial',
    slug: '10-steps-perfect-at-home-facial',
    content: '',
    excerpt: 'Master the art of self-care with our comprehensive guide to achieving salon-quality facials in the comfort of your home. From cleansing to moisturizing, we cover every step.',
    coverImage: '/images/blog/facial-guide.png',
    authorName: 'Pramod Thakur',
    isPublished: true,
    publishedAt: '2026-06-20',
    createdAt: '2026-06-20',
    readTime: 8,
  },
  {
    id: 'blog-2',
    title: 'Best Serums for Indian Skin: A Complete Guide',
    slug: 'best-serums-indian-skin-guide',
    content: '',
    excerpt: 'Discover the best serums suited for Indian skin tones and types. From Vitamin C to Niacinamide, learn which active ingredients work best for your unique skin needs.',
    coverImage: '/images/blog/serums-guide.png',
    authorName: 'Pramod Thakur',
    isPublished: true,
    publishedAt: '2026-06-15',
    createdAt: '2026-06-15',
    readTime: 6,
  },
  {
    id: 'blog-3',
    title: 'Mumbai Monsoon Skincare: Protect Your Glow',
    slug: 'mumbai-monsoon-skincare-tips',
    content: '',
    excerpt: 'The monsoon season in Mumbai can wreak havoc on your skin. Here are expert tips to maintain your glow, fight humidity-related breakouts, and keep your skincare routine effective.',
    coverImage: '/images/blog/monsoon-care.png',
    authorName: 'Pramod Thakur',
    isPublished: true,
    publishedAt: '2026-06-10',
    createdAt: '2026-06-10',
    readTime: 5,
  },
];

// ============================================
// TESTIMONIALS
// ============================================
export const testimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Priya Sharma',
    location: 'Andheri, Mumbai',
    rating: 5,
    comment: 'The O3+ Bridal Facial Kit gave me the most amazing glow before my wedding! Salon-quality results at home. Beauty Looks Mumbai delivered it super fast too!',
  },
  {
    id: 'test-2',
    name: 'Sneha Patel',
    location: 'Bandra, Mumbai',
    rating: 5,
    comment: 'I have been ordering from Beauty Looks Mumbai for 6 months now. Their product range is genuine and affordable. The Vitamin C serum is my holy grail!',
  },
  {
    id: 'test-3',
    name: 'Anjali Deshmukh',
    location: 'Thane, Mumbai',
    rating: 4,
    comment: 'Love the curated selection of facial kits. The Lotus Gold Facial Kit is incredible — my skin has never looked better. Great customer service too!',
  },
  {
    id: 'test-4',
    name: 'Kavita Nair',
    location: 'Powai, Mumbai',
    rating: 5,
    comment: 'Finally found a trusted online store for beauty products in Mumbai. Everything is genuine, well-packed, and arrives quickly. The WhatsApp support is so convenient!',
  },
  {
    id: 'test-5',
    name: 'Riya Malhotra',
    location: 'Dadar, Mumbai',
    rating: 5,
    comment: 'The Mamaearth Ubtan Face Mask is absolutely divine! My skin feels so soft and bright after every use. Will definitely order more products from here.',
  },
];

// ============================================
// REVIEWS (sample for product pages)
// ============================================
export const sampleReviews = [
  {
    id: 'rev-1',
    userId: 'user-1',
    userName: 'Priya S.',
    productId: 'prod-1',
    rating: 5,
    comment: 'Absolutely love this facial kit! Used it before my engagement and got so many compliments on my skin. The massage cream is heavenly.',
    createdAt: '2026-06-15',
  },
  {
    id: 'rev-2',
    userId: 'user-2',
    userName: 'Meera K.',
    productId: 'prod-1',
    rating: 4,
    comment: 'Great quality product. The serum included in the kit is really effective. Took off one star because the pack could be slightly bigger for the price.',
    createdAt: '2026-06-10',
  },
  {
    id: 'rev-3',
    userId: 'user-3',
    userName: 'Aisha R.',
    productId: 'prod-1',
    rating: 5,
    comment: 'Best facial kit I have ever used! My skin was glowing for days after. Definitely a must-have for anyone who loves self-care.',
    createdAt: '2026-06-05',
  },
];

// Helper: get featured products
export const getFeaturedProducts = (): Product[] =>
  products.filter((p) => p.isFeatured);

// Helper: get products by category
export const getProductsByCategory = (categorySlug: string): Product[] =>
  products.filter((p) => {
    const cat = categories.find((c) => c.slug === categorySlug);
    return cat ? p.categoryId === cat.id : false;
  });

// Helper: get product by slug
export const getProductBySlug = (slug: string): Product | undefined =>
  products.find((p) => p.slug === slug);

// Helper: format price in INR
export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

// Helper: calculate discount percentage
export const getDiscountPercent = (price: number, salePrice: number): number =>
  Math.round(((price - salePrice) / price) * 100);
