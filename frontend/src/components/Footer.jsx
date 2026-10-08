import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold text-primary-400 mb-4">Double H Hardware</h3>
            <p className="text-slate-400 text-sm mb-4">
              Your trusted marketplace for quality hardware, tools, and industrial equipment.
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>+92 300 1234567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>support@doublehardware.pk</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span>Karachi, Pakistan</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-primary-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary-400 transition">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary-400 transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Customer Service</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a href="#" className="hover:text-primary-400 transition">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition">
                  Track Order
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Newsletter</h4>
            <p className="text-sm text-slate-400 mb-4">
              Subscribe to get special offers and updates!
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 bg-slate-800 text-white text-sm rounded border border-slate-700 focus:outline-none focus:border-primary-500"
              />
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 py-8">
          {/* Social Links */}
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-primary-400 transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary-400 transition">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary-400 transition">
                <Instagram size={20} />
              </a>
            </div>

            {/* Copyright */}
            <p className="text-sm text-slate-400">
              © 2026 Double H Hardware. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
