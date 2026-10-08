import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/store';
import { useCartStore } from '../store/store';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl font-semibold text-slate-900 tracking-tight">
            Double H Hardware
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm text-slate-600 hover:text-primary-600 transition font-medium">
              Home
            </Link>
            <Link to="/products" className="text-sm text-slate-600 hover:text-primary-600 transition font-medium">
              Products
            </Link>
            <Link to="/about" className="text-sm text-slate-600 hover:text-primary-600 transition font-medium">
              About
            </Link>
            <Link to="/contact" className="text-sm text-slate-600 hover:text-primary-600 transition font-medium">
              Contact
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-6">
            {/* Cart */}
            <Link to="/cart" className="relative text-slate-600 hover:text-primary-600 transition">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-slate-700">
                  <User size={20} />
                  <span className="text-sm font-medium">{user.name || user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-slate-600 hover:text-slate-900 transition"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm text-slate-600 hover:text-primary-600 transition flex items-center gap-1 font-medium"
              >
                <User size={20} />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden mt-4 space-y-2 border-t pt-4">
            <Link
              to="/"
              className="block text-gray-700 hover:text-primary-500 py-2"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block text-gray-700 hover:text-primary-500 py-2"
              onClick={() => setMobileOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/about"
              className="block text-gray-700 hover:text-primary-500 py-2"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="block text-gray-700 hover:text-primary-500 py-2"
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
