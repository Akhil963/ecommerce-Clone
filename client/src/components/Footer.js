import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-amazon dark:bg-gray-800 text-white">
      {/* Back to top */}
      <button
        onClick={scrollToTop}
        className="w-full bg-amazon-light dark:bg-gray-700 hover:bg-gray-600 py-3 sm:py-4 text-xs sm:text-sm"
      >
        Back to top
      </button>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 md:py-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Get to Know Us */}
          <div>
            <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">Get to Know Us</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white hover:underline">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-white hover:underline">Careers</Link></li>
              <li><Link to="/press" className="hover:text-white hover:underline">Press Releases</Link></li>
              <li><Link to="/amazon-science" className="hover:text-white hover:underline">Amazon Science</Link></li>
            </ul>
          </div>

          {/* Connect with Us */}
          <div>
            <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">Connect with Us</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white hover:underline">Facebook</a></li>
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white hover:underline">Twitter</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white hover:underline">Instagram</a></li>
            </ul>
          </div>

          {/* Make Money with Us */}
          <div>
            <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">Make Money with Us</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li><Link to="/sell" className="hover:text-white hover:underline">Sell on Amazon</Link></li>
              <li><Link to="/affiliate" className="hover:text-white hover:underline">Become an Affiliate</Link></li>
              <li><Link to="/advertise" className="hover:text-white hover:underline">Advertise Products</Link></li>
              <li><Link to="/publish" className="hover:text-white hover:underline">Self-Publish with Us</Link></li>
            </ul>
          </div>

          {/* Let Us Help You */}
          <div>
            <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4">Let Us Help You</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li><Link to="/profile" className="hover:text-white hover:underline">Your Account</Link></li>
              <li><Link to="/orders" className="hover:text-white hover:underline">Your Orders</Link></li>
              <li><Link to="/shipping" className="hover:text-white hover:underline">Shipping Rates</Link></li>
              <li><Link to="/returns" className="hover:text-white hover:underline">Returns</Link></li>
              <li><Link to="/help" className="hover:text-white hover:underline">Help</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <span className="text-lg sm:text-xl md:text-2xl font-bold">
                amazon<span className="text-amazon-orange">.Ecommerce</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-gray-400">
              <Link to="/conditions" className="hover:text-white hover:underline">Conditions of Use</Link>
              <Link to="/privacy" className="hover:text-white hover:underline">Privacy Notice</Link>
              <Link to="/interest-ads" className="hover:text-white hover:underline">Interest-Based Ads</Link>
            </div>
          </div>
          <p className="text-center text-[10px] sm:text-xs text-gray-500 mt-3 sm:mt-4">
            © 2024, Amazon-Ecommerce Project. Built for learning purposes.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
