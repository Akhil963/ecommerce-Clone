import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '-createdAt';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';
  const featured = searchParams.get('featured') || '';
  const bestSeller = searchParams.get('bestSeller') || '';
  const newArrival = searchParams.get('newArrival') || '';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        sort,
        category,
        minPrice,
        maxPrice,
        rating,
        featured,
        bestSeller,
        newArrival
      };

      const response = await productsAPI.getAll(params);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({ page: '1' });
  };

  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Avg. Customer Review' },
    { value: 'popularity', label: 'Popularity' }
  ];

  const priceRanges = [
    { min: 0, max: 500, label: 'Under ₹500' },
    { min: 500, max: 1000, label: '₹500 - ₹1,000' },
    { min: 1000, max: 5000, label: '₹1,000 - ₹5,000' },
    { min: 5000, max: 10000, label: '₹5,000 - ₹10,000' },
    { min: 10000, max: '', label: 'Over ₹10,000' }
  ];

  const FilterSidebar = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Category</h3>
        <ul className="space-y-1.5 sm:space-y-2">
          <li>
            <button
              onClick={() => updateFilters('category', '')}
              className={`text-xs sm:text-sm block py-1 transition-colors ${!category ? 'text-amazon-orange font-medium' : 'text-gray-600 dark:text-gray-400 hover:text-amazon-orange'}`}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat._id}>
              <button
                onClick={() => updateFilters('category', cat.slug)}
                className={`text-xs sm:text-sm block py-1 transition-colors ${category === cat.slug ? 'text-amazon-orange font-medium' : 'text-gray-600 dark:text-gray-400 hover:text-amazon-orange'}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Price</h3>
        <ul className="space-y-1.5 sm:space-y-2">
          {priceRanges.map((range, index) => (
            <li key={index}>
              <button
                onClick={() => {
                  updateFilters('minPrice', range.min);
                  updateFilters('maxPrice', range.max);
                }}
                className={`text-xs sm:text-sm block py-1 transition-colors ${
                  minPrice === String(range.min) && maxPrice === String(range.max)
                    ? 'text-amazon-orange font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-amazon-orange'
                }`}
              >
                {range.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Avg. Customer Review</h3>
        <ul className="space-y-1.5 sm:space-y-2">
          {[4, 3, 2, 1].map((stars) => (
            <li key={stars}>
              <button
                onClick={() => updateFilters('rating', stars)}
                className={`flex items-center text-xs sm:text-sm py-1 transition-colors ${
                  rating === String(stars)
                    ? 'text-amazon-orange font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-amazon-orange'
                }`}
              >
                <div className="flex text-yellow-400 mr-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${i < stars ? 'fill-current' : 'text-gray-300'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="hidden sm:inline">& Up</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Clear Filters */}
      {(category || minPrice || maxPrice || rating) && (
        <button
          onClick={clearFilters}
          className="text-amazon-blue hover:text-amazon-orange text-xs sm:text-sm hover:underline transition-colors font-medium"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">
              {featured ? 'Featured Products' : bestSeller ? 'Best Sellers' : newArrival ? 'New Arrivals' : 'All Products'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {products.length} results
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden xs:inline">Filters</span>
            </button>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => updateFilters('sort', e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-amazon-orange focus:border-amazon-orange transition-colors"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 md:gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          {filterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setFilterOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 sm:w-80 bg-white dark:bg-gray-800 p-3 sm:p-4 overflow-y-auto shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                  <button onClick={() => setFilterOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                  </button>
                </div>
                <FilterSidebar />
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <Loading fullScreen={false} />
            ) : products.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No products found</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 text-sm text-amazon-orange hover:underline transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap justify-center mt-6 sm:mt-8 gap-1.5 sm:gap-2">
                    <button
                      onClick={() => updateFilters('page', Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Previous
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => updateFilters('page', page)}
                          className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded transition-colors ${
                            currentPage === page
                              ? 'bg-amazon-orange text-white font-semibold'
                              : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => updateFilters('page', Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
