import React, { useState, useEffect } from "react";
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
  MapPin,
} from "lucide-react";
import { formatPrice } from "../data/products";
import { api } from "../api/client";

const PAYMENT_METHODS = [
  { label: "Cash on Delivery", icon: Truck },
  { label: "Stripe", icon: CreditCard },
  { label: "PayPal", icon: Wallet },
  { label: "Bank Transfer", icon: Landmark },
];

const FREE_SHIPPING_THRESHOLD = 5000;
const FLAT_SHIPPING_FEE = 250;

const EMPTY_ADDRESS = {
  full_name: "",
  phone: "",
  address_line1: "",
  city: "",
  state: "",
  postal_code: "",
};

export default function CartCheckout({ cart, products, onUpdateQty, onPlaceOrder, onGoHome, onContinueShopping }) {
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [placed, setPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [addressErrors, setAddressErrors] = useState({});
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    api
      api
      .get("/api/addresses", { auth: true })
      .then((res) => {
        const rows = Array.isArray(res) ? res : res.addresses || [];
        setAddresses(rows);
        if (rows.length > 0) setSelectedAddressId(rows[0].id);
      })
      .catch(() => {});
  }, []);

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

  function validateAddress() {
    const errors = {};
    if (!addressForm.full_name.trim()) errors.full_name = "Required";
    if (!/^[0-9]{10,15}$/.test(addressForm.phone.trim())) errors.phone = "10-15 digit phone number";
    if (!addressForm.address_line1.trim()) errors.address_line1 = "Required";
    if (!addressForm.city.trim()) errors.city = "Required";
    if (!addressForm.state.trim()) errors.state = "Required";
    if (!/^[0-9A-Za-z-]{3,10}$/.test(addressForm.postal_code.trim())) errors.postal_code = "Required";
    return errors;
  }

  async function handleSaveAddress(e) {
    e.preventDefault();
    const errors = validateAddress();
    setAddressErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingAddress(true);
    try {
      const res = await api.post("/api/addresses", { ...addressForm, country: "Pakistan" }, { auth: true });
      const saved = res.address || res;
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddressId(saved.id);
      setAddressForm(EMPTY_ADDRESS);
    } catch (err) {
      setAddressErrors({ address_line1: err.message || "Could not save this address." });
    } finally {
      setSavingAddress(false);
    }
  }

  async function handlePlaceOrder() {
    if (lineItems.length === 0 || !selectedAddressId) return;
    setPlacing(true);
    setPlaceError("");
    const ok = await onPlaceOrder(selectedAddressId);
    setPlacing(false);
    if (ok) {
      setPlaced(true);
      setTimeout(() => setPlaced(false), 2500);
    } else {
      setPlaceError("Could not place your order. Please try again.");
    }
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
          <h4 className="payment-title">
            <MapPin size={14} className="inline-icon" /> Shipping Address
          </h4>

          {addresses.length > 0 && (
            <div className="payment-options">
              {addresses.map((a) => (
                <label key={a.id} className="payment-option">
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === a.id}
                    onChange={() => setSelectedAddressId(a.id)}
                  />
                  {a.full_name} — {a.address_line1}, {a.city}
                </label>
              ))}
            </div>
          )}

          <form className="inline-form" onSubmit={handleSaveAddress} style={{ marginTop: 10 }}>
            <input
              placeholder="Full name"
              value={addressForm.full_name}
              onChange={(e) => setAddressForm((p) => ({ ...p, full_name: e.target.value }))}
            />
            {addressErrors.full_name && <em className="auth-field-error">{addressErrors.full_name}</em>}

            <input
              placeholder="Phone (e.g. 03001234567)"
              value={addressForm.phone}
              onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
            />
            {addressErrors.phone && <em className="auth-field-error">{addressErrors.phone}</em>}

            <input
              placeholder="Address line 1"
              value={addressForm.address_line1}
              onChange={(e) => setAddressForm((p) => ({ ...p, address_line1: e.target.value }))}
            />
            {addressErrors.address_line1 && (
              <em className="auth-field-error">{addressErrors.address_line1}</em>
            )}

            <input
              placeholder="City"
              value={addressForm.city}
              onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
            />
            {addressErrors.city && <em className="auth-field-error">{addressErrors.city}</em>}

            <input
              placeholder="State/Province"
              value={addressForm.state}
              onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
            />
            {addressErrors.state && <em className="auth-field-error">{addressErrors.state}</em>}

            <input
              placeholder="Postal code"
              value={addressForm.postal_code}
              onChange={(e) => setAddressForm((p) => ({ ...p, postal_code: e.target.value }))}
            />
            {addressErrors.postal_code && <em className="auth-field-error">{addressErrors.postal_code}</em>}

            <button type="submit" className="btn btn-outline" disabled={savingAddress}>
              {savingAddress ? "Saving…" : "Add this address"}
            </button>
          </form>

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

          {placeError && <p className="auth-error">{placeError}</p>}
          {lineItems.length > 0 && !selectedAddressId && (
            <p className="shipping-hint">Add a shipping address above to continue.</p>
          )}

          <button
            className="btn btn-primary place-order"
            onClick={handlePlaceOrder}
            disabled={lineItems.length === 0 || !selectedAddressId || placing}
          >
            {placed ? (
              <>
                <CheckCircle2 size={16} /> Order Placed!
              </>
            ) : placing ? (
              "Placing…"
            ) : (
              "Place Order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
