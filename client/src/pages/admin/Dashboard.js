import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import Loading from '../../components/Loading';
import {
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  UsersIcon,
  CubeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      const data = response.data?.data || response.data;
      setStats(data.stats || {});
      setRecentOrders(data.recentOrders || []);
      setOrdersByStatus(data.ordersByStatus || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get order count by status
  const getOrderCountByStatus = (status) => {
    const found = ordersByStatus.find(item => item._id === status);
    return found?.count || 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loading />;

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      change: stats?.revenueChange || 0,
      color: 'bg-green-500'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBagIcon,
      change: stats?.ordersChange || 0,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      change: stats?.usersChange || 0,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: CubeIcon,
      change: stats?.productsChange || 0,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard Overview
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              {stat.change !== 0 && (
                <div
                  className={`flex items-center text-sm ${
                    stat.change > 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {stat.change > 0 ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-sm text-amazon-orange hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="p-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No orders yet
              </p>
            ) : (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <ShoppingBagIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          #{order._id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.user?.name || 'Guest'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ₹{(order.total || order.totalAmount || 0).toLocaleString()}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                          order.orderStatus || order.status || 'pending'
                        )}`}
                      >
                        {order.orderStatus || order.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5" />
              Order Status
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {[
                { status: 'pending', label: 'Pending', color: 'bg-yellow-500' },
                { status: 'processing', label: 'Processing', color: 'bg-blue-500' },
                { status: 'shipped', label: 'Shipped', color: 'bg-purple-500' },
                { status: 'delivered', label: 'Delivered', color: 'bg-green-500' },
                { status: 'cancelled', label: 'Cancelled', color: 'bg-red-500' }
              ].map((item) => (
                <div key={item.status} className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="flex-1 text-sm text-gray-600 dark:text-gray-400">
                    {item.label}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {getOrderCountByStatus(item.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/products/new"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <CubeIcon className="h-8 w-8 mx-auto text-amazon-orange mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Add Product
            </span>
          </Link>
          <Link
            to="/admin/categories"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <ChartBarIcon className="h-8 w-8 mx-auto text-amazon-orange mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Manage Categories
            </span>
          </Link>
          <Link
            to="/admin/orders"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <ShoppingBagIcon className="h-8 w-8 mx-auto text-amazon-orange mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              View Orders
            </span>
          </Link>
          <Link
            to="/admin/users"
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <UsersIcon className="h-8 w-8 mx-auto text-amazon-orange mb-2" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Manage Users
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
