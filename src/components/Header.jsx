import React, { useState } from "react";
import {
  Search,
  ShoppingCart,
  MessageCircleQuestion,
  Menu,
  X,
} from "lucide-react";
import logo from "../assets/logo.jpeg";

const LABELS = {
  home: "HOMEPAGE",
  products: "PRODUCT LIST",
  detail: "PRODUCT PAGE",
  cart: "CART & CHECKOUT",
  support: "CUSTOMER SERVICE",
};

export default function Header({
  page,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onLogoClick,
  cartCount,
  onCartClick,
  onSupportClick,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const showSearch = page === "home" || page === "products";

  function handleSubmit(e) {
    onSearchSubmit(e);
    setMobileOpen(false);
  }

  return (
    <header className="site-header">
      <div className="header-top-row">
        <div className="brand" onClick={onLogoClick} role="button" tabIndex={0}>
          <img src={logo} alt="PAK Hardware logo" className="brand-logo" />
          <span className="brand-name">PAK HARDWARE</span>
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="header-right desktop-only">
          <button className="icon-link" onClick={onSupportClick}>
            <MessageCircleQuestion size={18} /> Help
          </button>
          <button className="cart-pill" onClick={onCartClick}>
            <ShoppingCart size={16} />
            Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </button>
          <span className="page-label">{LABELS[page]}</span>
        </div>
      </div>

      {showSearch && (
        <form className="search-bar desktop-only" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search hardware tools, brands, categories..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <Search size={15} /> SEARCH
          </button>
        </form>
      )}

      {mobileOpen && (
        <div className="mobile-menu">
          {showSearch && (
            <form className="search-bar" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Search hardware tools..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                <Search size={15} />
              </button>
            </form>
          )}
          <button
            className="icon-link mobile-menu-item"
            onClick={() => {
              onCartClick();
              setMobileOpen(false);
            }}
          >
            <ShoppingCart size={18} /> Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </button>
          <button
            className="icon-link mobile-menu-item"
            onClick={() => {
              onSupportClick();
              setMobileOpen(false);
            }}
          >
            <MessageCircleQuestion size={18} /> Customer Service
          </button>
          <span className="page-label mobile-menu-item">{LABELS[page]}</span>
        </div>
      )}
    </header>
  );
}
