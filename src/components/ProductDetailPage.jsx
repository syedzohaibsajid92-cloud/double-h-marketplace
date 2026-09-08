import React, { useState, useEffect } from "react";
import {
  Home,
  ChevronRight,
  Wrench,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  ShoppingCart,
  Check,
} from "lucide-react";
import { formatPriceWithUnit } from "../data/products";
import Stars from "./Stars";

export default function ProductDetailPage({
  product,
  relatedProducts,
  vendor,
  wishlisted,
  onToggleWishlist,
  onProductClick,
  onAddToCart,
  onGoHome,
  onGoProducts,
}) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null);
  const [added, setAdded] = useState(false);

  const [imageEnlarged, setImageEnlarged] = useState(false);

  const galleryImages = [product.image || product.image_url, ...(product.extraImages || [])].filter(
    Boolean
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  const activeImage = galleryImages[activeImageIndex];

  const related = relatedProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  function handleAddToCart() {
    onAddToCart(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="page">
      <nav className="breadcrumb">
        <button onClick={onGoHome}>
          <Home size={13} /> Home
        </button>
        <ChevronRight size={13} />
        <button onClick={onGoProducts}>{product.category}</button>
        <ChevronRight size={13} />
        <span>{product.name}</span>
      </nav>

      <div className="detail-grid">
        <div>
          <div className="detail-image" style={{ overflow: "hidden", cursor: "pointer", maxHeight: "500px" }}>
  {activeImage ? (
    <img
      src={activeImage}
      alt={product.name}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      onClick={() => setImageEnlarged(true)}
    />
  ) : (
    <Wrench size={72} />
  )}
</div>
          {galleryImages.length > 1 && (
            <div className="detail-thumb-row" style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
              {galleryImages.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIndex(i)}
                  style={{
                    width: "64px",
                    height: "64px",
                    padding: 0,
                    borderRadius: "6px",
                    overflow: "hidden",
                    border: i === activeImageIndex ? "2px solid #e8792c" : "1px solid #2b2b2b",
                    cursor: "pointer",
                    background: "#1e1e1e",
                    flexShrink: 0,
                  }}
                  aria-label={`View photo ${i + 1}`}
                >
                  <img src={src} alt={`${product.name} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <h1>{product.name}</h1>
          <div className="rating-row">
            <Stars rating={product.rating} />
            <span className="review-count">({product.reviewCount} reviews)</span>
          </div>
          <div className="price">{formatPriceWithUnit(product.price, product.unit)}</div>
          <div className="vendor">Vendor: {vendor ? vendor.business_name : product.brand}</div>
          <div className={`stock ${product.inStock ? "" : "out"}`}>
            Stock: {product.inStock ? "In Stock" : "Out of Stock"} (SKU: {product.sku})
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="variants">
              <span className="variants-label">Variants:</span>
              {product.variants.map((v) => (
                <button
                  key={v}
                  className={`variant-btn ${selectedVariant === v ? "active" : ""}`}
                  onClick={() => setSelectedVariant(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          <div className="detail-actions">
            <button
              className="btn btn-primary"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {added ? (
                <>
                  <Check size={15} /> Added!
                </>
              ) : (
                <>
                  <ShoppingCart size={15} /> Add to Cart
                </>
              )}
            </button>
            <button
              className={`btn btn-outline wishlist-btn ${wishlisted ? "active" : ""}`}
              onClick={onToggleWishlist}
            >
              <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
              {wishlisted ? "Wishlisted" : "Wishlist"}
            </button>
          </div>

          <div className="detail-trust-row">
            <span>
              <Truck size={14} /> Free shipping over Rs. 5,000
            </span>
            <span>
              <ShieldCheck size={14} /> Verified vendor
            </span>
            <span>
              <RotateCcw size={14} /> 7-day returns
            </span>
          </div>
        </div>
      </div>

      <section>
        <h2 className="section-title">Customer Reviews</h2>
        <div className="reviews-box">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((r, i) => (
              <p key={i}>
                <Stars rating={r.stars} /> {r.text}
              </p>
            ))
          ) : (
            <p className="empty-state">No reviews yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="section-title">Related Products</h2>
        <div className="related-grid">
          {related.length > 0 ? (
  related.map((p) => (
    <button
      key={p.id}
      className="related-card"
      onClick={() => onProductClick(p.id)}
    >
      <span
        className="thumb"
        style={{
          width: "60px",
          height: "60px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          flexShrink: 0,
        }}
      >
        {(p.image || p.image_url) ? (
          <img
            src={p.image || p.image_url}
            alt={p.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Wrench size={16} className="thumb-icon" />
        )}
      </span>
      <span>{p.name}</span>
    </button>
  ))
) : (
            <p className="empty-state">No related products found.</p>
          )}
        </div>
      </section>
      {imageEnlarged && activeImage && (
  <div
    onClick={() => setImageEnlarged(false)}
    style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.85)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      cursor: "zoom-out",
    }}
  >
    <img
      src={activeImage}
      alt={product.name}
      style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }}
    />
  </div>
)}
    </div>
  );
}
