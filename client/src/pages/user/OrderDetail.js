import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import Loading from '../../components/Loading';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  TruckIcon,
  CubeIcon,
  ClockIcon,
  XCircleIcon,
  MapPinIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

const OrderDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    
    // Show success message if redirected from checkout
    if (location.state?.orderSuccess) {
      toast.success('Order placed successfully!', { duration: 5000 });
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getOne(id);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await ordersAPI.cancel(id);
      fetchOrder();
      toast.success('Order cancelled successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return ClockIcon;
      case 'confirmed':
      case 'processing':
        return CubeIcon;
      case 'shipped':
      case 'out_for_delivery':
        return TruckIcon;
      case 'delivered':
        return CheckCircleIcon;
      case 'cancelled':
      case 'returned':
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'confirmed':
      case 'processing':
        return 'text-blue-500';
      case 'shipped':
      case 'out_for_delivery':
        return 'text-purple-500';
      case 'delivered':
        return 'text-green-500';
      case 'cancelled':
      case 'returned':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned'
    };
    return labels[status] || status;
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cod: 'Cash on Delivery',
      card: 'Credit/Debit Card',
      upi: 'UPI Payment',
      netbanking: 'Net Banking',
      wallet: 'Wallet'
    };
    return labels[method] || method;
  };

  const orderSteps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const getCurrentStep = () => {
    if (!order) return 0;
    if (order.orderStatus === 'cancelled' || order.orderStatus === 'returned') return -1;
    if (order.orderStatus === 'confirmed') return 0;
    if (order.orderStatus === 'out_for_delivery') return 2;
    return orderSteps.findIndex((step) => step.key === order.orderStatus);
  };

  if (loading) return <Loading />;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Order Not Found
          </h2>
          <Link to="/user/orders" className="text-amazon-orange hover:underline">
            View all orders
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(order.orderStatus);
  const currentStep = getCurrentStep();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link
              to="/user/orders"
              className="text-sm text-amazon-orange hover:underline mb-2 inline-block"
            >
              ← Back to Orders
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className={`flex items-center gap-2 ${getStatusColor(order.orderStatus)}`}>
            <StatusIcon className="h-6 w-6" />
            <span className="text-lg font-medium">{getStatusLabel(order.orderStatus)}</span>
          </div>
        </div>

        {/* Order Progress */}
        {order.orderStatus !== 'cancelled' && order.orderStatus !== 'returned' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Order Progress
            </h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-full bg-amazon-orange transition-all duration-500"
                  style={{
                    width: `${Math.max(0, (currentStep / (orderSteps.length - 1)) * 100)}%`
                  }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {orderSteps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                        index <= currentStep
                          ? 'bg-amazon-orange border-amazon-orange text-white'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircleIcon className="h-6 w-6" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        index <= currentStep
                          ? 'text-amazon-orange'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Expected Delivery */}
            {order.expectedDelivery && order.orderStatus !== 'delivered' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expected Delivery:{' '}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(order.expectedDelivery).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Cancelled Notice */}
        {(order.orderStatus === 'cancelled' || order.orderStatus === 'returned') && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircleIcon className="h-5 w-5" />
              <span className="font-medium">
                This order has been {order.orderStatus}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Order Items ({order.items.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {order.items.map((item, index) => (
                  <div key={item._id || index} className="p-4 flex gap-4">
                    <Link
                      to={`/product/${item.product?._id || item.product}`}
                      className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={item.image || item.product?.images?.[0]?.url || (typeof item.product?.images?.[0] === 'string' ? item.product?.images?.[0] : null) || 'https://via.placeholder.com/100'}
                        alt={item.name || item.product?.name}
                        className="w-full h-full object-contain"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product?._id || item.product}`}
                        className="text-gray-900 dark:text-white font-medium hover:text-amazon-orange line-clamp-2"
                      >
                        {item.name || item.product?.name || 'Product'}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    {order.orderStatus === 'delivered' && (
                      <Link
                        to={`/product/${item.product?._id || item.product}#reviews`}
                        className="text-sm text-amazon-orange hover:underline self-end"
                      >
                        Write a review
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPinIcon className="h-5 w-5 text-amazon-orange" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Shipping Address
                </h3>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.shippingAddress.fullName}
                </p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                </p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCardIcon className="h-5 w-5 text-amazon-orange" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Payment Information
                </h3>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <span className="text-gray-500">Method:</span>{' '}
                  <span className="text-gray-900 dark:text-white">
                    {getPaymentMethodLabel(order.paymentMethod)}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Status:</span>{' '}
                  <span className={
                    order.paymentStatus === 'paid' 
                      ? 'text-green-600 font-medium' 
                      : order.paymentStatus === 'failed'
                      ? 'text-red-600 font-medium'
                      : 'text-yellow-600 font-medium'
                  }>
                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || 'Pending'}
                  </span>
                </p>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Price Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{(order.subtotal || 0).toLocaleString()}</span>
                </div>
                {(order.discount > 0 || order.couponDiscount > 0) && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{((order.discount || 0) + (order.couponDiscount || 0)).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>
                    {(order.deliveryCharge || 0) === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                  </span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax</span>
                    <span>₹{order.tax.toLocaleString()}</span>
                  </div>
                )}
                {order.couponCode && (
                  <div className="flex justify-between text-amazon-orange">
                    <span>Coupon ({order.couponCode})</span>
                    <span>Applied</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total</span>
                  <span>₹{(order.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {['pending', 'confirmed', 'processing'].includes(order.orderStatus) && (
              <button
                onClick={handleCancelOrder}
                className="w-full py-3 px-4 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors"
              >
                Cancel Order
              </button>
            )}

            {/* Delivered Actions */}
            {order.orderStatus === 'delivered' && (
              <div className="space-y-3">
                <Link
                  to="/products"
                  className="block w-full py-3 px-4 bg-amazon-orange text-white text-center rounded-lg hover:bg-orange-600 font-medium transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
