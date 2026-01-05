import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const sort = searchParams.get('sort') || 'relevance';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const rating = searchParams.get('rating') || '';

  useEffect(() => {
    if (query) {
      searchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        search: query,
        page: currentPage,
        limit: 16,
        sort: sort === 'relevance' ? '-createdAt' : sort,
        minPrice,
        maxPrice,
        rating
      };

      const response = await productsAPI.getAll(params);
      setProducts(response.data.products);
      setTotalProducts(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error searching products:', error);
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
    setSearchParams({ q: query, page: '1' });
  };

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Avg. Customer Review' },
    { value: '-createdAt', label: 'Newest Arrivals' }
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

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <MagnifyingGlassIcon className="h-24 w-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Search for products
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Use the search bar above to find what you're looking for
          </p>
          <Link
            to="/products"
            className="inline-block bg-amazon-yellow hover:bg-yellow-500 text-amazon font-bold py-3 px-8 rounded-full transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              Search results for "{query}"
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalProducts} results found
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-gray-600 dark:text-gray-400"
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => updateFilters('sort', e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:ring-amazon-orange focus:border-amazon-orange"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by: {option.label}
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

          {/* Results Grid */}
          <div className="flex-1">
            {loading ? (
              <Loading fullScreen={false} />
            ) : products.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                <MagnifyingGlassIcon className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No results found for "{query}"
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Try checking your spelling or using different keywords
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>Suggestions:</p>
                  <ul className="list-disc list-inside">
                    <li>Check your search for typos</li>
                    <li>Use more general terms</li>
                    <li>Try different keywords</li>
                  </ul>
                </div>
                <Link
                  to="/products"
                  className="inline-block mt-6 text-amazon-orange hover:underline"
                >
                  Browse all products
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

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
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }

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

                {/* Results Summary */}
                <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Showing {(currentPage - 1) * 16 + 1}-{Math.min(currentPage * 16, totalProducts)} of{' '}
                  {totalProducts} results
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
