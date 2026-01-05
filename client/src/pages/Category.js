import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { categoriesAPI, productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import { FunnelIcon, XMarkIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

const Category = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || '-createdAt';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';

  useEffect(() => {
    fetchCategory();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, searchParams]);

  const fetchCategory = async () => {
    try {
      const response = await categoriesAPI.getOne(slug);
      setCategory(response.data.category);
      
      // Fetch subcategories
      const allCategories = await categoriesAPI.getAllWithSub();
      const subs = allCategories.data.categories.filter(
        (c) => c.parent?._id === response.data.category._id
      );
      setSubcategories(subs);
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        category: slug,
        page: currentPage,
        limit: 12,
        sort,
        minPrice,
        maxPrice,
        rating
      };

      const response = await productsAPI.getAll(params);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setTotalProducts(response.data.total);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">Subcategories</h3>
          <ul className="space-y-2">
            {subcategories.map((sub) => (
              <li key={sub._id}>
                <Link
                  to={`/category/${sub.slug}`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-amazon-orange"
                >
                  {sub.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Price</h3>
        <ul className="space-y-2">
          {priceRanges.map((range, index) => (
            <li key={index}>
              <button
                onClick={() => {
                  updateFilters('minPrice', range.min);
                  updateFilters('maxPrice', range.max);
                }}
                className={`text-sm ${
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
        <h3 className="font-bold text-gray-900 dark:text-white mb-3">Avg. Customer Review</h3>
        <ul className="space-y-2">
          {[4, 3, 2, 1].map((stars) => (
            <li key={stars}>
              <button
                onClick={() => updateFilters('rating', stars)}
                className={`flex items-center text-sm ${
                  rating === String(stars)
                    ? 'text-amazon-orange font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:text-amazon-orange'
                }`}
              >
                <div className="flex text-yellow-400 mr-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-4 w-4 ${i < stars ? 'fill-current' : 'text-gray-300'}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                & Up
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Clear Filters */}
      {(minPrice || maxPrice || rating) && (
        <button
          onClick={clearFilters}
          className="text-amazon-blue hover:text-amazon-orange text-sm hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  if (!category && !loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Category Not Found
          </h2>
          <Link to="/products" className="text-amazon-orange hover:underline">
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Category Banner */}
      {category?.image && (
        <div className="relative h-48 md:h-64 bg-gray-800">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {category?.name}
              </h1>
              {category?.description && (
                <p className="text-white/80 max-w-2xl mx-auto px-4">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <li>
              <Link to="/" className="hover:text-amazon-orange">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/products" className="hover:text-amazon-orange">
                Products
              </Link>
            </li>
            {category?.parent && (
              <>
                <li>/</li>
                <li>
                  <Link
                    to={`/category/${category.parent.slug}`}
                    className="hover:text-amazon-orange"
                  >
                    {category.parent.name}
                  </Link>
                </li>
              </>
            )}
            <li>/</li>
            <li className="text-gray-900 dark:text-white">{category?.name}</li>
          </ol>
        </nav>

        {/* Header (if no banner) */}
        {!category?.image && (
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              {category?.name}
            </h1>
            {category?.description && (
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {category.description}
              </p>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm"
            >
              <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Filters</span>
            </button>

            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {totalProducts} products
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-amazon-orange text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-amazon-orange text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => updateFilters('sort', e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-amazon-orange focus:border-amazon-orange min-w-0 max-w-[160px] sm:max-w-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-6">
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
              <div className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h2>
                  <button onClick={() => setFilterOpen(false)}>
                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                  </button>
                </div>
                <FilterSidebar />
              </div>
            </div>
          )}

          {/* Products Grid/List */}
          <div className="flex-1">
            {loading ? (
              <Loading fullScreen={false} />
            ) : products.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="text-gray-500 dark:text-gray-400">No products found in this category</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-amazon-orange hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex gap-4"
                  >
                    <Link
                      to={`/product/${product._id}`}
                      className="w-40 h-40 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                    >
                      <img
                        src={product.images?.[0]?.url || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${product._id}`}
                        className="text-lg font-medium text-gray-900 dark:text-white hover:text-amazon-orange line-clamp-2"
                      >
                        {product.name}
                      </Link>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          ({product.numReviews})
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        ₹{product.price.toLocaleString()}
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                        {product.description}
                      </p>
                      {product.stock > 0 ? (
                        <p className="text-sm text-green-600 mt-2">In Stock</p>
                      ) : (
                        <p className="text-sm text-red-600 mt-2">Out of Stock</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                <button
                  onClick={() => updateFilters('page', Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>

                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => updateFilters('page', page)}
                      className={`px-4 py-2 rounded ${
                        currentPage === page
                          ? 'bg-amazon-orange text-amazon'
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
                  className="px-4 py-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
