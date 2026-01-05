const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true, parent: null })
      .sort({ displayOrder: 1, name: 1 });

    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/categories/all
// @desc    Get all categories including subcategories
// @access  Public
router.get('/all', async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name slug')
      .sort({ displayOrder: 1, name: 1 });

    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/categories/:slug
// @desc    Get single category by slug
// @access  Public
router.get('/:slug', async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true })
      .populate('parent', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get child categories if this is a parent
    const childCategories = await Category.find({ parent: category._id, isActive: true });

    res.json({
      success: true,
      category,
      subcategories: childCategories
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
