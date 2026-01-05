import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import Confetti from 'react-confetti';
import {
  CheckCircleIcon,
  TruckIcon,
  MapPinIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
    
    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(orderId);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days from now
    return formatDate(deliveryDate);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amazon-orange border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
          colors={['#FF9900', '#146EB4', '#232F3E', '#37475A', '#00A8E1']}
        />
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-12 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
              <CheckCircleIcon className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-green-100">
              Thank you for shopping with us
            </p>
          </div>

          {/* Order Info */}
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500 dark:text-gray-400">Order Number</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                #{orderId?.slice(-8).toUpperCase()}
              </p>
            </div>

            {/* Estimated Delivery */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 flex items-center">
              <TruckIcon className="w-8 h-8 text-blue-500 mr-4" />
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Estimated Delivery
                </p>
                <p className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                  {getEstimatedDelivery()}
                </p>
              </div>
            </div>

            {order && (
              <>
                {/* Order Items */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ShoppingBagIcon className="w-5 h-5 mr-2 text-amazon-orange" />
                    Order Items
                  </h2>
                  <div className="space-y-3">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <img
                          src={item.product?.images?.[0]?.url || (typeof item.product?.images?.[0] === 'string' ? item.product?.images?.[0] : null) || item.product?.image || item.image || '/placeholder.svg'}
                          alt={item.product?.name || item.name}
                          className="w-14 h-14 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.product?.name || item.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                {order.shippingAddress && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <MapPinIcon className="w-5 h-5 mr-2 text-amazon-orange" />
                      Delivery Address
                    </h2>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.shippingAddress.fullName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.shippingAddress.addressLine1}
                        {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Phone: {order.shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <CreditCardIcon className="w-5 h-5 mr-2 text-amazon-orange" />
                    Payment Details
                  </h2>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                      <span className="text-gray-900 dark:text-white capitalize">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="text-gray-900 dark:text-white">
                        ₹{order.subtotal?.toLocaleString()}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-₹{order.discount?.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Delivery</span>
                      <span className={order.deliveryCharge === 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}>
                        {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                      </span>
                    </div>
                    <hr className="border-gray-200 dark:border-gray-600" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-amazon-orange">₹{order.total?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={`/user/order/${orderId}`}
                className="flex-1 py-3 px-6 bg-amazon-orange hover:bg-amazon-orange-dark text-white font-semibold rounded-lg text-center transition-colors"
              >
                Track Order
              </Link>
              <Link
                to="/"
                className="flex-1 py-3 px-6 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white font-semibold rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Email Notification */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>A confirmation email has been sent to your registered email address.</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
