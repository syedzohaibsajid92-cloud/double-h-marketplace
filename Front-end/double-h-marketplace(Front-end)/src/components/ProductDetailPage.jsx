import React, { useState } from "react";
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
import { formatPrice } from "../data/products";
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
        <div className="detail-image">
          <Wrench size={72} />
        </div>

        <div className="detail-info">
          <h1>{product.name}</h1>
          <div className="rating-row">
            <Stars rating={product.rating} />
            <span className="review-count">({product.reviewCount} reviews)</span>
          </div>
          <div className="price">{formatPrice(product.price)}</div>
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
                <Wrench size={16} /> {p.name}
              </button>
            ))
          ) : (
            <p className="empty-state">No related products found.</p>
          )}
        </div>
      </section>
    </div>
  );
}
