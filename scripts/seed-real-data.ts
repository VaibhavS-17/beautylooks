import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const categories = [
  { name: 'Facial Kits & Spa', slug: 'facial-kits-spa', description: 'Complete facial kits for salon-like results at home.', image_url: '/images/categories/facial-kits.png' },
  { name: 'Hair Care', slug: 'hair-care', description: 'Professional hair care treatments, shampoos, and masks.', image_url: '/images/categories/haircare.png' },
  { name: 'Wax & Bleach', slug: 'wax-bleach', description: 'Professional de-tan, bleach, and waxing solutions.', image_url: '/images/categories/wax.png' }
];

const brands = [
  { name: 'Oxylife', slug: 'oxylife', logo_url: '/images/brands/oxylife.png' },
  { name: 'QOD Professional', slug: 'qod-professional', logo_url: '/images/brands/qod.png' },
  { name: 'Raaga Professional', slug: 'raaga-professional', logo_url: '/images/brands/raaga.png' },
  { name: 'Fem', slug: 'fem', logo_url: '/images/brands/fem.png' },
  { name: 'Wella Professionals', slug: 'wella-professionals', logo_url: '/images/brands/wella.png' },
  { name: 'Brazilian Hairtech', slug: 'brazilian-hairtech', logo_url: '/images/brands/brazilian.png' },
  { name: 'Luxliss Professional', slug: 'luxliss-professional', logo_url: '/images/brands/luxliss.png' }
];

const realProducts = [
  // Oxylife
  {
    name: "Oxylife Aqua Manicure & Pedicure Kit",
    description: "6-step spa regime enriched with natural ingredients; lets skin breathe.",
    price: 1250,
    category_slug: 'facial-kits-spa',
    brand_slug: 'oxylife',
    image: "/images/products/oxylife-aqua.png",
    is_featured: false,
    is_active: true
  },
  {
    name: "Oxylife Pro Radiance Pure Oxygen Facial",
    description: "Salon-professional facial kit powered by OxySphere Technology for radiant, oxygenated skin.",
    price: 1800,
    category_slug: 'facial-kits-spa',
    brand_slug: 'oxylife',
    image: "/images/products/oxylife-pro.png",
    is_featured: true,
    is_active: true
  },
  {
    name: "Oxylife Gluta White Radiance",
    description: "10-step ritual facial with Glutathione, Alpha Arbutin & Sea Mineral Extract for brightening.",
    price: 2100,
    category_slug: 'facial-kits-spa',
    brand_slug: 'oxylife',
    image: "/images/products/oxylife-gluta.png",
    is_featured: true,
    is_active: true
  },
  {
    name: "Oxylife Hydra Boost Radiance",
    description: "10-step ritual facial with Hyaluronic Acid, Red Algae & Centella Asiatica for deep hydration.",
    price: 1950,
    category_slug: 'facial-kits-spa',
    brand_slug: 'oxylife',
    image: "/images/products/oxylife-hydra.png",
    is_featured: false,
    is_active: true
  },
  {
    name: "Oxylife Intense Bright",
    description: "Advanced facial for ultimate radiance with Kojic Acid & Vitamin C; antioxidant powerhouse.",
    price: 1750,
    category_slug: 'facial-kits-spa',
    brand_slug: 'oxylife',
    image: "/images/products/oxylife-intense.png",
    is_featured: false,
    is_active: true
  },
  {
    name: "Oxylife Tan Clear (Tan Clean System)",
    description: "Pure Oxygen De-Tan System — includes Tan Clean Scrub + Tan Clean Pack, powered by OxySphere Technology.",
    price: 950,
    category_slug: 'wax-bleach',
    brand_slug: 'oxylife',
    image: "/images/products/oxylife-tan.png",
    is_featured: true,
    is_active: true
  },
  {
    name: "Oxylife Korean Glass Glow",
    description: "10-step ritual facial with Korean Ginseng, Licorice Extract & Collagen for glass-skin glow.",
    price: 2400,
    category_slug: 'facial-kits-spa',
    brand_slug: 'oxylife',
    image: "/images/products/oxylife-korean.png",
    is_featured: true,
    is_active: true
  },
  {
    name: "Oxylife Natural Radiance 5 Crème Bleach System",
    description: "Salon-recommended crème bleach system with OxySphere Technology; includes pre-bleach, bleach cream & post-bleach radiance mask.",
    price: 550,
    category_slug: 'wax-bleach',
    brand_slug: 'oxylife',
    image: "/images/products/oxylife-bleach.png",
    is_featured: false,
    is_active: true
  },
  {
    name: "Oxylife Professional Facial Kit",
    description: "Salon-professional facial kit — face that glows with life.",
    price: 1500,
    category_slug: 'facial-kits-spa',
    brand_slug: 'oxylife',
    image: "/images/products/oxylife-facial.png",
    is_featured: false,
    is_active: true
  },

  // QOD Professional
  {
    name: "QOD Professional Argan Shampoo",
    description: "Moisture & shine shampoo, sulfate & chloride free, 300ml.",
    price: 850,
    category_slug: 'hair-care',
    brand_slug: 'qod-professional',
    image: "/images/products/qod-shampoo.png",
    is_featured: true,
    is_active: true
  },
  {
    name: "QOD Professional Argan Conditioner",
    description: "Moisture & shine conditioner, 300ml.",
    price: 850,
    category_slug: 'hair-care',
    brand_slug: 'qod-professional',
    image: "/images/products/qod-conditioner.png",
    is_featured: false,
    is_active: true
  },
  {
    name: "QOD Professional Max Prime Hair Mask",
    description: "Smooth & shine hair mask, 300ml.",
    price: 1100,
    category_slug: 'hair-care',
    brand_slug: 'qod-professional',
    image: "/images/products/qod-mask.png",
    is_featured: false,
    is_active: true
  },
  {
    name: "QOD Professional Max Prime Shampoo",
    description: "Smooth & shine shampoo with Keratin, Caffeine & Laurine, sulphate free, 300ml.",
    price: 950,
    category_slug: 'hair-care',
    brand_slug: 'qod-professional',
    image: "/images/products/qod-max-shampoo.png",
    is_featured: true,
    is_active: true
  },

  // Raaga Professional
  {
    name: "Raaga Professional Detan Tan Removal Cream",
    description: "Tan removal cream with Kojic Acid & Milk; dermatologically tested, peroxide-free, hydroquinone-free, sulphate-free.",
    price: 650,
    category_slug: 'wax-bleach',
    brand_slug: 'raaga-professional',
    image: "/images/products/raaga-detan.png",
    is_featured: true,
    is_active: true
  },
  {
    name: "Raaga Professional Clé de Lisse Liposoluble Wax (White Chocolate)",
    description: "Liposoluble wax with imported ingredients, paraben-free, recommended for dry skin.",
    price: 800,
    category_slug: 'wax-bleach',
    brand_slug: 'raaga-professional',
    image: "/images/products/raaga-wax.png",
    is_featured: false,
    is_active: true
  },

  // Fem
  {
    name: "Fem Salon Professional Crème Bleach (Saffron & Milk)",
    description: "Gives a healthy glow in 15 minutes.",
    price: 350,
    category_slug: 'wax-bleach',
    brand_slug: 'fem',
    image: "/images/products/fem-bleach.png",
    is_featured: false,
    is_active: true
  },
  {
    name: "Fem Niacinamide Glass Glow 7-Step Facial Kit",
    description: "7-step facial kit with 24K Gold + Niacinamide for glass-glow skin.",
    price: 1200,
    category_slug: 'facial-kits-spa',
    brand_slug: 'fem',
    image: "/images/products/fem-glass-glow.png",
    is_featured: true,
    is_active: true
  },
  {
    name: "Fem Hyaluronic Lumi-Bright 7-Step Facial Kit",
    description: "7-step facial kit with Pure Diamond + Hyaluronic Acid for luminous, bright skin.",
    price: 1300,
    category_slug: 'facial-kits-spa',
    brand_slug: 'fem',
    image: "/images/products/fem-lumi.png",
    is_featured: false,
    is_active: true
  },

  // Wella
  {
    name: "Wella Professionals Blondor Multi Blonde 7 Powder Lightener",
    description: "Powder hair lightener with anti-brass complex, suitable for multiple hair types & techniques, 400g.",
    price: 1450,
    category_slug: 'hair-care',
    brand_slug: 'wella-professionals',
    image: "/images/products/wella-blondor.png",
    is_featured: true,
    is_active: true
  },

  // Brazilian Hairtech
  {
    name: "Brazilian Hairtech Copa Cabana Brazilian Protein",
    description: "Professional-use hair treatment (Tanino Botox Treatment) for smoothing and strengthening, 1000ml.",
    price: 4500,
    category_slug: 'hair-care',
    brand_slug: 'brazilian-hairtech',
    image: "/images/products/brazilian-protein.png",
    is_featured: true,
    is_active: true
  },

  // Luxliss
  {
    name: "Luxliss Professional Keratin Smoothing Treatment",
    description: "Ultra-smooth & straight hair treatment infused with Argan Oil; protects hair, 1000ml.",
    price: 5200,
    category_slug: 'hair-care',
    brand_slug: 'luxliss-professional',
    image: "/images/products/luxliss-keratin.png",
    is_featured: true,
    is_active: true
  }
];

async function seed() {
  console.log('Starting seed...');

  // 1. Seed Categories
  const { data: catData, error: catError } = await supabase.from('categories').upsert(categories, { onConflict: 'slug' }).select();
  if (catError) {
    console.error('Category insert error:', catError);
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

  // 3. Clear existing products (since we're refreshing with real data)
  console.log('Clearing existing products...');
  const { error: delError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) {
    console.error('Error deleting old products:', delError);
  }

  // 4. Seed Real Products
  if (catData && brandData) {
    const productsToInsert = realProducts.map(p => {
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
      console.log(`Inserted ${prodData.length} real products.`);
    }
  }

  console.log('Real data seed complete!');
}

seed().catch(console.error);
