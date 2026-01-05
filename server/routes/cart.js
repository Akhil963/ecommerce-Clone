const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { protect } = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: 'name slug images price discount stock'
      });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({
      success: true,
      cart
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', protect, async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    // Calculate final price
    const finalPrice = product.discount > 0
      ? Math.round(product.price - (product.price * product.discount / 100))
      : product.price;

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: 'Cannot add more items. Stock limit reached.'
        });
      }
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = finalPrice;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: finalPrice
      });
    }

    await cart.save();

    // Populate and return cart
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug images price discount stock'
    });

    res.json({
      success: true,
      message: 'Item added to cart',
      cart
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/cart/update
// @desc    Update cart item quantity
// @access  Private
router.put('/update', protect, async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }

    // Find cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find item
    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    // Populate and return cart
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug images price discount stock'
    });

    res.json({
      success: true,
      message: 'Cart updated',
      cart
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:productId', protect, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item
    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );

    await cart.save();

    // Populate and return cart
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug images price discount stock'
    });

    res.json({
      success: true,
      message: 'Item removed from cart',
      cart
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear cart
// @access  Private
router.delete('/clear', protect, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (cart) {
      cart.items = [];
      cart.couponCode = undefined;
      cart.couponDiscount = 0;
      await cart.save();
    }

    res.json({
      success: true,
      message: 'Cart cleared',
      cart
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/cart/apply-coupon
// @desc    Apply coupon to cart
// @access  Private
router.post('/apply-coupon', protect, async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    // Find coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if coupon is valid
    if (!coupon.isValid()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon is expired or no longer valid'
      });
    }

    // Find cart
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Check minimum order amount
    if (cart.subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
      });
    }

    // Check user usage limit
    const userUsageCount = coupon.usedBy.filter(
      u => u.user.toString() === req.user._id.toString()
    ).length;

    if (userUsageCount >= coupon.userUsageLimit) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this coupon'
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = Math.round(cart.subtotal * coupon.discountValue / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    // Apply coupon to cart
    cart.couponCode = coupon.code;
    cart.couponDiscount = discount;
    await cart.save();

    // Populate and return cart
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug images price discount stock'
    });

    res.json({
      success: true,
      message: `Coupon applied! You saved ₹${discount}`,
      cart
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/cart/remove-coupon
// @desc    Remove coupon from cart
// @access  Private
router.delete('/remove-coupon', protect, async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (cart) {
      cart.couponCode = undefined;
      cart.couponDiscount = 0;
      await cart.save();
    }

    // Populate and return cart
    cart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug images price discount stock'
    });

    res.json({
      success: true,
      message: 'Coupon removed',
      cart
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
