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

// Preset image mapping for category cards
const CATEGORY_IMAGES = {
  "Power Tools": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&q=80",
  "Electrical Tools": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&q=80",
  "Hand Tools": "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500&q=80",
  Fasteners: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&q=80",
  "Safety Gear": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=500&q=80",
  Machinery: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&q=80",
  Plumbing: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=500&q=80",
  "Drill Machine": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&q=80",
};

const CATEGORY_IMAGE_POSITION = {
  "Power Tools": "center 20%",
  "Electrical Tools": "center 15%",
};

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

      {/* Categories Section */}
      <section>
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-grid">
          {categoryNames.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] || Wrench;
            const imageUrl = CATEGORY_IMAGES[cat];
            return (
              <button
                key={cat}
                className="category-card"
                onClick={() => onCategoryClick(cat)}
                style={{ overflow: "hidden" }}
              >
                <span
                  className="thumb category-thumb"
                  style={{
                    width: "calc(100% + 36px)",
                    aspectRatio: "3 / 1",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px 10px 0 0",
                    margin: "-18px -18px 0 -18px",
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={cat}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: CATEGORY_IMAGE_POSITION[cat] || "center",
                      }}
                    />
                  ) : (
                    <Icon size={28} />
                  )}
                </span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Products Section */}
      <section>
        <h2 className="section-title">Featured Products</h2>
        {products.length === 0 && <p className="empty-state">No products available yet.</p>}
        <div className="product-grid">
          {products.slice(0, 8).map((p) => {
            const imgSource = p.image || p.image_url;

            return (
              <button
                key={p.id}
                className="product-card"
                onClick={() => onProductClick(p.id)}
                style={{ overflow: "hidden" }}
              >
                <span
                  className="thumb"
                  style={{
                    width: "100%",
                    height: "160px",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px 8px 0 0",
                  }}
                >
                  {imgSource ? (
                    <img
                      src={imgSource}
                      alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Wrench size={26} className="thumb-icon" />
                  )}
                </span>
                <span className="product-name">{p.name}</span>
                <Stars rating={p.rating} />
                <span className="product-price">{formatPrice(p.price)}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}