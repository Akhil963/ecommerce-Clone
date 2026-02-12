import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import {
  TrashIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart, applyCoupon, removeCoupon, cartItemsCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
        toast.success('Cart cleared');
      } catch (error) {
        toast.error('Failed to clear cart');
      }
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      await applyCoupon(couponCode);
      toast.success('Coupon applied successfully!');
      setCouponCode('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
      toast.success('Coupon removed');
    } catch (error) {
      toast.error('Failed to remove coupon');
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  if (loading) return <Loading />;

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const discount = cart?.discount || 0;
  const shipping = subtotal >= 499 ? 0 : 40;
  const total = subtotal - discount + shipping;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-4 sm:py-6">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 text-center">
            <ShoppingCartIcon className="h-16 w-16 sm:h-24 sm:w-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/products"
              className="inline-block bg-amazon-yellow hover:bg-yellow-500 text-amazon font-bold py-2.5 sm:py-3 px-6 sm:px-8 text-sm sm:text-base rounded-full transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:gap-6">
            {/* Cart Items */}
            <div className="flex-1 mb-6 lg:mb-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {cartItemsCount} items in your cart
                  </span>
                  <button
                    onClick={handleClearCart}
                    className="text-xs sm:text-sm text-red-500 hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cartItems.map((item) => (
                    <div key={item.product?._id} className="p-3 sm:p-4 flex gap-3 sm:gap-4">
                      {/* Product Image */}
                      <Link
                        to={`/product/${item.product?._id}`}
                        className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                      >
                        <img
                          src={item.product?.images?.[0]?.url || '/placeholder.svg'}
                          alt={item.product?.name}
                          className="w-full h-full object-contain"
                        />
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product?._id}`}
                          className="text-sm sm:text-base text-gray-900 dark:text-white font-medium hover:text-amazon-orange line-clamp-2 transition-colors"
                        >
                          {item.product?.name}
                        </Link>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Brand: {item.product?.brand}
                        </p>
                        {item.product?.stock < 10 && item.product?.stock > 0 && (
                          <p className="text-xs sm:text-sm text-orange-500 mt-1">
                            Only {item.product.stock} left in stock
                          </p>
                        )}

                        {/* Mobile Price */}
                        <div className="lg:hidden mt-2">
                          <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                            ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                          </span>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="flex items-center gap-2 sm:gap-4 mt-2 sm:mt-3 flex-wrap">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.product?._id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <MinusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <span className="px-3 sm:px-4 py-1.5 sm:py-2 font-medium text-gray-900 dark:text-white text-xs sm:text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.product?._id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.product?.stock}
                              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.product?._id)}
                            className="text-red-500 hover:text-red-600 flex items-center gap-1 text-xs sm:text-sm transition-colors"
                          >
                            <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline">Remove</span>
                          </button>
                        </div>
                      </div>

                      {/* Desktop Price */}
                      <div className="hidden lg:block text-right flex-shrink-0">
                        <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white block">
                          ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                        </span>
                        {item.product?.originalPrice && (
                          <p className="text-xs sm:text-sm text-gray-500 line-through">
                            ₹{(item.product.originalPrice * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full md:max-w-sm lg:flex-shrink-0 lg:w-80">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 sticky top-20">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>

                {/* Coupon Code */}
                {cart?.coupon ? (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <TagIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                        <span className="font-medium text-green-700 dark:text-green-400 text-xs sm:text-sm break-all">
                          {cart.coupon.code}
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs sm:text-sm text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">
                      {cart.coupon.discountType === 'percentage'
                        ? `${cart.coupon.discountValue}% off`
                        : `₹${cart.coupon.discountValue} off`}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Coupon code"
                        className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm placeholder-gray-500 focus:ring-2 focus:ring-amazon-orange focus:border-amazon-orange transition-all"
                      />
                      <button
                        type="submit"
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                      >
                        {applyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Price Breakdown */}
                <div className="space-y-2.5 sm:space-y-3 border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({cartItemsCount} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-green-600 py-1">
                      Add ₹{(499 - subtotal).toLocaleString()} more for FREE delivery
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 mt-3 sm:mt-4">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-4 sm:mt-6 bg-amazon-yellow hover:bg-yellow-500 text-amazon font-bold py-2.5 sm:py-3 text-sm sm:text-base rounded-full transition-colors"
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/products"
                  className="block w-full mt-2 sm:mt-3 text-center text-amazon-orange hover:underline text-xs sm:text-sm transition-colors"
                >
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-center">🔒 Secure</span>
                    <span className="hidden sm:inline">|</span>
                    <span className="text-center">💳 Multiple Payments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
