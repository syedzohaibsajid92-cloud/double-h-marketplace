import React, { useState, useMemo } from "react";
import ModuleSwitcher from "./components/ModuleSwitcher";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import ProductsPage from "./components/ProductsPage";
import ProductDetailPage from "./components/ProductDetailPage";
import CartCheckout from "./components/CartCheckout";
import VendorDashboard from "./components/VendorDashboard";
import AdminPanel from "./components/AdminPanel";
import CustomerService from "./components/CustomerService";
import Auth from "./components/Auth";
import VendorOnboarding from "./components/VendorOnboarding";
import { SEED_PRODUCTS } from "./data/products";
import { SEED_USERS, hasVendorAccess } from "./data/users";
import { SEED_VENDORS } from "./data/vendors";
import { SEED_CATEGORIES } from "./data/categories";
import { SEED_ORDERS, generateOrderId } from "./data/orders";
import { SEED_PAYOUTS } from "./data/payouts";
import { SEED_TICKETS, generateTicketId } from "./data/tickets";

export default function App() {
  // auth state
  const [users, setUsers] = useState(SEED_USERS);
  const [currentUser, setCurrentUser] = useState(null);

  // marketplace data
  const [vendors, setVendors] = useState(SEED_VENDORS);
  const [products, setProducts] = useState(SEED_PRODUCTS);
  const [categories, setCategories] = useState(SEED_CATEGORIES);
  const [orders, setOrders] = useState(SEED_ORDERS);
  const [payouts] = useState(SEED_PAYOUTS);
  const [tickets, setTickets] = useState(SEED_TICKETS);

  const [activeModule, setActiveModule] = useState("store");
  const [screen, setScreen] = useState("app"); // "app" | "vendor-onboarding"

  // storefront navigation state
  const [page, setPage] = useState("home"); // "home" | "products" | "detail" | "cart" | "support"
  const [previousPage, setPreviousPage] = useState("home");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // cart state, shared between the product detail page and checkout
  const [cart, setCart] = useState([]); // [{ productId, qty }]

  // ---- derived lookups ----------------------------------------------
  const vendorsById = useMemo(() => {
    const map = {};
    vendors.forEach((v) => (map[v.id] = v));
    return map;
  }, [vendors]);

  function isVendorLive(vendorId) {
    const v = vendorsById[vendorId];
    return !!v && v.approval_status === "Approved" && v.is_active;
  }

  // only products from an approved & active vendor ever reach the storefront
  const storefrontProducts = useMemo(
    () => products.filter((p) => isVendorLive(p.vendorId)),
    [products, vendors]
  );

  const filteredProducts = useMemo(() => {
    return storefrontProducts.filter((p) => {
      const matchesSearch = appliedSearch
        ? p.name.toLowerCase().includes(appliedSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(appliedSearch.toLowerCase())
        : true;
      const matchesCategory = activeCategory ? p.category === activeCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [storefrontProducts, appliedSearch, activeCategory]);

  const selectedProduct = storefrontProducts.find((p) => p.id === selectedProductId);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const myVendor = currentUser ? vendors.find((v) => v.userId === currentUser.id) : null;

  // ---- storefront navigation -----------------------------------------
  function goHome() {
    setPage("home");
    setActiveCategory(null);
    setAppliedSearch("");
    setSearchInput("");
  }

  function goToProducts() {
    setPage("products");
  }

  function handleShopNow() {
    setActiveCategory(null);
    setAppliedSearch("");
    setSearchInput("");
    goToProducts();
  }

  function handleCategoryClick(cat) {
    setActiveCategory(cat);
    setAppliedSearch("");
    setSearchInput("");
    goToProducts();
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setAppliedSearch(searchInput);
    setActiveCategory(null);
    goToProducts();
  }

  function handleProductClick(id) {
    setSelectedProductId(id);
    setPage("detail");
  }

  function goToSupport() {
    setPreviousPage(page === "support" ? previousPage : page);
    setPage("support");
  }

  function handleSupportBack() {
    setPage(previousPage);
  }

  // ---- cart -------------------------------------------------------------
  function handleAddToCart(productId) {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { productId, qty: 1 }];
    });
  }

  function handleUpdateQty(productId, qty) {
    setCart((prev) => {
      if (qty <= 0) return prev.filter((item) => item.productId !== productId);
      return prev.map((item) =>
        item.productId === productId ? { ...item, qty } : item
      );
    });
  }

  function handlePlaceOrder() {
    if (cart.length === 0 || !currentUser) return;

    const items = cart
      .map((entry) => {
        const product = products.find((p) => p.id === entry.productId);
        if (!product) return null;
        return {
          productId: product.id,
          vendorId: product.vendorId,
          name: product.name,
          price: product.price,
          qty: entry.qty,
          status: "Processing",
        };
      })
      .filter(Boolean);

    const newOrder = {
      id: generateOrderId(),
      customerName: `${currentUser.first_name} ${currentUser.last_name}`.trim(),
      customerEmail: currentUser.email,
      date: new Date().toISOString().slice(0, 10),
      items,
    };

    setOrders((prev) => [...prev, newOrder]);

    // decrement stock for each purchased product
    setProducts((prev) =>
      prev.map((p) => {
        const entry = cart.find((c) => c.productId === p.id);
        if (!entry) return p;
        const nextStock = Math.max((p.stock || 0) - entry.qty, 0);
        return { ...p, stock: nextStock, inStock: nextStock > 0 };
      })
    );

    setCart([]);
  }

  // ---- wishlist -----------------------------------------------------------
  function handleToggleWishlist(productId) {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUser.id) return u;
        const has = u.wishlist.includes(productId);
        return {
          ...u,
          wishlist: has ? u.wishlist.filter((id) => id !== productId) : [...u.wishlist, productId],
        };
      })
    );
    setCurrentUser((prev) => {
      const has = prev.wishlist.includes(productId);
      return {
        ...prev,
        wishlist: has ? prev.wishlist.filter((id) => id !== productId) : [...prev.wishlist, productId],
      };
    });
  }

  // ---- auth -----------------------------------------------------------
  function handleRegister(newUser) {
    setUsers((prev) => [...prev, newUser]);
  }

  function handleLoginSuccess(user) {
    setCurrentUser(user);
    setScreen("app");
    if (user.role === "admin") setActiveModule("admin");
    else if (user.role === "vendor") setActiveModule("vendor");
    else setActiveModule("store");
    setPage("home");
  }

  function handleLogout() {
    setCurrentUser(null);
    setActiveModule("store");
    setScreen("app");
    setPage("home");
    setCart([]);
  }

  // ---- vendor onboarding -----------------------------------------------
  function handleBecomeVendor() {
    setScreen("vendor-onboarding");
  }

  function handleVendorOnboardingCancel() {
    setScreen("app");
  }

  function handleVendorOnboardingComplete(vendorForm) {
    const newVendor = {
      id: Date.now(),
      userId: currentUser.id,
      business_name: vendorForm.business_name,
      business_email: vendorForm.business_email,
      business_phone: vendorForm.business_phone,
      business_address: vendorForm.business_address,
      city: vendorForm.city,
      country: vendorForm.country,
      description: vendorForm.description,
      logo_url: vendorForm.logo_url,
      website_url: vendorForm.website_url,
      cnic_number: vendorForm.cnic_number,
      verification_document_url: vendorForm.verification_document_url,
      approval_status: "Pending",
      status: "pending",
      is_active: false,
      verification_status: "Pending",
      created_at: new Date().toISOString().slice(0, 10),
    };

    setVendors((prev) => [...prev, newVendor]);

    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, is_vendor: true } : u)));
    setCurrentUser((prev) => ({ ...prev, is_vendor: true }));
  }

  function handleVendorOnboardingFinish() {
    setScreen("app");
    setActiveModule("vendor");
  }

  // ---- vendor dashboard actions -----------------------------------------
  function handleAddProduct(productData) {
    if (!myVendor) return;
    const newProduct = {
      id: Date.now(),
      vendorId: myVendor.id,
      name: productData.name,
      description: productData.description || "",
      price: Number(productData.price) || 0,
      stock: Number(productData.stock) || 0,
      category: productData.category || categories[0]?.name || "",
      image_url: productData.image_url || "",
      brand: myVendor.business_name,
      sku: `${myVendor.business_name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`,
      rating: 0,
      reviewCount: 0,
      inStock: (Number(productData.stock) || 0) > 0,
      variants: [],
      reviews: [],
    };
    setProducts((prev) => [...prev, newProduct]);
  }

  function handleUpdateProduct(productId, updates) {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const next = { ...p, ...updates };
        if (updates.stock !== undefined) next.inStock = Number(updates.stock) > 0;
        return next;
      })
    );
  }

  function handleAdjustStock(productId, delta) {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const nextStock = Math.max((p.stock || 0) + delta, 0);
        return { ...p, stock: nextStock, inStock: nextStock > 0 };
      })
    );
  }

  function handleUpdateOrderItemStatus(orderId, productId, vendorId, status) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          items: o.items.map((item) =>
            item.productId === productId && item.vendorId === vendorId ? { ...item, status } : item
          ),
        };
      })
    );
  }

  function handleUpdateVendorProfile(vendorId, updates) {
    setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, ...updates } : v)));
  }

  // ---- admin actions -----------------------------------------------------
  function handleApproveVendor(vendorId) {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId
          ? { ...v, approval_status: "Approved", status: "active", is_active: true, verification_status: "Verified" }
          : v
      )
    );
  }

  function handleRejectVendor(vendorId) {
    setVendors((prev) =>
      prev.map((v) =>
        v.id === vendorId
          ? { ...v, approval_status: "Rejected", status: "rejected", is_active: false, verification_status: "Rejected" }
          : v
      )
    );
  }

  function handleAddCategory(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return;
    setCategories((prev) => [...prev, { id: Date.now(), name: trimmed }]);
  }

  function handleAddAdmin(adminUser) {
    setUsers((prev) => [...prev, adminUser]);
  }

  function handleReplyTicket(ticketId, reply) {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, reply, status: "Answered" } : t))
    );
  }

  function handleSubmitTicket({ subject, message }) {
    if (!currentUser) return;
    const newTicket = {
      id: generateTicketId(),
      customerId: currentUser.id,
      customerName: `${currentUser.first_name} ${currentUser.last_name}`.trim(),
      customerEmail: currentUser.email,
      subject,
      message,
      status: "Open",
      reply: "",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTickets((prev) => [...prev, newTicket]);
  }

  // ---- render -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="app-shell">
        <Auth users={users} onRegister={handleRegister} onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  if (screen === "vendor-onboarding") {
    return (
      <div className="app-shell">
        <VendorOnboarding
          currentUser={currentUser}
          onCancel={handleVendorOnboardingCancel}
          onComplete={handleVendorOnboardingComplete}
          onFinish={handleVendorOnboardingFinish}
        />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <ModuleSwitcher
        activeModule={activeModule}
        onSwitch={setActiveModule}
        user={currentUser}
        onLogout={handleLogout}
        onBecomeVendor={handleBecomeVendor}
      />

      {activeModule === "store" && (
        <>
          <Header
            page={page}
            searchTerm={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            onLogoClick={goHome}
            cartCount={cartCount}
            onCartClick={() => setPage("cart")}
            onSupportClick={goToSupport}
          />

          {page === "home" && (
            <HomePage
              products={storefrontProducts}
              categories={categories}
              onShopNow={handleShopNow}
              onCategoryClick={handleCategoryClick}
              onProductClick={handleProductClick}
              onSupportClick={goToSupport}
            />
          )}

          {page === "products" && (
            <ProductsPage
              products={filteredProducts}
              categories={categories}
              searchTerm={appliedSearch}
              activeCategory={activeCategory}
              onCategoryFilter={setActiveCategory}
              onProductClick={handleProductClick}
              onGoHome={goHome}
            />
          )}

          {page === "detail" && selectedProduct && (
            <ProductDetailPage
              product={selectedProduct}
              relatedProducts={storefrontProducts}
              vendor={vendorsById[selectedProduct.vendorId]}
              wishlisted={currentUser.wishlist.includes(selectedProduct.id)}
              onToggleWishlist={() => handleToggleWishlist(selectedProduct.id)}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              onGoHome={goHome}
              onGoProducts={goToProducts}
            />
          )}

          {page === "cart" && (
            <CartCheckout
              cart={cart}
              products={products}
              onUpdateQty={handleUpdateQty}
              onPlaceOrder={handlePlaceOrder}
              onGoHome={goHome}
              onContinueShopping={goToProducts}
            />
          )}

          {page === "support" && (
            <CustomerService onBack={handleSupportBack} onSubmitTicket={handleSubmitTicket} />
          )}

          <footer className="site-footer">© PAK Hardware Marketplace</footer>
        </>
      )}

      {activeModule === "vendor" && hasVendorAccess(currentUser) && (
        <VendorDashboard
          vendor={myVendor}
          products={products.filter((p) => myVendor && p.vendorId === myVendor.id)}
          categories={categories}
          orders={orders.filter(
            (o) => myVendor && o.items.some((item) => item.vendorId === myVendor.id)
          )}
          payouts={payouts.filter((p) => myVendor && p.vendorId === myVendor.id)}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onAdjustStock={handleAdjustStock}
          onUpdateOrderItemStatus={handleUpdateOrderItemStatus}
          onUpdateVendorProfile={handleUpdateVendorProfile}
        />
      )}

      {activeModule === "admin" && currentUser.role === "admin" && (
        <AdminPanel
          currentUser={currentUser}
          users={users}
          vendors={vendors}
          products={products}
          categories={categories}
          orders={orders}
          tickets={tickets}
          onApproveVendor={handleApproveVendor}
          onRejectVendor={handleRejectVendor}
          onAddCategory={handleAddCategory}
          onAddAdmin={handleAddAdmin}
          onReplyTicket={handleReplyTicket}
        />
      )}
    </div>
  );
}
