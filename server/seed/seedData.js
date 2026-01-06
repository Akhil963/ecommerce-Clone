const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// Sample placeholder images
const placeholderImages = {
  electronics: [
    'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500',
    'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=500',
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500'
  ],
  fashion: [
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=500',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500'
  ],
  home: [
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'
  ],
  books: [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500'
  ],
  sports: [
    'https://images.unsplash.com/photo-1461896836934- voices?w=500',
    'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500'
  ],
  beauty: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500'
  ]
};

// Categories data
const categoriesData = [
  {
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300',
    icon: '📱',
    subcategories: [
      { name: 'Smartphones', slug: 'smartphones' },
      { name: 'Laptops', slug: 'laptops' },
      { name: 'Tablets', slug: 'tablets' },
      { name: 'Accessories', slug: 'accessories' },
      { name: 'Cameras', slug: 'cameras' }
    ]
  },
  {
    name: 'Fashion',
    description: 'Clothing, shoes, and accessories',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300',
    icon: '👕',
    subcategories: [
      { name: "Men's Clothing", slug: 'mens-clothing' },
      { name: "Women's Clothing", slug: 'womens-clothing' },
      { name: 'Footwear', slug: 'footwear' },
      { name: 'Watches', slug: 'watches' },
      { name: 'Jewelry', slug: 'jewelry' }
    ]
  },
  {
    name: 'Home & Kitchen',
    description: 'Home decor, furniture, and kitchen appliances',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300',
    icon: '🏠',
    subcategories: [
      { name: 'Furniture', slug: 'furniture' },
      { name: 'Kitchen Appliances', slug: 'kitchen-appliances' },
      { name: 'Home Decor', slug: 'home-decor' },
      { name: 'Bedding', slug: 'bedding' }
    ]
  },
  {
    name: 'Books',
    description: 'Books, eBooks, and audiobooks',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
    icon: '📚',
    subcategories: [
      { name: 'Fiction', slug: 'fiction' },
      { name: 'Non-Fiction', slug: 'non-fiction' },
      { name: 'Academic', slug: 'academic' },
      { name: 'Children', slug: 'children' }
    ]
  },
  {
    name: 'Sports & Fitness',
    description: 'Sports equipment and fitness gear',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300',
    icon: '⚽',
    subcategories: [
      { name: 'Exercise Equipment', slug: 'exercise-equipment' },
      { name: 'Sports Gear', slug: 'sports-gear' },
      { name: 'Outdoor', slug: 'outdoor' },
      { name: 'Sportswear', slug: 'sportswear' }
    ]
  },
  {
    name: 'Beauty & Health',
    description: 'Beauty products and health essentials',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300',
    icon: '💄',
    subcategories: [
      { name: 'Skincare', slug: 'skincare' },
      { name: 'Makeup', slug: 'makeup' },
      { name: 'Hair Care', slug: 'hair-care' },
      { name: 'Personal Care', slug: 'personal-care' }
    ]
  }
];

// Products data generator
const generateProducts = (categories) => {
  const products = [];
  
  const electronicsProducts = [
    { name: 'iPhone 15 Pro Max', price: 159900, discount: 5, brand: 'Apple', description: 'The most powerful iPhone ever with A17 Pro chip, titanium design, and Action button.' },
    { name: 'Samsung Galaxy S24 Ultra', price: 134999, discount: 10, brand: 'Samsung', description: 'Galaxy AI is here. Search like never before, Icons changed, Notes made easy.' },
    { name: 'MacBook Air M3', price: 114900, discount: 0, brand: 'Apple', description: 'Strikingly thin and fast with M3 chip. Up to 18 hours of battery life.' },
    { name: 'Sony WH-1000XM5', price: 29990, discount: 15, brand: 'Sony', description: 'Industry-leading noise cancellation headphones with exceptional sound quality.' },
    { name: 'iPad Pro 12.9"', price: 112900, discount: 8, brand: 'Apple', description: 'The ultimate iPad experience with M2 chip and Liquid Retina XDR display.' },
    { name: 'Dell XPS 15', price: 189990, discount: 12, brand: 'Dell', description: '15.6" OLED display, Intel Core i9, 32GB RAM, perfect for creators.' },
    { name: 'AirPods Pro 2', price: 24900, discount: 5, brand: 'Apple', description: 'Active Noise Cancellation, Personalized Spatial Audio, up to 6 hours of listening time.' },
    { name: 'Canon EOS R6 Mark II', price: 243995, discount: 10, brand: 'Canon', description: 'Full-frame mirrorless camera with 24.2MP sensor and 4K 60fps video.' },
    { name: 'OnePlus 12', price: 64999, discount: 15, brand: 'OnePlus', description: 'Snapdragon 8 Gen 3, 5400mAh battery, Hasselblad cameras.' },
    { name: 'LG C3 65" OLED TV', price: 189990, discount: 20, brand: 'LG', description: 'Self-lit OLED pixels, α9 AI Processor Gen6, webOS 23.' }
  ];

  const fashionProducts = [
    { name: 'Levi\'s 501 Original Jeans', price: 3999, discount: 20, brand: "Levi's", description: 'The original fit since 1873. Straight leg, button fly, iconic style.' },
    { name: 'Nike Air Max 270', price: 14995, discount: 25, brand: 'Nike', description: 'Max Air unit delivers unbelievable comfort. Mesh and foam upper for breathability.' },
    { name: 'Fossil Gen 6 Smartwatch', price: 24995, discount: 30, brand: 'Fossil', description: 'Snapdragon Wear 4100+ platform, fast charging, SpO2 tracker.' },
    { name: 'Ray-Ban Aviator', price: 15490, discount: 10, brand: 'Ray-Ban', description: 'Classic Aviator sunglasses with iconic metal frame.' },
    { name: 'Tommy Hilfiger Polo', price: 4999, discount: 15, brand: 'Tommy Hilfiger', description: 'Classic fit polo shirt in signature cotton piqué.' },
    { name: 'Adidas Ultraboost 23', price: 16999, discount: 20, brand: 'Adidas', description: 'Responsive Boost midsole, Primeknit upper, Continental rubber outsole.' },
    { name: 'Michael Kors Tote Bag', price: 18500, discount: 25, brand: 'Michael Kors', description: 'Signature logo tote with zip closure and multiple pockets.' },
    { name: 'Swarovski Crystal Necklace', price: 12990, discount: 15, brand: 'Swarovski', description: 'Stunning crystal pendant with rhodium plating.' }
  ];

  const homeProducts = [
    { name: 'IKEA MALM Bed Frame', price: 24990, discount: 10, brand: 'IKEA', description: 'Clean design with adjustable bed sides, high or low.' },
    { name: 'Instant Pot Duo 7-in-1', price: 8995, discount: 30, brand: 'Instant Pot', description: 'Pressure cooker, slow cooker, rice cooker, steamer, and more.' },
    { name: 'Dyson V15 Detect', price: 62900, discount: 15, brand: 'Dyson', description: 'Laser reveals microscopic dust. LCD screen shows live count.' },
    { name: 'Philips Air Fryer XXL', price: 17995, discount: 20, brand: 'Philips', description: 'XXL capacity for family meals, Rapid Air technology.' },
    { name: 'Sleepwell Mattress Queen', price: 35000, discount: 25, brand: 'Sleepwell', description: 'Ortho mattress with quilted fabric cover, medium firm.' },
    { name: 'Samsung 253L Refrigerator', price: 28990, discount: 18, brand: 'Samsung', description: 'Digital Inverter Technology, All-around cooling.' }
  ];

  const booksProducts = [
    { name: 'Atomic Habits', price: 599, discount: 10, brand: 'James Clear', description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.' },
    { name: 'The Psychology of Money', price: 399, discount: 15, brand: 'Morgan Housel', description: 'Timeless lessons on wealth, greed, and happiness.' },
    { name: 'Rich Dad Poor Dad', price: 499, discount: 20, brand: 'Robert Kiyosaki', description: 'What the Rich Teach Their Kids About Money.' },
    { name: 'Ikigai', price: 350, discount: 10, brand: 'Héctor García', description: 'The Japanese Secret to a Long and Happy Life.' },
    { name: 'The Alchemist', price: 299, discount: 5, brand: 'Paulo Coelho', description: 'A fable about following your dream.' }
  ];

  const sportsProducts = [
    { name: 'Fitbit Charge 6', price: 14999, discount: 10, brand: 'Fitbit', description: 'Advanced health and fitness tracker with GPS.' },
    { name: 'Yonex Nanoray Light', price: 4999, discount: 15, brand: 'Yonex', description: 'Lightweight badminton racket for beginners.' },
    { name: 'Nike Dri-FIT T-Shirt', price: 2495, discount: 20, brand: 'Nike', description: 'Moisture-wicking fabric keeps you dry and comfortable.' },
    { name: 'Decathlon Treadmill', price: 45999, discount: 25, brand: 'Decathlon', description: 'Foldable treadmill with 12 programs and heart rate monitor.' },
    { name: 'Yoga Mat Premium', price: 1999, discount: 10, brand: 'Liforme', description: 'Eco-friendly yoga mat with alignment markers.' }
  ];

  const beautyProducts = [
    { name: 'Maybelline Fit Me Foundation', price: 499, discount: 15, brand: 'Maybelline', description: 'Lightweight foundation for natural-looking coverage.' },
    { name: 'Olay Regenerist Cream', price: 1999, discount: 20, brand: 'Olay', description: 'Anti-aging moisturizer with niacinamide and peptides.' },
    { name: 'MAC Ruby Woo Lipstick', price: 1950, discount: 10, brand: 'MAC', description: 'Iconic retro matte red lipstick.' },
    { name: 'The Ordinary Niacinamide', price: 590, discount: 5, brand: 'The Ordinary', description: '10% Niacinamide + 1% Zinc for blemish-prone skin.' },
    { name: 'Dove Deep Moisture Body Wash', price: 375, discount: 10, brand: 'Dove', description: 'Moisturizing body wash with NutriumMoisture technology.' }
  ];

  // Map products to categories
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.name] = cat._id;
  });

  const addProducts = (productList, categoryName, images) => {
    productList.forEach((p, index) => {
      const productSlug = generateSlug(p.name) + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
      const sku = 'SKU-' + categoryName.substring(0, 3).toUpperCase() + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
      products.push({
        name: p.name,
        slug: productSlug,
        description: p.description,
        shortDescription: p.description.substring(0, 100),
        price: p.price,
        comparePrice: Math.round(p.price * (1 + p.discount / 100)),
        discount: p.discount,
        images: [
          { url: images[index % images.length], alt: p.name },
          { url: images[(index + 1) % images.length], alt: p.name }
        ],
        category: categoryMap[categoryName],
        brand: p.brand,
        stock: Math.floor(Math.random() * 100) + 10,
        sku: sku,
        features: ['Premium Quality', 'Fast Delivery', '1 Year Warranty'],
        tags: [categoryName.toLowerCase(), p.brand.toLowerCase()],
        ratings: {
          average: (3.5 + Math.random() * 1.5).toFixed(1),
          count: Math.floor(Math.random() * 500) + 50
        },
        isFeatured: Math.random() > 0.7,
        isBestSeller: Math.random() > 0.8,
        isNewArrival: Math.random() > 0.7,
        soldCount: Math.floor(Math.random() * 1000),
        deliveryInfo: {
          freeDelivery: p.price > 499,
          estimatedDays: Math.floor(Math.random() * 5) + 2,
          deliveryCharge: p.price > 499 ? 0 : 40
        },
        returnPolicy: {
          returnable: true,
          returnDays: 7
        },
        warranty: {
          hasWarranty: categoryName === 'Electronics',
          duration: categoryName === 'Electronics' ? '1 Year' : null
        }
      });
    });
  };

  addProducts(electronicsProducts, 'Electronics', placeholderImages.electronics);
  addProducts(fashionProducts, 'Fashion', placeholderImages.fashion);
  addProducts(homeProducts, 'Home & Kitchen', placeholderImages.home);
  addProducts(booksProducts, 'Books', placeholderImages.books);
  addProducts(sportsProducts, 'Sports & Fitness', placeholderImages.sports);
  addProducts(beautyProducts, 'Beauty & Health', placeholderImages.beauty);

  return products;
};

// Coupons data
const couponsData = [
  {
    code: 'WELCOME10',
    description: 'Get 10% off on your first order',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 500,
    maxDiscount: 200,
    usageLimit: 1000,
    userUsageLimit: 1,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  },
  {
    code: 'FLAT500',
    description: 'Flat ₹500 off on orders above ₹2000',
    discountType: 'fixed',
    discountValue: 500,
    minOrderAmount: 2000,
    usageLimit: 500,
    userUsageLimit: 2,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    code: 'SUMMER25',
    description: 'Summer sale! Get 25% off',
    discountType: 'percentage',
    discountValue: 25,
    minOrderAmount: 1000,
    maxDiscount: 1000,
    usageLimit: 200,
    userUsageLimit: 1,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  }
];

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Ecommerce_Clone:69hQejy3NDFBYCub@ecommerceclone.uptv2tb.mongodb.net/ecommerce_amazon?retryWrites=true&w=majority&appName=EcommerceClone');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    
    // Drop indexes to avoid conflicts
    try {
      await mongoose.connection.collection('categories').dropIndexes();
      await mongoose.connection.collection('products').dropIndexes();
    } catch (e) {
      // Indexes might not exist, ignore
    }
    
    console.log('Cleared existing data');

    // Create admin user (don't pre-hash - let the model middleware handle it)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@amazon.com',
      password: 'admin123',
      role: 'admin',
      isEmailVerified: true,
      authProvider: 'local'
    });
    console.log('Admin user created:', admin.email);

    // Create test user (don't pre-hash - let the model middleware handle it)
    const user = await User.create({
      name: 'Test User',
      email: 'user@amazon.com',
      password: 'user123',
      role: 'user',
      isEmailVerified: true,
      authProvider: 'local',
      addresses: [
        {
          fullName: 'Test User',
          phone: '9876543210',
          addressLine1: '123 Main Street',
          addressLine2: 'Apt 4B',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India',
          isDefault: true
        }
      ]
    });
    console.log('Test user created:', user.email);

    // Create categories with slugs
    const categoriesWithSlugs = categoriesData.map(cat => ({
      ...cat,
      slug: generateSlug(cat.name)
    }));
    const categories = await Category.insertMany(categoriesWithSlugs);
    console.log(`Created ${categories.length} categories`);

    // Create products
    const productsData = generateProducts(categories);
    const products = await Product.insertMany(productsData);
    console.log(`Created ${products.length} products`);

    // Create coupons
    const coupons = await Coupon.insertMany(couponsData);
    console.log(`Created ${coupons.length} coupons`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@amazon.com / admin123');
    console.log('User: user@amazon.com / user123');
    console.log('\nCoupon Codes: WELCOME10, FLAT500, SUMMER25');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
