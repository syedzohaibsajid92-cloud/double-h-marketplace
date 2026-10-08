import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/store';

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, clearCart } = useCartStore();

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const tax = subtotal * 0.17; // 17% tax
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-600 mb-6">
              Add some products to get started!
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              {items.map((item, index) => (
                <div
                  key={item.cartId || index}
                  className={`flex gap-4 p-6 ${
                    index !== items.length - 1 ? 'border-b border-slate-200' : ''
                  }`}
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={
                        item.images?.[0] ||
                        item.image ||
                        'https://via.placeholder.com/100'
                      }
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4">
                      Rs. {(item.price || 0).toLocaleString()} each
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-slate-100 rounded">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.cartId,
                              Math.max(1, (item.quantity || 1) - 1)
                            )
                          }
                          className="p-2 hover:bg-slate-200 transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-3 font-semibold text-slate-900">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.cartId,
                              (item.quantity || 1) + 1
                            )
                          }
                          className="p-2 hover:bg-slate-200 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary-600">
                      Rs.{' '}
                      {(
                        (item.price || 0) * (item.quantity || 1)
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm font-semibold"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (17%)</span>
                  <span>Rs. {tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  Rs. {total.toLocaleString()}
                </span>
              </div>

              <button className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg transition mb-3">
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="block w-full py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-lg text-center hover:bg-slate-50 transition"
              >
                Continue Shopping
              </Link>

              <p className="text-xs text-slate-500 text-center mt-4">
                Secure checkout with Stripe, PayPal, or COD
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
