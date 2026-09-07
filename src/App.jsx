import React, { useState, useMemo, useEffect, useCallback } from "react";
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
import { SEED_TICKETS, generateTicketId } from "./data/tickets";
import { getToken } from "./api/client";
import * as authApi from "./api/auth";
import * as productsApi from "./api/products";
import * as vendorsApi from "./api/vendors";
import * as ordersApi from "./api/orders";

export default function App() {
  // auth / session state
  const [currentUser, setCurrentUser] = useState(null);
  const [booting, setBooting] = useState(true); // restoring session from saved token
  const [apiError, setApiError] = useState("");

  // marketplace data (fetched from the real backend)
  const [myVendor, setMyVendor] = useState(null); // the logged-in user's own vendor record, if any
  const [vendors, setVendors] = useState([]); // admin-only: all vendors
  const [products, setProducts] = useState([]);
  const [vendorProducts, setVendorProducts] = useState([]); // logged-in vendor's own products
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]); // current user's own orders, or all orders for admin
  const [payouts] = useState([]); // no backend payouts UI wired up yet
  const [tickets, setTickets] = useState(SEED_TICKETS); // support tickets have no backend yet — local only

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

  // ---- initial data load ------------------------------------------------
  const loadCatalog = useCallback(async () => {
    try {
      const [prods, cats] = await Promise.all([productsApi.fetchProducts(), productsApi.fetchCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      setApiError(err.message || "Could not load the store catalog.");
    }
  }, []);

  const loadForRole = useCallback(async (user) => {
    try {
      const vendor = await vendorsApi.fetchMyVendor();
      setMyVendor(vendor);
      if (vendor) {
        const myProducts = await productsApi.fetchProducts({ vendor_id: vendor.id });
        setVendorProducts(myProducts);
      }
    } catch {
      /* not a vendor yet — fine */
    }

    try {
      const myOrders = await ordersApi.fetchMyOrders();
      setOrders(myOrders);
    } catch {
      /* no orders yet, or endpoint hiccup — non-fatal */
    }

    if (user.role === "admin") {
      try {
        const allVendors = await vendorsApi.fetchAllVendors();
        setVendors(allVendors);
      } catch {
        /* ignore */
      }
      try {
  const allOrders = await ordersApi.fetchAllOrders();
  setOrders(
    allOrders.map((o) => ({
      id: o.id,
      status: o.status,
      date: (o.created_at || "").slice(0, 10),
      customerName: `${o.first_name || ""} ${o.last_name || ""}`.trim(),
      customerEmail: o.customer_email,
      items: (o.items || []).filter((it) => it.productId !== null),
    }))
  );
} catch {
  /* ignore */
}
    }
  }, []);

  // load public catalog once on boot
  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  // try to restore a session from a saved token
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) {
        setBooting(false);
        return;
      }
      try {
        const user = await authApi.fetchMe();
        setCurrentUser(user);
        if (user.role === "admin") setActiveModule("admin");
        await loadForRole(user);
      } catch {
        authApi.logout();
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  // ---- derived lookups ----------------------------------------------
  // Only rejected products are hidden — approval review happens in the
  // admin panel, but we keep the storefront populated in the meantime
  // rather than risk an empty-looking demo.
  const storefrontProducts = useMemo(
    () => products.filter((p) => p.approval_status !== "rejected"),
    [products]
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

    async function handlePlaceOrder() {
    if (cart.length === 0) return;
    if (!currentUser) {
      handleGoToLogin();
      return;
    }

    const lines = cart
      .map((entry) => {
        const product = products.find((p) => p.id === entry.productId);
        if (!product) return null;
        return { productId: product.id, qty: entry.qty };
      })
      .filter(Boolean);

   try {
      await ordersApi.placeOrder(currentUser, lines);
      setCart([]);
      await loadCatalog(); // stock levels changed
      const myOrders = await ordersApi.fetchMyOrders();
      setOrders(myOrders);
      return true;
    } catch (err) {
      setApiError(err.message || "Could not place the order. Please try again.");
      return false;
    }
  }

  // ---- wishlist (local only — no backend wired up yet) -------------------
  function handleToggleWishlist(productId) {
    if (!currentUser) return;
    setCurrentUser((prev) => {
      const has = prev.wishlist.includes(productId);
      return {
        ...prev,
        wishlist: has ? prev.wishlist.filter((id) => id !== productId) : [...prev.wishlist, productId],
      };
    });
  }

  // ---- auth -----------------------------------------------------------
  async function handleRegister(formData) {
    const user = await authApi.register(formData);
    setCurrentUser(user);
    setScreen("app");
    setActiveModule("store");
    setPage("home");
    await loadForRole(user);
  }

  async function handleLoginSuccess(credentials) {
    const user = await authApi.login(credentials);
    setCurrentUser(user);
    setScreen("app");
    if (user.role === "admin") setActiveModule("admin");
    else setActiveModule("store");
    setPage("home");
    await loadForRole(user);
  }

  function handleLogout() {
    authApi.logout();
    setCurrentUser(null);
    setMyVendor(null);
    setVendors([]);
    setVendorProducts([]);
    setOrders([]);
    setActiveModule("store");
    setScreen("app");
    setPage("home");
    setCart([]);
  }

  // ---- vendor onboarding -----------------------------------------------
    function handleGoToLogin() {
    setScreen("auth");
  }
  function handleBecomeVendor() {
    setScreen("vendor-onboarding");
  }

  function handleVendorOnboardingCancel() {
    setScreen("app");
  }

  async function handleVendorOnboardingComplete(vendorForm) {
    try {
      const vendor = await vendorsApi.registerVendor({
        business_name: vendorForm.business_name,
        business_email: vendorForm.business_email,
        business_phone: vendorForm.business_phone,
        business_address: vendorForm.business_address,
        city: vendorForm.city,
        country: vendorForm.country,
        description: vendorForm.description,
        logo_url: vendorForm.logo_url,
        website_url: vendorForm.website_url,
      });
      setMyVendor(vendor);
      setCurrentUser((prev) => ({ ...prev, is_vendor: true }));
    } catch (err) {
      setApiError(err.message || "Could not submit vendor registration.");
    }
  }

  function handleVendorOnboardingFinish() {
    setScreen("app");
    setActiveModule("vendor");
  }

  // ---- vendor dashboard actions -----------------------------------------
  async function refreshVendorProducts() {
    if (!myVendor) return;
    const myProducts = await productsApi.fetchProducts({ vendor_id: myVendor.id });
    setVendorProducts(myProducts);
  }
async function handleDeleteProduct(productId) {
  try {
    await productsApi.deleteProduct(productId);
    await loadCatalog();
  } catch (err) {
    setApiError(err.message || "Could not delete product.");
  }
}
  async function handleAddProduct(productData) {
    if (!myVendor) return;
    const category = categories.find((c) => c.name === productData.category);
    try {
      await productsApi.createProduct({
        name: productData.name,
        description: productData.description || "",
        price: Number(productData.price) || 0,
        stock: Number(productData.stock) || 0,
        category_id: category ? category.id : null,
        image_url: productData.image_url || "",
        brand: myVendor.business_name,
               sku: `${myVendor.business_name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`,
        unit: productData.unit || "piece",
      });
      await refreshVendorProducts();
      await loadCatalog();
    } catch (err) {
      setApiError(err.message || "Could not add product.");
    }
  }

  async function handleUpdateProduct(productId, updates) {
    const category = updates.category ? categories.find((c) => c.name === updates.category) : null;
    try {
      await productsApi.updateProduct(productId, {
        ...updates,
        category_id: category ? category.id : undefined,
      });
      await refreshVendorProducts();
      await loadCatalog();
    } catch (err) {
      setApiError(err.message || "Could not update product.");
    }
  }

  async function handleAdjustStock(productId, delta) {
    const product = vendorProducts.find((p) => p.id === productId);
    if (!product) return;
    const nextStock = Math.max((product.stock || 0) + delta, 0);
    try {
      await productsApi.updateProduct(productId, { stock: nextStock });
      await refreshVendorProducts();
      await loadCatalog();
    } catch (err) {
      setApiError(err.message || "Could not adjust stock.");
    }
  }

  // Note: the backend doesn't yet track order status per line-item/vendor,
  // so this updates the local view only rather than persisting server-side.
  function handleUpdateOrderItemStatus(orderId, productId, vendorId, status) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          items: o.items.map((item) =>
            item.productId === productId ? { ...item, status } : item
          ),
        };
      })
    );
  }

  async function handleUpdateVendorProfile(vendorId, updates) {
    try {
      const vendor = await vendorsApi.updateVendorProfile(vendorId, updates);
      setMyVendor(vendor);
    } catch (err) {
      setApiError(err.message || "Could not update vendor profile.");
    }
  }

  // ---- admin actions -----------------------------------------------------
  async function refreshVendors() {
    const allVendors = await vendorsApi.fetchAllVendors();
    setVendors(allVendors);
  }

  async function handleApproveVendor(vendorId) {
    try {
      await vendorsApi.approveVendor(vendorId);
      await refreshVendors();
      await loadCatalog();
    } catch (err) {
      setApiError(err.message || "Could not approve vendor.");
    }
  }

  async function handleRejectVendor(vendorId) {
    try {
      await vendorsApi.rejectVendor(vendorId);
      await refreshVendors();
    } catch (err) {
      setApiError(err.message || "Could not reject vendor.");
    }
  }

  async function handleAddCategory(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return;
    try {
      await productsApi.createCategory(trimmed);
      await loadCatalog();
    } catch (err) {
      setApiError(err.message || "Could not add category.");
    }
  }

  // No backend endpoint exists yet to promote a user to admin — kept local-only.
  function handleAddAdmin() {
    setApiError("Adding new admin accounts isn't wired up to the backend yet.");
  }
async function handleUpdateOrderStatus(orderId, productId, status) {
  try {
    await ordersApi.updateOrderStatus(orderId, status);
    const allOrders = await ordersApi.fetchAllOrders();
    setOrders(
      allOrders.map((o) => ({
        id: o.id,
        status: o.status,
        date: (o.created_at || "").slice(0, 10),
        customerName: `${o.first_name || ""} ${o.last_name || ""}`.trim(),
        customerEmail: o.customer_email,
        items: (o.items || []).filter((it) => it.productId !== null),
      }))
    );
  } catch (err) {
    setApiError(err.message || "Could not update order status.");
  }
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
  if (booting) {
    return (
      <div className="app-shell">
        <div style={{ padding: "4rem", textAlign: "center" }}>Loading…</div>
      </div>
    );
  }

   if (screen === "auth") {
    return (
      <div className="app-shell">
        {apiError && (
          <div className="api-error-banner" onClick={() => setApiError("")}>
            {apiError}
          </div>
        )}
        <Auth
          onRegister={handleRegister}
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setScreen("app")}
        />
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
      {apiError && (
        <div className="api-error-banner" onClick={() => setApiError("")}>
          {apiError} (click to dismiss)
        </div>
      )}

          <ModuleSwitcher
        activeModule={activeModule}
        onSwitch={setActiveModule}
        user={currentUser}
        onLogout={handleLogout}
        onBecomeVendor={handleBecomeVendor}
        onLoginClick={handleGoToLogin}
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
              isGuest={!currentUser}
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
              vendor={null}
              wishlisted={currentUser ? currentUser.wishlist.includes(selectedProduct.id) : false}
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

      {activeModule === "vendor" && !!myVendor && (
        <VendorDashboard
          vendor={myVendor}
          products={vendorProducts}
          categories={categories}
          orders={orders}
          payouts={payouts}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onAdjustStock={handleAdjustStock}
          onUpdateOrderItemStatus={handleUpdateOrderItemStatus}
          onUpdateVendorProfile={handleUpdateVendorProfile}
        />
      )}

        {activeModule === "admin" && currentUser?.role === "admin" && (
        <AdminPanel
          currentUser={currentUser}
          users={[]}
          vendors={vendors}
          products={products}
          categories={categories}
          orders={orders}
          tickets={tickets}
          onApproveVendor={handleApproveVendor}
          onRejectVendor={handleRejectVendor}
          onAddCategory={handleAddCategory}
          onDeleteProduct={handleDeleteProduct}
          onAddAdmin={handleAddAdmin}
          onReplyTicket={handleReplyTicket}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      )}
    </div>
  );
}
