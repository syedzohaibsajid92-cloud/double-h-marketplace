import React, { useMemo, useState } from "react";
import { SlidersHorizontal, Home, ChevronRight, Wrench, X, ShoppingCart, Check } from "lucide-react";
import { formatPriceWithUnit } from "../data/products";
import Stars from "./Stars";

const PRICE_BUCKETS = [
  { key: "under2000", label: "Under Rs. 2,000", test: (p) => p.price < 2000 },
  { key: "2000to10000", label: "Rs. 2,000 - 10,000", test: (p) => p.price >= 2000 && p.price <= 10000 },
  { key: "above10000", label: "Above Rs. 10,000", test: (p) => p.price > 10000 },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Avg. Customer Review" },
  { value: "newest", label: "Newest Arrivals" },
];

export default function ProductsPage({
  products,
  categories,
  searchTerm,
  activeCategory,
  onCategoryFilter,
  onProductClick,
  onAddToCart,
  onGoHome,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [priceBuckets, setPriceBuckets] = useState([]); // array of bucket keys
  const [selectedVendors, setSelectedVendors] = useState([]); // array of brand names
  const [addedId, setAddedId] = useState(null);
  const categoryNames = categories.map((c) => c.name);

  function handleQuickAdd(e, productId) {
    e.stopPropagation();
    onAddToCart(productId);
    setAddedId(productId);
    setTimeout(() => setAddedId((cur) => (cur === productId ? null : cur)), 1500);
  }

  const vendorNames = useMemo(
    () => [...new Set(products.map((p) => p.brand).filter(Boolean))].sort(),
    [products]
  );

  function togglePriceBucket(key) {
  setPriceBuckets((prev) => (prev.includes(key) ? [] : [key]));
}

  function toggleVendor(name) {
    setSelectedVendors((prev) => (prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]));
  }

  function clearAllFilters() {
    onCategoryFilter(null);
    setPriceBuckets([]);
    setSelectedVendors([]);
    setSortBy("featured");
  }

  const visibleProducts = useMemo(() => {
    let list = products;

    if (priceBuckets.length > 0) {
      const activeBuckets = PRICE_BUCKETS.filter((b) => priceBuckets.includes(b.key));
      list = list.filter((p) => activeBuckets.some((b) => b.test(p)));
    }

    if (selectedVendors.length > 0) {
      list = list.filter((p) => selectedVendors.includes(p.brand));
    }

    const sorted = [...list];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating-desc":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        sorted.sort((a, b) => b.id - a.id);
        break;
      default:
        break; // "featured" — keep incoming order
    }
    return sorted;
  }, [products, priceBuckets, selectedVendors, sortBy]);

  const activeFilterCount = priceBuckets.length + selectedVendors.length + (activeCategory ? 1 : 0);

  return (
    <div className="page products-page">
      <nav className="breadcrumb">
        <button onClick={onGoHome}>
          <Home size={13} /> Home
        </button>
        <ChevronRight size={13} />
        <span>{searchTerm ? `Search: "${searchTerm}"` : activeCategory || "All Products"}</span>
      </nav>

      <button
        className="btn btn-outline filters-toggle"
        onClick={() => setFiltersOpen((v) => !v)}
      >
        <SlidersHorizontal size={15} /> {filtersOpen ? "Hide Filters" : "Show Filters"}
        {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
      </button>

      <aside className={`filters ${filtersOpen ? "filters-open" : ""}`}>
        <h3>
          <SlidersHorizontal size={15} className="inline-icon" /> FILTERS
        </h3>

        <div className="filter-group">
          <h4>Category</h4>
          {categoryNames.map((cat) => (
            <label key={cat} className="filter-option">
              <input
                type="checkbox"
                checked={activeCategory === cat}
                onChange={() => onCategoryFilter(activeCategory === cat ? null : cat)}
              />
              {cat}
            </label>
          ))}
        </div>

        <div className="filter-group">
          <h4>Price Range</h4>
          {PRICE_BUCKETS.map((b) => (
            <label key={b.key} className="filter-option">
              <input
                type="checkbox"
                checked={priceBuckets.includes(b.key)}
                onChange={() => togglePriceBucket(b.key)}
              />
              {b.label}
            </label>
          ))}
        </div>

        {vendorNames.length > 0 && (
          <div className="filter-group">
            <h4>Vendor</h4>
            {vendorNames.map((name) => (
              <label key={name} className="filter-option">
                <input
                  type="checkbox"
                  checked={selectedVendors.includes(name)}
                  onChange={() => toggleVendor(name)}
                />
                {name}
              </label>
            ))}
          </div>
        )}

        {activeFilterCount > 0 && (
          <button className="btn btn-outline btn-sm" onClick={clearAllFilters}>
            Clear All Filters
          </button>
        )}
      </aside>

      <div className="products-main">
        <div className="products-header">
          <h2 className="section-title">
            {searchTerm
              ? `Results for "${searchTerm}"`
              : activeCategory || "All Products"}
          </h2>
          <div className="header-actions">
            <span className="result-count">{visibleProducts.length} items</span>
            {activeCategory && (
              <button className="clear-filter-chip" onClick={() => onCategoryFilter(null)}>
                {activeCategory} <X size={12} />
              </button>
            )}
            {priceBuckets.map((key) => (
              <button key={key} className="clear-filter-chip" onClick={() => togglePriceBucket(key)}>
                {PRICE_BUCKETS.find((b) => b.key === key)?.label} <X size={12} />
              </button>
            ))}
            {selectedVendors.map((name) => (
              <button key={name} className="clear-filter-chip" onClick={() => toggleVendor(name)}>
                {name} <X size={12} />
              </button>
            ))}
            <div className="sort-select-wrap">
              <label htmlFor="sort-by">Sort by:</label>
              <select
                id="sort-by"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="view-toggle">
  <button
    className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
    onClick={() => setViewMode("grid")}
    aria-label="Grid view"
  >
    Grid
  </button>
  <button
    className={`view-toggle-btn ${viewMode === "list" ? "active" : ""}`}
    onClick={() => setViewMode("list")}
    aria-label="List view"
  >
    List
  </button>
</div>
          </div>
        </div>

        {visibleProducts.length === 0 ? (
          <p className="empty-state">No products match your search.</p>
        ) : (
          <div className={viewMode === "grid" ? "product-grid" : "product-list"}>
            {visibleProducts.map((p) => (
                        <div
                key={p.id}
                className="product-card"
                role="button"
                tabIndex={0}
                onClick={() => onProductClick(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onProductClick(p.id);
                }}
              >
                <span className="thumb">
  {p.image_url ? (
    <img
      src={p.image_url}
      alt={p.name}
      className="thumb-img"
      onError={(e) => {
        e.target.style.display = "none";
        e.target.nextSibling.style.display = "flex";
      }}
    />
  ) : null}
  <Wrench
    size={26}
    className="thumb-icon"
    style={{ display: p.image_url ? "none" : "flex" }}
  />
</span>
                          <span className="product-name">{p.name}</span>
                <Stars rating={p.rating} />
                <span className="product-price">{formatPriceWithUnit(p.price, p.unit)}</span>
                <button
                  className="btn btn-primary btn-sm quick-add-btn"
                  onClick={(e) => handleQuickAdd(e, p.id)}
                  disabled={!p.inStock}
                >
                  {addedId === p.id ? (
                    <>
                      <Check size={14} /> Added
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={14} /> Add to Cart
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
