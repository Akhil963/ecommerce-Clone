import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { categoriesAPI } from '../services/api';
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  MapPinIcon,
  ChevronDownIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartItemsCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Main Header */}
      <div className="bg-amazon dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center h-14 sm:h-16">
            
            {/* Left Section - Hamburger + Logo */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white p-1.5 hover:bg-white/10 rounded"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center">
                <span className="text-base sm:text-lg md:text-2xl font-bold text-white whitespace-nowrap">
                  <span className="hidden xs:inline">Amazon</span>
                  <span className="xs:hidden">A</span>
                  <span className="text-amazon-orange">.E</span>
                </span>
              </Link>
            </div>

            {/* Delivery Location - Hidden on mobile & tablet */}
            <div className="hidden xl:flex items-center text-white ml-4 cursor-pointer hover:border hover:border-white rounded p-1">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
              <div className="ml-1">
                <p className="text-xs text-gray-400">Deliver to</p>
                <p className="text-sm font-bold">India</p>
              </div>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-2 lg:mx-4 max-w-2xl">
              <div className="flex w-full">
                <select className="bg-gray-200 text-gray-800 text-xs lg:text-sm rounded-l-md px-2 py-2 focus:outline-none hidden lg:block">
                  <option>All</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 px-3 py-2 text-sm text-gray-900 focus:outline-none rounded-l-md lg:rounded-none min-w-0"
                />
                <button
                  type="submit"
                  className="bg-amazon-orange hover:bg-amazon-orange-dark px-2 lg:px-4 rounded-r-md flex-shrink-0"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 lg:h-6 lg:w-6 text-amazon" />
                </button>
              </div>
            </form>

            {/* Spacer for flex distribution */}
            <div className="flex-1 md:hidden"></div>

            {/* Right Section */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="text-white hover:text-amazon-orange p-1"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <SunIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                ) : (
                  <MoonIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                )}
              </button>

              {/* User Menu - Simplified on mobile */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center text-white hover:border hover:border-white rounded p-1"
                >
                  {/* Mobile: Just icon */}
                  <div className="lg:hidden">
                    <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  {/* Desktop: Full text */}
                  <div className="hidden lg:block text-left">
                    <p className="text-xs text-gray-400 truncate max-w-[100px]">
                      Hello, {isAuthenticated ? user?.name?.split(' ')[0] : 'Sign in'}
                    </p>
                    <p className="text-sm font-bold flex items-center">
                      Account & Lists
                      <ChevronDownIcon className="h-3 w-3 ml-1" />
                    </p>
                  </div>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 animate-fade-in">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Your Profile
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Your Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Wishlist
                        </Link>
                        <Link
                          to="/addresses"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Your Addresses
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-amazon-orange font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3">
                          <Link
                            to="/login"
                            onClick={() => setUserMenuOpen(false)}
                            className="block w-full text-center bg-amazon-orange text-amazon py-2 rounded font-medium hover:bg-amazon-orange-dark"
                          >
                            Sign In
                          </Link>
                        </div>
                        <p className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                          New customer?{' '}
                          <Link
                            to="/register"
                            onClick={() => setUserMenuOpen(false)}
                            className="text-amazon-blue hover:text-amazon-orange hover:underline"
                          >
                            Start here
                          </Link>
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Orders - Hidden on mobile */}
              <Link
                to="/orders"
                className="hidden xl:flex flex-col text-white hover:border hover:border-white rounded p-1"
              >
                <span className="text-xs text-gray-400">Returns</span>
                <span className="text-sm font-bold">& Orders</span>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="flex items-center text-white hover:border hover:border-white rounded p-1">
                <div className="relative">
                  <ShoppingCartIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                  <span className="absolute -top-1 -right-1 bg-amazon-orange text-amazon text-[10px] font-bold rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                </div>
                <span className="hidden xl:inline text-sm font-bold ml-1">Cart</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden bg-amazon dark:bg-gray-800 px-2 pb-2">
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-3 py-2 text-sm rounded-l-md text-gray-900 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-amazon-orange hover:bg-amazon-orange-dark px-3 rounded-r-md"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-amazon" />
          </button>
        </form>
      </div>

      {/* Sub Header - Categories */}
      <div className="bg-amazon-light dark:bg-gray-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center h-9 sm:h-10 gap-1">
            {/* All Categories Dropdown */}
            <div className="relative flex-shrink-0" ref={categoryMenuRef}>
              <button
                onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                className="flex items-center justify-center text-white text-xs sm:text-sm font-medium hover:bg-white/10 rounded px-2 py-1 h-7 sm:h-8"
              >
                <Bars3Icon className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
                <span>All</span>
              </button>

              {/* Dropdown Menu */}
              {categoryMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-52 sm:w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 animate-fade-in border border-gray-200 dark:border-gray-700">
                  <div className="py-2">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Shop by Category</p>
                    </div>
                    <div className="max-h-64 sm:max-h-80 overflow-y-auto">
                      {categories.map((category) => (
                        <Link
                          key={category._id}
                          to={`/category/${category.slug}`}
                          onClick={() => setCategoryMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-amazon-orange hover:text-amazon dark:hover:bg-amazon-orange transition-colors"
                        >
                          {category.image && (
                            <img 
                              src={category.image} 
                              alt={category.name}
                              className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded mr-3"
                            />
                          )}
                          <span>{category.name}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                      <Link
                        to="/products"
                        onClick={() => setCategoryMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-amazon-blue dark:text-amazon-orange font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        View All Products →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Divider */}
            <div className="h-5 w-px bg-gray-500 mx-1 hidden xs:block"></div>
            
            {/* Category Links - Scrollable on mobile */}
            <div className="flex items-center overflow-x-auto hide-scrollbar flex-1 gap-0.5">
              {categories.slice(0, 5).map((category) => (
                <Link
                  key={category._id}
                  to={`/category/${category.slug}`}
                  className="text-white text-xs sm:text-sm hover:bg-white/10 rounded px-1.5 sm:px-2 py-1 h-7 sm:h-8 flex items-center whitespace-nowrap flex-shrink-0"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                to="/products?featured=true"
                className="text-white text-xs sm:text-sm hover:bg-white/10 rounded px-1.5 sm:px-2 py-1 h-7 sm:h-8 flex items-center whitespace-nowrap flex-shrink-0"
              >
                Deals
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed inset-y-0 left-0 w-[280px] max-w-[80vw] bg-white dark:bg-gray-800 z-50 md:hidden overflow-y-auto">
            {/* User Section */}
            <div className="bg-amazon-light dark:bg-gray-700 px-4 py-4">
              <div className="flex items-center text-white">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="ml-3">
                  <p className="font-bold text-sm sm:text-base">
                    Hello, {isAuthenticated ? user?.name?.split(' ')[0] : 'Sign in'}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {/* Auth Section */}
              {!isAuthenticated ? (
                <div className="px-4 py-3 border-b dark:border-gray-700">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center bg-amazon-orange text-amazon py-2.5 rounded font-medium text-sm"
                  >
                    Sign In
                  </Link>
                  <p className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                    New customer?{' '}
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-amazon-blue"
                    >
                      Start here
                    </Link>
                  </p>
                </div>
              ) : (
                <>
                  <div className="px-4 py-2 border-b dark:border-gray-700">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Your Account</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Your Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/addresses"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Your Addresses
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-amazon-orange font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Admin Panel
                    </Link>
                  )}
                </>
              )}

              {/* Categories Section */}
              <div className="px-4 py-2 border-t border-b dark:border-gray-700 mt-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Shop by Category</p>
              </div>
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category._id}
                  to={`/category/${category.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm text-amazon-blue dark:text-amazon-orange font-medium"
              >
                See All Categories
              </Link>

              {/* Sign Out */}
              {isAuthenticated && (
                <div className="border-t dark:border-gray-700 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm text-red-600"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
