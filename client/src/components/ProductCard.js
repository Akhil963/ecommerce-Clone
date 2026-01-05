import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, HeartIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProductCard = ({ product, isInWishlist = false, onWishlistChange }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const finalPrice = product.discount > 0
    ? Math.round(product.price - (product.price * product.discount / 100))
    : product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product._id, 1);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }

    try {
      if (isInWishlist) {
        await usersAPI.removeFromWishlist(product._id);
        toast.success('Removed from wishlist');
      } else {
        await usersAPI.addToWishlist(product._id);
        toast.success('Added to wishlist');
      }
      if (onWishlistChange) {
        onWishlistChange(product._id, !isInWishlist);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ));
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden product-card flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
        <img
          src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
          alt={product.name}
          className="w-full h-full object-contain p-2 sm:p-3 md:p-4 group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
            {product.discount}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-1 sm:top-2 right-1 sm:right-2 p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:scale-110 transition-transform"
        >
          {isInWishlist ? (
            <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
          ) : (
            <HeartOutline className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-red-500" />
          )}
        </button>

        {/* Quick Add Button - Shows on hover (hidden on touch devices) */}
        <button
          onClick={handleAddToCart}
          className="absolute bottom-2 left-2 right-2 bg-amazon-orange text-amazon py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-amazon-orange-dark hidden sm:block"
        >
          Add to Cart
        </button>
      </div>

      {/* Product Info */}
      <div className="p-2 sm:p-3 md:p-4 flex flex-col flex-grow">
        {/* Brand */}
        {product.brand && (
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {product.brand}
          </p>
        )}

        {/* Name */}
        <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white mt-1 line-clamp-2 group-hover:text-amazon-orange transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mt-1.5 sm:mt-2">
          <div className="flex">
            {renderStars(product.ratings?.average || 0)}
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 ml-1">
            ({product.ratings?.count || 0})
          </span>
        </div>

        {/* Price */}
        <div className="mt-1.5 sm:mt-2 mt-auto">
          <div className="flex items-baseline flex-wrap">
            <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900 dark:text-white">
              ₹{finalPrice.toLocaleString()}
            </span>
            {product.discount > 0 && (
              <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 line-through">
                ₹{product.price.toLocaleString()}
              </span>
            )}
          </div>
          {product.discount > 0 && (
            <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium">
              Save ₹{(product.price - finalPrice).toLocaleString()}
            </p>
          )}
        </div>

        {/* Delivery Info */}
        <div className="mt-1.5 sm:mt-2">
          {product.deliveryInfo?.freeDelivery ? (
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
              <span className="text-green-600 dark:text-green-400 font-medium">FREE Delivery</span>
            </p>
          ) : (
            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
              Delivery: ₹{product.deliveryInfo?.deliveryCharge || 40}
            </p>
          )}
        </div>

        {/* Stock Status */}
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 mt-1">
            Only {product.stock} left
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-[10px] sm:text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
            Out of Stock
          </p>
        )}

        {/* Mobile Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="mt-2 w-full bg-amazon-orange text-amazon py-2 rounded text-xs font-medium hover:bg-amazon-orange-dark sm:hidden"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
