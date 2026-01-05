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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <ShoppingCartIcon className="h-24 w-24 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/products"
              className="inline-block bg-amazon-yellow hover:bg-yellow-500 text-amazon font-bold py-3 px-8 rounded-full transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="lg:flex lg:gap-6">
            {/* Cart Items */}
            <div className="lg:flex-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {cartItemsCount} items in your cart
                  </span>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cartItems.map((item) => (
                    <div key={item.product?._id} className="p-4 flex gap-4">
                      {/* Product Image */}
                      <Link
                        to={`/product/${item.product?._id}`}
                        className="flex-shrink-0 w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
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
                          className="text-gray-900 dark:text-white font-medium hover:text-amazon-orange line-clamp-2"
                        >
                          {item.product?.name}
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Brand: {item.product?.brand}
                        </p>
                        {item.product?.stock < 10 && item.product?.stock > 0 && (
                          <p className="text-sm text-orange-500 mt-1">
                            Only {item.product.stock} left in stock
                          </p>
                        )}

                        {/* Mobile Price */}
                        <div className="lg:hidden mt-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                          </span>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="flex items-center gap-4 mt-3">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                            <button
                              onClick={() =>
                                handleQuantityChange(item.product?._id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(item.product?._id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.product?.stock}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.product?._id)}
                            className="text-red-500 hover:text-red-600 flex items-center gap-1 text-sm"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Desktop Price */}
                      <div className="hidden lg:block text-right">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                        </span>
                        {item.product?.originalPrice && (
                          <p className="text-sm text-gray-500 line-through">
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
            <div className="lg:w-80">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Order Summary
                </h2>

                {/* Coupon Code */}
                {cart?.coupon ? (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TagIcon className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-700 dark:text-green-400">
                          {cart.coupon.code}
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-sm text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
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
                        placeholder="Enter coupon code"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-amazon-orange focus:border-amazon-orange"
                      />
                      <button
                        type="submit"
                        disabled={applyingCoupon || !couponCode.trim()}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Price Breakdown */}
                <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({cartItemsCount} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-green-600">
                      Add ₹{(499 - subtotal).toLocaleString()} more for FREE delivery
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 bg-amazon-yellow hover:bg-yellow-500 text-amazon font-bold py-3 rounded-full transition-colors"
                >
                  Proceed to Checkout
                </button>

                <Link
                  to="/products"
                  className="block w-full mt-3 text-center text-amazon-orange hover:underline text-sm"
                >
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>🔒 Secure Checkout</span>
                    <span>💳 Multiple Payment Options</span>
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
