import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import {
  HeartIcon,
  TrashIcon,
  ShoppingCartIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await userAPI.getWishlist();
      // API returns { success, count, wishlist } - wishlist contains product objects directly
      setWishlist(response.data?.wishlist || response.data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await userAPI.removeFromWishlist(productId);
      setWishlist(wishlist.filter((item) => item._id !== productId));
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await userAPI.addToCart(product._id, 1);
      toast.success('Added to cart');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <HeartIcon className="h-8 w-8 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Wishlist
        </h1>
        <span className="text-gray-500 dark:text-gray-400">
          ({wishlist.length} items)
        </span>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <HeartOutline className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Save items you love by clicking the heart icon on products
          </p>
          <Link
            to="/products"
            className="inline-block bg-amazon-orange hover:bg-amazon-orange-dark text-white px-6 py-3 rounded-lg font-medium"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden group"
            >
              <Link to={`/product/${product._id}`} className="block">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                  />
                  {product.discount > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 hover:text-amazon-orange">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-1 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({product.numReviews || 0})
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{product.salePrice || product.price}
                  </span>
                  {product.salePrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ₹{product.price}
                    </span>
                  )}
                </div>

                <p
                  className={`text-sm mt-2 ${
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {product.stock > 0
                    ? `In Stock (${product.stock})`
                    : 'Out of Stock'}
                </p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="flex-1 flex items-center justify-center gap-1 bg-amazon-orange hover:bg-amazon-orange-dark text-white py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemove(product._id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    title="Remove from wishlist"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Wishlist */}
      {wishlist.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Share Your Wishlist
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Share your wishlist with friends and family for special occasions!
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/wishlist/${user?._id}`
                );
                toast.success('Link copied to clipboard');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Copy Link
            </button>
            <button
              onClick={() =>
                window.open(
                  `https://wa.me/?text=Check%20out%20my%20wishlist%3A%20${window.location.origin}/wishlist/${user?._id}`,
                  '_blank'
                )
              }
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            >
              Share on WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
