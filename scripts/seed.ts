import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We need the service role key to insert without RLS issues, but since we don't have it,
// we'll try with ANON_KEY and see if RLS policies allow inserts (often public while in dev)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define the static data directly here to avoid TS module import issues from src/lib/data.ts
// (which uses React/Next.js imports that might break in a bare node script)

const categories = [
  { name: 'Facial Kits', slug: 'facial-kits', description: 'Complete facial kits for salon-like results at home.', image_url: '/images/categories/facial-kits.png' },
  { name: 'Serums & Oils', slug: 'serums-oils', description: 'Potent serums and nourishing oils for targeted skincare treatments.', image_url: '/images/categories/serums.png' },
  { name: 'Cleansers', slug: 'cleansers', description: 'Gentle yet effective cleansers to purify and refresh your skin daily.', image_url: '/images/categories/cleansers.png' },
  { name: 'Face Masks', slug: 'face-masks', description: 'Luxurious face masks for deep cleansing, hydration, and radiant glow.', image_url: '/images/categories/masks.png' }
];

const brands = [
  { name: 'O3+', slug: 'o3-plus', logo_url: '/images/brands/o3.png' },
  { name: 'VLCC', slug: 'vlcc', logo_url: '/images/brands/vlcc.png' },
  { name: 'Lotus Herbals', slug: 'lotus-herbals', logo_url: '/images/brands/lotus.png' },
  { name: 'Mamaearth', slug: 'mamaearth', logo_url: '/images/brands/mamaearth.png' },
  { name: 'Biotique', slug: 'biotique', logo_url: '/images/brands/biotique.png' },
  { name: 'Plum', slug: 'plum', logo_url: '/images/brands/plum.png' }
];

const staticProducts = [
  {
    name: "O3+ Whitening Facial Kit",
    description: "Achieve salon-like fairness and glow with the O3+ Whitening Facial Kit. This comprehensive kit includes everything you need for a complete facial treatment at home. It helps in brightening the skin, reducing pigmentation, and evening out the skin tone.",
    price: 1550,
    category_slug: 'facial-kits',
    brand_slug: 'o3-plus',
    image: "/images/products/facial-kit-1.png",
    is_featured: true,
    is_active: true
  },
  {
    name: "VLCC Gold Facial Kit",
    description: "Luxurious gold facial kit for a radiant, youthful glow. Enriched with the goodness of 24 carat gold, this facial kit penetrates deep into the skin, improves blood circulation, and restores skin's natural elasticity.",
    price: 1200,
    category_slug: 'facial-kits',
    brand_slug: 'vlcc',
    image: "/images/products/facial-kit-2.png",
    is_featured: true,
    is_active: true
  },
  {
    name: "Lotus Herbals Radiant Diamond Facial",
    description: "Diamond facial for skin polishing and purification. This exclusive kit contains diamond dust that helps gently exfoliate the skin, remove dead cells, and polish the skin surface to reveal a flawless, radiant complexion.",
    price: 1350,
    category_slug: 'facial-kits',
    brand_slug: 'lotus-herbals',
    image: "/images/products/facial-kit-3.png",
    is_featured: true,
    is_active: true
  },
  {
    name: "Mamaearth Vitamin C Face Wash",
    description: "Brightening face wash with Vitamin C and Turmeric. Gently cleanses the skin, removes impurities, and imparts a natural glow. Suitable for all skin types and free from harmful chemicals.",
    price: 399,
    category_slug: 'cleansers',
    brand_slug: 'mamaearth',
    image: "/images/products/facewash-1.png",
    is_featured: true,
    is_active: true
  },
  {
    name: "Biotique Bio Papaya Scrub",
    description: "Revitalizing tan-removal scrub blended with pure papaya fruit. Gently exfoliates dead skin, uncovers natural brightness, and promotes a younger-looking complexion.",
    price: 199,
    category_slug: 'cleansers',
    brand_slug: 'biotique',
    image: "/images/products/scrub-1.png",
    is_featured: true,
    is_active: true
  },
  {
    name: "Plum Green Tea Pore Cleansing Face Wash",
    description: "Gentle, non-drying face wash for acne-prone, oily skin. Formulated with green tea extracts to combat acne and glycolic acid for gentle exfoliation.",
    price: 345,
    category_slug: 'cleansers',
    brand_slug: 'plum',
    image: "/images/products/facewash-2.png",
    is_featured: false,
    is_active: true
  }
];

const blogPosts = [
  {
    title: "10 Steps to a Glowing Complexion",
    excerpt: "Discover the ultimate skincare routine for radiant, healthy-looking skin.",
    content: "Full content here...", // Just a stub, can update later if needed
    cover_image: "/images/blog/blog-1.jpg",
    is_published: true,
    slug: '10-steps-glowing-complexion'
  },
  {
    title: "The Benefits of Vitamin C Serums",
    excerpt: "Learn why Vitamin C is a must-have ingredient in your daily skincare regimen.",
    content: "Full content here...",
    cover_image: "/images/blog/blog-2.jpg",
    is_published: true,
    slug: 'benefits-vitamin-c-serums'
  },
  {
    title: "How to Choose the Right Facial Kit",
    excerpt: "A comprehensive guide to selecting the perfect facial kit for your skin type and concerns.",
    content: "Full content here...",
    cover_image: "/images/blog/blog-3.jpg",
    is_published: true,
    slug: 'choose-right-facial-kit'
  }
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Regular Customer",
    comment: "The O3+ facial kit I bought from BeautyLooks transformed my skin. Excellent quality and fast delivery!",
    rating: 5
  },
  {
    name: "Anjali Patel",
    role: "Salon Owner",
    comment: "I source all my salon products from here. The authentic brands and wholesale prices are unbeatable.",
    rating: 5
  },
  {
    name: "Neha Gupta",
    role: "Skincare Enthusiast",
    comment: "Love the range of serums available. The detailed product descriptions helped me choose exactly what I needed.",
    rating: 4
  }
];

async function seed() {
  console.log('Starting seed...');

  // 1. Seed Categories
  const { data: catData, error: catError } = await supabase.from('categories').upsert(categories, { onConflict: 'slug' }).select();
  if (catError) {
    console.error('Category insert error:', catError);
    // If RLS fails, we can't use JS client easily without service role.
  } else {
    console.log(`Inserted ${catData.length} categories.`);
  }

  // 2. Seed Brands
  const { data: brandData, error: brandError } = await supabase.from('brands').upsert(brands, { onConflict: 'slug' }).select();
  if (brandError) {
    console.error('Brand insert error:', brandError);
  } else {
    console.log(`Inserted ${brandData.length} brands.`);
  }

  // 3. Seed Products
  if (catData && brandData) {
    const productsToInsert = staticProducts.map(p => {
      const category = catData.find(c => c.slug === p.category_slug);
      const brand = brandData.find(b => b.slug === p.brand_slug);
      
      const slug = p.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
      
      return {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        category_id: category?.id,
        brand_id: brand?.id,
        images: [p.image],
        is_featured: p.is_featured,
        is_active: p.is_active
      };
    });

    const { data: prodData, error: prodError } = await supabase.from('products').upsert(productsToInsert, { onConflict: 'slug' }).select();
    if (prodError) {
      console.error('Product insert error:', prodError);
    } else {
      console.log(`Inserted ${prodData.length} products.`);
    }
  }

  // 4. Seed Blog Posts
  const { data: blogData, error: blogError } = await supabase.from('blog_posts').upsert(blogPosts, { onConflict: 'slug' }).select();
  if (blogError) {
    console.error('Blog insert error:', blogError);
  } else {
    console.log(`Inserted ${blogData?.length || 0} blog posts.`);
  }

  // 5. Seed Testimonials (no unique constraint on slug/name so we just insert)
  // Let's truncate first to avoid duplicates
  await supabase.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // hacky truncate
  const { data: testData, error: testError } = await supabase.from('testimonials').insert(testimonials).select();
  if (testError) {
    console.error('Testimonials insert error:', testError);
  } else {
    console.log(`Inserted ${testData?.length || 0} testimonials.`);
  }

  console.log('Seed complete!');
}

seed().catch(console.error);
