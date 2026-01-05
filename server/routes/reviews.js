const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// @route   GET /api/reviews/product/:productId
// @desc    Get reviews for a product
// @access  Public
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', rating } = req.query;

    const query = { product: req.params.productId, isApproved: true };
    if (rating) query.rating = Number(rating);

    const total = await Review.countDocuments(query);

    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // Get rating breakdown
    const ratingStats = await Review.aggregate([
      { $match: { product: req.params.productId, isApproved: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingStats.forEach(stat => {
      ratingBreakdown[stat._id] = stat.count;
    });

    res.json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      ratingBreakdown,
      reviews
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/reviews/:productId
// @desc    Create review for a product
// @access  Private
router.post('/:productId', protect, async (req, res, next) => {
  try {
    const { rating, title, comment, images } = req.body;

    // Check if product exists
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: req.params.productId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.product': req.params.productId,
      orderStatus: 'delivered'
    });

    // Create review
    const review = await Review.create({
      user: req.user._id,
      product: req.params.productId,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase: !!hasPurchased
    });

    // Add review to product
    product.reviews.push(review._id);
    await product.save();

    // Populate user info
    await review.populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (err) {
    next(err);
  }
});

// @route   PUT /api/reviews/:reviewId
// @desc    Update review
// @access  Private
router.put('/:reviewId', protect, async (req, res, next) => {
  try {
    const review = await Review.findOne({
      _id: req.params.reviewId,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const { rating, title, comment, images } = req.body;

    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;
    if (images) review.images = images;

    await review.save();
    await review.populate('user', 'name avatar');

    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (err) {
    next(err);
  }
});

// @route   DELETE /api/reviews/:reviewId
// @desc    Delete review
// @access  Private
router.delete('/:reviewId', protect, async (req, res, next) => {
  try {
    const review = await Review.findOne({
      _id: req.params.reviewId,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Remove review from product
    await Product.findByIdAndUpdate(review.product, {
      $pull: { reviews: review._id }
    });

    await review.deleteOne();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/reviews/:reviewId/helpful
// @desc    Mark review as helpful
// @access  Private
router.post('/:reviewId/helpful', protect, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    const { isHelpful } = req.body;

    // Check if user already voted
    const existingVote = review.helpfulVotes.find(
      vote => vote.user.toString() === req.user._id.toString()
    );

    if (existingVote) {
      // Update vote
      existingVote.isHelpful = isHelpful;
    } else {
      // Add new vote
      review.helpfulVotes.push({
        user: req.user._id,
        isHelpful
      });
    }

    // Recalculate helpful count
    review.helpfulCount = review.helpfulVotes.filter(v => v.isHelpful).length;
    await review.save();

    res.json({
      success: true,
      message: 'Vote recorded',
      helpfulCount: review.helpfulCount
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
