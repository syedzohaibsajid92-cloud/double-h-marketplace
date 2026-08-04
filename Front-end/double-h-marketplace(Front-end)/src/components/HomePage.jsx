import React from "react";
import {
  Zap,
  Hammer,
  Wrench,
  ShieldCheck,
  Factory,
  Droplets,
  Truck,
  RotateCcw,
  Headset,
  ArrowRight,
} from "lucide-react";
import { formatPrice } from "../data/products";
import Stars from "./Stars";

const CATEGORY_ICONS = {
  "Power Tools": Zap,
  "Hand Tools": Hammer,
  Fasteners: Wrench,
  "Safety Gear": ShieldCheck,
  Machinery: Factory,
  Plumbing: Droplets,
};

const TRUST_BADGES = [
  { icon: Truck, title: "Nationwide delivery", text: "Free over Rs. 5,000" },
  { icon: ShieldCheck, title: "Verified vendors", text: "CNIC + document checked" },
  { icon: RotateCcw, title: "7-day returns", text: "On damaged or wrong items" },
  { icon: Headset, title: "24/7 assistant", text: "AI + human support" },
];

export default function HomePage({
  products,
  categories,
  onShopNow,
  onCategoryClick,
  onProductClick,
  onSupportClick,
}) {
  const categoryNames = categories.map((c) => c.name);
  return (
    <div className="page">
      <section className="hero">
        <div>
          <h1>Genuine PAK Hardware Tools</h1>
          <p>Imported quality hardware, now shipping across Pakistan</p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onShopNow}>
              Shop Now <ArrowRight size={15} />
            </button>
            <button className="btn btn-outline" onClick={onSupportClick}>
              <Headset size={15} /> Chat with us
            </button>
          </div>
        </div>
        <div className="hero-swatches">
          {Object.values(CATEGORY_ICONS).slice(0, 4).map((Icon, i) => (
            <span key={i}>
              <Icon size={26} />
            </span>
          ))}
        </div>
      </section>

      <section className="trust-strip">
        {TRUST_BADGES.map((b, i) => {
          const Icon = b.icon;
          return (
            <div className="trust-badge" key={i}>
              <Icon size={20} />
              <div>
                <strong>{b.title}</strong>
                <span>{b.text}</span>
              </div>
            </div>
          );
        })}
      </section>

      <section>
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-grid">
          {categoryNames.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Wrench;
            return (
              <button
                key={cat}
                className="category-card"
                onClick={() => onCategoryClick(cat)}
              >
                <span className="thumb category-thumb">
                  <Icon size={28} />
                </span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="section-title">Featured Products</h2>
        {products.length === 0 && <p className="empty-state">No products available yet.</p>}
        <div className="product-grid">
          {products.slice(0, 8).map((p) => (
            <button
              key={p.id}
              className="product-card"
              onClick={() => onProductClick(p.id)}
            >
              <span className="thumb">
                <Wrench size={26} className="thumb-icon" />
              </span>
              <span className="product-name">{p.name}</span>
              <Stars rating={p.rating} />
              <span className="product-price">{formatPrice(p.price)}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
