const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, optionalAuth } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, pagination
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      rating,
      search,
      featured,
      bestSeller,
      newArrival,
      inStock
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Category filter
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Subcategory filter
    if (subcategory) {
      query.subcategory = subcategory;
    }

    // Brand filter
    if (brand) {
      query.brand = { $in: brand.split(',') };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query['ratings.average'] = { $gte: Number(rating) };
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Feature filters
    if (featured === 'true') query.isFeatured = true;
    if (bestSeller === 'true') query.isBestSeller = true;
    if (newArrival === 'true') query.isNewArrival = true;
    if (inStock === 'true') query.stock = { $gt: 0 };

    // Get total count
    const total = await Product.countDocuments(query);

    // Build sort object
    let sortObj = {};
    if (sort === 'price_asc') sortObj.price = 1;
    else if (sort === 'price_desc') sortObj.price = -1;
    else if (sort === 'rating') sortObj['ratings.average'] = -1;
    else if (sort === 'newest') sortObj.createdAt = -1;
    else if (sort === 'popularity') sortObj.soldCount = -1;
    else sortObj = { createdAt: -1 };

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      products
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug')
      .limit(10);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/products/deals
// @desc    Get deals of the day (products with high discounts)
// @access  Public
router.get('/deals', async (req, res, next) => {
  try {
    const products = await Product.find({
      isActive: true,
      discount: { $gte: 20 }
    })
      .populate('category', 'name slug')
      .sort({ discount: -1 })
      .limit(12);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/products/best-sellers
// @desc    Get best seller products
// @access  Public
router.get('/best-sellers', async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, isBestSeller: true })
      .populate('category', 'name slug')
      .sort({ soldCount: -1 })
      .limit(12);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/products/new-arrivals
// @desc    Get new arrival products
// @access  Public
router.get('/new-arrivals', async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, isNewArrival: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(12);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/products/search
// @desc    Search products
// @access  Public
router.get('/search', async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const query = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } }
      ]
    };

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      products
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/products/id/:id
// @desc    Get single product by ID or slug
// @access  Public
router.get('/id/:id', optionalAuth, async (req, res, next) => {
  try {
    const mongoose = require('mongoose');
    const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    
    // Try to find by ObjectId first, then by slug
    let product;
    if (isValidObjectId) {
      product = await Product.findById(req.params.id)
        .populate('category', 'name slug')
        .populate({
          path: 'reviews',
          populate: { path: 'user', select: 'name avatar' },
          options: { sort: { createdAt: -1 }, limit: 10 }
        });
    }
    
    // If not found by ObjectId, try slug
    if (!product) {
      product = await Product.findOne({ slug: req.params.id })
        .populate('category', 'name slug')
        .populate({
          path: 'reviews',
          populate: { path: 'user', select: 'name avatar' },
          options: { sort: { createdAt: -1 }, limit: 10 }
        });
    }

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    // Check if product is in user's wishlist
    let isInWishlist = false;
    if (req.user) {
      isInWishlist = req.user.wishlist.includes(product._id);
    }

    res.json({
      success: true,
      product,
      isInWishlist
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/products/:slug
// @desc    Get single product by slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name avatar' },
        options: { sort: { createdAt: -1 }, limit: 10 }
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    // Check if product is in user's wishlist
    let isInWishlist = false;
    if (req.user) {
      isInWishlist = req.user.wishlist.includes(product._id);
    }

    res.json({
      success: true,
      product,
      isInWishlist
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/products/:id/related
// @desc    Get related products
// @access  Public
router.get('/:id/related', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [
        { category: product.category },
        { brand: product.brand },
        { tags: { $in: product.tags } }
      ]
    })
      .populate('category', 'name slug')
      .limit(8);

    res.json({
      success: true,
      count: relatedProducts.length,
      products: relatedProducts
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
