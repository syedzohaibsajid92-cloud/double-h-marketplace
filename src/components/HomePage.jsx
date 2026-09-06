import React, { useState, useEffect, useRef } from "react";
import heroBg from "../assets/hero-bg.jpg.jpeg";
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
  X,
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

const HERO_SLIDES = [
  { title: "Genuine Imported Tools", subtitle: "Trusted brands, sourced directly, delivered across Pakistan" },
  { title: "Quality You Can Trust", subtitle: "Every vendor CNIC-verified — buy with confidence" },
  { title: "Shipping Nationwide", subtitle: "Free delivery across Pakistan on orders over Rs. 5,000" },
];

const STATS = [
  { label: "Years in Business", value: 5, suffix: "+" },
  { label: "Products Listed", value: 500, suffix: "+" },
  { label: "Happy Customers", value: 2000, suffix: "+" },
  { label: "Verified Vendors", value: 50, suffix: "+" },
];
const TRUST_BADGES = [
  { icon: Truck, title: "Nationwide delivery", text: "Free over Rs. 5,000" },
  { icon: ShieldCheck, title: "Verified vendors", text: "CNIC + document checked" },
  { icon: RotateCcw, title: "7-day returns", text: "On damaged or wrong items" },
  { icon: Headset, title: "24/7 assistant", text: "AI + human support" },
];
function AnimatedStat({ value, suffix, label }) {
  const [ref, visible] = useFadeInOnScroll();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [visible, value]);

  return (
    <div className={`stat-block fade-in-section ${visible ? "fade-in-visible" : ""}`} ref={ref}>
      <span className="stat-block-value">{count}{suffix}</span>
      <span className="stat-block-label">{label}</span>
    </div>
  );
}
function useFadeInOnScroll() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}
export default function HomePage({
  products,
  categories,
  onShopNow,
  onCategoryClick,
  onProductClick,
  onSupportClick,
  isGuest,
}) {
  const categoryNames = categories.map((c) => c.name);

    const [showWelcome, setShowWelcome] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const rotate = setInterval(() => {
      setSlideIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(rotate);
  }, []);
  const [trustRef, trustVisible] = useFadeInOnScroll();
  const [catRef, catVisible] = useFadeInOnScroll();
  const [prodRef, prodVisible] = useFadeInOnScroll();

    return (
    <div className="page">
      {showWelcome && (
        <div className="welcome-overlay" onClick={() => setShowWelcome(false)}>
          <div className="welcome-card" onClick={(e) => e.stopPropagation()}>
            <button className="welcome-close" onClick={() => setShowWelcome(false)}>
              <X size={18} />
            </button>
            <h2>Welcome to PAK Hardware Store</h2>
            <p>Genuine imported tools, shipping across Pakistan.</p>
            <button className="btn btn-primary" onClick={() => setShowWelcome(false)}>
              Start Shopping
            </button>
          </div>
        </div>
      )}
      {isGuest && (
        <section
          className="guest-hero"
                  style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        >
          <div className="guest-hero-overlay">
            <span className="guest-hero-eyebrow">Trusted hardware, delivered nationwide</span>
            <h1 key={slideIndex} className="hero-fade">{HERO_SLIDES[slideIndex].title}</h1>
            <p key={`sub-${slideIndex}`} className="hero-fade">{HERO_SLIDES[slideIndex].subtitle}</p>
            <button className="btn btn-primary guest-hero-cta" onClick={onShopNow}>
              Get Started <ArrowRight size={16} />
            </button>
            <div className="guest-hero-dots">
              {HERO_SLIDES.map((_, i) => (
                <span key={i} className={`guest-hero-dot ${i === slideIndex ? "active" : ""}`} />
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="hero">
                <div>
          <h1 key={slideIndex} className="hero-fade">{HERO_SLIDES[slideIndex].title}</h1>
          <p key={`sub-${slideIndex}`} className="hero-fade">{HERO_SLIDES[slideIndex].subtitle}</p>
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
      <section className="stats-strip">
        {STATS.map((s) => (
          <AnimatedStat key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
        ))}
      </section>
        <section className={`trust-strip fade-in-section ${trustVisible ? "fade-in-visible" : ""}`} ref={trustRef}>
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
            {isGuest && (
               <section className="video-showcase">
          <div className="video-showcase-row">
            <ul className="video-showcase-checklist">
              <li>Genuine, imported tools</li>
              <li>Verified, document-checked vendors</li>
            </ul>
            <video
              className="video-showcase-clip"
              src="/hero-video.mp4.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <ul className="video-showcase-checklist">
              <li>Fast, nationwide dispatch</li>
              <li>7-day hassle-free returns</li>
            </ul>
          </div>
          <div className="video-showcase-text">
            <h2>See Our Store In Action</h2>
            <p>A quick look at the quality and care behind every PAK Hardware product.</p>
          </div>
        </section>
      )}
      {isGuest && (
        <section className="about-section">
          <h2 className="about-title">About</h2>
          <div className="about-text">
            <p>
              PAK Hardware Store is Pakistan's trusted online marketplace for genuine, imported hardware and tools. We connect verified vendors with customers nationwide, offering everything from power tools to electrical equipment — all backed by document-checked sellers and reliable delivery.
            </p>
            <p>
              Our mission is simple: make it easy to find quality tools at fair prices, with the confidence that every vendor on our platform has been vetted for authenticity and reliability.
            </p>
          </div>
        </section>
      )}
      {/* Categories Section */}
  
            {!isGuest && (
      <section className={`fade-in-section ${catVisible ? "fade-in-visible" : ""}`} ref={catRef}>
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
      )}

      {/* Featured Products Section */}
      
            {!isGuest && (
      <section className={`fade-in-section ${prodVisible ? "fade-in-visible" : ""}`} ref={prodRef}>
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
      )}
    </div>
  );
}