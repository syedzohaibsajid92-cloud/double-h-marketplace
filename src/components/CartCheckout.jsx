import React, { useState } from "react";
import {
  Home,
  ChevronRight,
  Wrench,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  CreditCard,
  Wallet,
  Landmark,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { formatPrice } from "../data/products";

const PAYMENT_METHODS = [
  { label: "Cash on Delivery", icon: Truck },
  { label: "Stripe", icon: CreditCard },
  { label: "PayPal", icon: Wallet },
  { label: "Bank Transfer", icon: Landmark },
];

const FREE_SHIPPING_THRESHOLD = 5000;
const FLAT_SHIPPING_FEE = 250;

export default function CartCheckout({ cart, products, onUpdateQty, onPlaceOrder, onGoHome, onContinueShopping }) {
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [placed, setPlaced] = useState(false);

  const lineItems = cart
    .map((entry) => {
      const product = products.find((p) => p.id === entry.productId);
      return product ? { ...product, qty: entry.qty } : null;
    })
    .filter(Boolean);

  const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping =
    lineItems.length === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  function handlePlaceOrder() {
    if (lineItems.length === 0) return;
    onPlaceOrder();
    setPlaced(true);
    setTimeout(() => setPlaced(false), 2500);
  }

  return (
    <div className="page cart-page-wrap">
      <nav className="breadcrumb">
        <button onClick={onGoHome}>
          <Home size={13} /> Home
        </button>
        <ChevronRight size={13} />
        <span>Cart &amp; Checkout</span>
      </nav>

      <div className="cart-page">
        <div className="cart-items">
          <h3>
            <ShoppingBag size={16} className="inline-icon" /> Shopping Cart ({lineItems.length} items)
          </h3>

          {lineItems.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={40} />
              <p className="empty-state">
                Your cart is empty. Add a product from the store to see it here.
              </p>
              <button className="btn btn-primary" onClick={onContinueShopping}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="shipping-hint">
                  <Truck size={14} /> Add {formatPrice(amountToFreeShipping)} more for free shipping!
                </p>
              )}
              {lineItems.map((item) => (
                <div key={item.id} className="cart-row">
                  <span className="thumb small">
                    <Wrench size={18} className="thumb-icon" />
                  </span>
                  <div className="cart-row-info">
                    <span className="product-name">{item.name}</span>
                    <div className="qty-control">
                      <span>Qty</span>
                      <button
                        className="qty-btn"
                        onClick={() => onUpdateQty(item.id, item.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span>{item.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => onUpdateQty(item.id, item.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <span className="product-price">{formatPrice(item.price * item.qty)}</span>
                  <button
                    className="remove-item-btn"
                    onClick={() => onUpdateQty(item.id, 0)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (5%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="summary-row total-row">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <h4 className="payment-title">Payment Method</h4>
          <div className="payment-options">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <label key={method.label} className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === method.label}
                    onChange={() => setPaymentMethod(method.label)}
                  />
                  <Icon size={15} /> {method.label}
                </label>
              );
            })}
          </div>

          <button
            className="btn btn-primary place-order"
            onClick={handlePlaceOrder}
            disabled={lineItems.length === 0}
          >
            {placed ? (
              <>
                <CheckCircle2 size={16} /> Order Placed!
              </>
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
