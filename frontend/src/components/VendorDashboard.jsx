import React, { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Boxes,
  BarChart3,
  Star,
  Wallet,
  UserCircle,
  Menu,
  X,
  Plus,
  Minus,
  Pencil,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
} from "lucide-react";
import logo from "../assets/logo.jpeg";
import { formatPrice, SELLING_UNITS, unitLabel } from "../data/products";
import { ORDER_STATUSES, MONTH_NAMES } from "../data/orders";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Products", icon: Package },
  { label: "Orders", icon: ClipboardList },
  { label: "Inventory", icon: Boxes },
  { label: "Sales Reports", icon: BarChart3 },
  { label: "Reviews", icon: Star },
  { label: "Payouts", icon: Wallet },
  { label: "Profile", icon: UserCircle },
];

const statusClass = {
  Delivered: "status-green",
  "In Delivery": "status-amber",
  "In Production": "status-amber",
  Processing: "status-amber",
  Terminated: "status-red",
  Cancelled: "status-red",
  Paid: "status-green",
  Pending: "status-amber",
};

const EMPTY_PRODUCT_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
  unit: "piece",
  category: "",
  image_url: "",
  extraImages: [],
};

function monthKey(dateStr) {
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export default function VendorDashboard({
  vendor,
  products,
  categories,
  orders,
  payouts,
  onAddProduct,
  onUpdateProduct,
  onAdjustStock,
  onUpdateOrderItemStatus,
  onUpdateVendorProfile,
}) {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [profileForm, setProfileForm] = useState(null); // lazily initialized from vendor
  const [stockDelta, setStockDelta] = useState({});

  const [productSearch, setProductSearch] = useState("");
  const [productSort, setProductSort] = useState("default");
  const [orderSearch, setOrderSearch] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");

  if (!vendor) {
    return (
      <div className="dashboard-shell">
        <main className="dashboard-main">
          <div className="panel placeholder-panel">
            <AlertTriangle size={28} />
            <h3>No vendor account found</h3>
            <p className="empty-state">Something went wrong loading your vendor profile.</p>
          </div>
        </main>
      </div>
    );
  }

  const myOrderItems = orders.flatMap((o) =>
    o.items
      .filter((item) => item.vendorId === vendor.id)
      .map((item) => ({ ...item, orderId: o.id, date: o.date, customerName: o.customerName, customerEmail: o.customerEmail }))
  );

  const totalSales = myOrderItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const pendingPayout = payouts
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);

  // last-12-months bar chart data
  const now = new Date();
  const last12 = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth(), label: MONTH_NAMES[d.getMonth()].slice(0, 3) };
  });
  const salesByMonth = last12.map(({ year, month }) => {
    return myOrderItems
      .filter((i) => {
        const k = monthKey(i.date);
        return k.year === year && k.month === month;
      })
      .reduce((sum, i) => sum + i.price * i.qty, 0);
  });
  const maxMonthSales = Math.max(...salesByMonth, 1);

  const vendorOrders = orders.filter((o) => o.items.some((i) => i.vendorId === vendor.id));
  const recentOrders = [...vendorOrders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  function orderVendorStatus(order) {
    const items = order.items.filter((i) => i.vendorId === vendor.id);
    const statuses = new Set(items.map((i) => i.status));
    return statuses.size === 1 ? [...statuses][0] : "Mixed";
  }

  // ---- search + sort: Products / Inventory / Orders tables ----------------
  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    let list = products;
    if (term) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.sku || "").toLowerCase().includes(term) ||
          (p.category || "").toLowerCase().includes(term) ||
          (p.description || "").toLowerCase().includes(term)
      );
    }
    const sorted = [...list];
    switch (productSort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "stock-asc":
        sorted.sort((a, b) => a.stock - b.stock);
        break;
      case "stock-desc":
        sorted.sort((a, b) => b.stock - a.stock);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [products, productSearch, productSort]);

  const filteredInventory = useMemo(() => {
    const term = inventorySearch.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(term) || (p.sku || "").toLowerCase().includes(term)
    );
  }, [products, inventorySearch]);

  const filteredOrderItems = useMemo(() => {
    const term = orderSearch.trim().toLowerCase();
    if (!term) return myOrderItems;
    return myOrderItems.filter(
      (item) =>
        item.orderId.toLowerCase().includes(term) ||
        item.customerName.toLowerCase().includes(term) ||
        item.customerEmail.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term)
    );
  }, [myOrderItems, orderSearch]);

  // ---- Products tab ------------------------------------------------------
  function openAddForm() {
    setProductForm(EMPTY_PRODUCT_FORM);
    setEditingId(null);
    setFormOpen(true);
  }

   function openEditForm(product) {
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      unit: product.unit || "piece",
      category: product.category,
      image_url: product.image_url || "",
      extraImages: product.extraImages && product.extraImages.length > 0 ? product.extraImages : [],
    });
    setEditingId(product.id);
    setFormOpen(true);
  }

    function handleProductFormSubmit(e) {
    e.preventDefault();
    if (!productForm.name.trim() || productForm.price === "" || productForm.stock === "") return;
    const cleanExtraImages = (productForm.extraImages || []).map((u) => u.trim()).filter(Boolean);
    if (editingId) {
      onUpdateProduct(editingId, {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        stock: Number(productForm.stock),
        unit: productForm.unit,
        category: productForm.category,
        image_url: productForm.image_url,
        extra_images: cleanExtraImages,
      });
    } else {
      onAddProduct({ ...productForm, extraImages: cleanExtraImages });
    }
    setFormOpen(false);
    setProductForm(EMPTY_PRODUCT_FORM);
    setEditingId(null);
  }

  function addExtraImageField() {
    setProductForm((p) => ({ ...p, extraImages: [...(p.extraImages || []), ""] }));
  }

  function updateExtraImageField(index, value) {
    setProductForm((p) => {
      const next = [...(p.extraImages || [])];
      next[index] = value;
      return { ...p, extraImages: next };
    });
  }

  function removeExtraImageField(index) {
    setProductForm((p) => {
      const next = [...(p.extraImages || [])];
      next.splice(index, 1);
      return { ...p, extraImages: next };
    });
  }

  // ---- Sales report: previous full calendar year ------------------------
  const previousYear = now.getFullYear() - 1;
  const previousYearItems = myOrderItems.filter((i) => monthKey(i.date).year === previousYear);
  const previousYearTotal = previousYearItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const previousYearByMonth = MONTH_NAMES.map((name, idx) => {
    const total = previousYearItems
      .filter((i) => monthKey(i.date).month === idx)
      .reduce((sum, i) => sum + i.price * i.qty, 0);
    return { name, total };
  });

  // ---- Reviews ------------------------------------------------------------
  const allReviews = products.flatMap((p) =>
    (p.reviews || []).map((r) => ({ ...r, productName: p.name }))
  );

  // ---- Profile --------------------------------------------------------------
  const profile = profileForm || {
    business_name: vendor.business_name,
    business_email: vendor.business_email,
    business_phone: vendor.business_phone,
    business_address: vendor.business_address,
    city: vendor.city,
    country: vendor.country,
    description: vendor.description,
    logo_url: vendor.logo_url,
    website_url: vendor.website_url,
  };

  function handleProfileSave(e) {
    e.preventDefault();
    onUpdateVendorProfile(vendor.id, profile);
  }

  const approvalBadge = {
    Approved: { icon: CheckCircle2, cls: "status-green" },
    Pending: { icon: Clock, cls: "status-amber" },
    Rejected: { icon: AlertTriangle, cls: "status-red" },
  }[vendor.approval_status] || { icon: Clock, cls: "status-amber" };
  const ApprovalIcon = approvalBadge.icon;

  return (
    <div className="dashboard-shell">
      <header className="site-header">
        <div className="header-top-row">
          <div className="brand">
            <img src={logo} alt="PAK Hardware logo" className="brand-logo" />
            <span className="brand-name">PAK HARDWARE</span>
          </div>
          <div className="header-right">
            <span className="page-label">VENDOR DASHBOARD</span>
            <button
              className="mobile-menu-toggle"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {vendor.approval_status !== "Approved" && (
        <div className={`vendor-approval-banner ${vendor.approval_status === "Rejected" ? "rejected" : "pending"}`}>
          <ApprovalIcon size={16} />
          {vendor.approval_status === "Rejected" ? (
            <span>
              Your vendor application was <strong>rejected</strong>. Your products will not
              appear on the storefront. Contact support for details.
            </span>
          ) : (
            <span>
              Your vendor account is <strong>pending admin approval</strong>. You can set up
              products, inventory, and your profile now — they'll go live on the storefront as
              soon as you're approved.
            </span>
          )}
        </div>
      )}

      <div className="dashboard-body">
        <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`sidebar-item ${activeItem === item.label ? "active" : ""}`}
                onClick={() => {
                  setActiveItem(item.label);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </aside>

        <main className="dashboard-main">
          {activeItem === "Dashboard" && (
            <>
              <div className="stat-grid">
                <div className="stat-card">
                  <span className="stat-label">Total Sales</span>
                  <span className="stat-value orange">{formatPrice(totalSales)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Orders</span>
                  <span className="stat-value blue">{vendorOrders.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Products Listed</span>
                  <span className="stat-value green">{products.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Pending Payout</span>
                  <span className="stat-value blue">{formatPrice(pendingPayout)}</span>
                </div>
              </div>

              <div className="mid-grid">
                <div className="panel">
                  <h3>Sales Analytics (Last 12 Months)</h3>
                  <div className="bar-chart">
                    {salesByMonth.map((v, i) => (
                      <span
                        key={i}
                        className={`bar ${i % 3 === 0 ? "bar-yellow" : "bar-orange"}`}
                        style={{ height: `${Math.max((v / maxMonthSales) * 100, 2)}%` }}
                        title={`${last12[i].label}: ${formatPrice(v)}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <h3>Recent Orders</h3>
                  {recentOrders.length === 0 ? (
                    <p className="empty-state">No orders yet.</p>
                  ) : (
                    <ul className="simple-list">
                      {recentOrders.map((o) => (
                        <li key={o.id}>
                          <span>{o.id}</span>
                          <span className={statusClass[orderVendorStatus(o)] || ""}>
                            {orderVendorStatus(o)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="panel">
                <h3>Product Overview</h3>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((row) => (
                        <tr key={row.id}>
                          <td>{row.name}</td>
                          <td>{row.sku}</td>
                          <td>{row.stock}</td>
                          <td>{formatPrice(row.price)}</td>
                          <td className={row.inStock ? "status-green" : "status-red"}>
                            {row.inStock ? "Active" : "Out of Stock"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeItem === "Products" && (
            <div className="panel">
              <div className="panel-header-row">
                <h3>My Products</h3>
                <button className="btn btn-primary" onClick={openAddForm}>
                  <Plus size={15} /> Add New Product
                </button>
              </div>

              {formOpen && (
                <form className="inline-form" onSubmit={handleProductFormSubmit}>
                  <div className="inline-form-row">
                    <label className="auth-field">
                      <span>Product name</span>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                        required
                      />
                    </label>
                    <label className="auth-field">
                      <span>Category</span>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                      >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="auth-field">
                    <span>Description</span>
                    <textarea
                      rows={2}
                      value={productForm.description}
                      onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                    />
                  </label>

                  <div className="inline-form-row">
                    <label className="auth-field">
                      <span>Price (Rs.)</span>
                      <input
                        type="number"
                        min="0"
                        value={productForm.price}
                        onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                        required
                      />
                    </label>
                                        <label className="auth-field">
                      <span>Stock</span>
                      <input
                        type="number"
                        min="0"
                        value={productForm.stock}
                        onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))}
                        required
                      />
                    </label>
                  </div>

                  <label className="auth-field">
                    <span>Selling Unit</span>
                    <select
                      value={productForm.unit}
                      onChange={(e) => setProductForm((p) => ({ ...p, unit: e.target.value }))}
                    >
                      {SELLING_UNITS.map((u) => (
                        <option key={u.value} value={u.value}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="auth-field">
                    <span>Image URL (optional)</span>
                    <input
                      type="text"
                      value={productForm.image_url}
                      onChange={(e) => setProductForm((p) => ({ ...p, image_url: e.target.value }))}
                    />
                  </label>

                  <div className="auth-field">
                    <span>Additional photos (optional) — from different angles</span>
                    {(productForm.extraImages || []).map((url, i) => (
                      <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                        <input
                          type="text"
                          placeholder="Image URL"
                          value={url}
                          onChange={(e) => updateExtraImageField(i, e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => removeExtraImageField(i)}
                          aria-label="Remove photo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={addExtraImageField}
                    >
                      <Plus size={14} /> Add another photo
                    </button>
                  </div>

                  <div className="onboarding-nav">
                    <button type="button" className="btn btn-outline" onClick={() => setFormOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingId ? "Save Changes" : "Add Product"}
                    </button>
                  </div>
                </form>
              )}

              <div className="table-toolbar">
                <div className="table-search">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search your products by name, SKU, or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <div className="sort-select-wrap">
                  <label htmlFor="vendor-product-sort">Sort by:</label>
                  <select
                    id="vendor-product-sort"
                    className="sort-select"
                    value={productSort}
                    onChange={(e) => setProductSort(e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="stock-desc">Stock: High to Low</option>
                    <option value="stock-asc">Stock: Low to High</option>
                    <option value="name-asc">Name: A to Z</option>
                  </select>
                </div>
              </div>

              {products.length === 0 ? (
                <p className="empty-state">You haven't added any products yet.</p>
              ) : filteredProducts.length === 0 ? (
                <p className="empty-state">No products match "{productSearch}".</p>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td className="truncate-cell">{p.description || "—"}</td>
                                                    <td>{p.category}</td>
                          <td>{formatPrice(p.price)}</td>
                          <td>{unitLabel(p.unit)}</td>
                          <td className={p.stock === 0 ? "status-red" : ""}>{p.stock}</td>
                          <td>
                            <button className="btn btn-outline btn-sm" onClick={() => openEditForm(p)}>
                              <Pencil size={13} /> Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeItem === "Orders" && (
            <div className="panel">
              <h3>Orders</h3>
              <div className="table-toolbar">
                <div className="table-search">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search orders by ID, customer, product, or status..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
              </div>
              {myOrderItems.length === 0 ? (
                <p className="empty-state">No orders for your products yet.</p>
              ) : filteredOrderItems.length === 0 ? (
                <p className="empty-state">No orders match "{orderSearch}".</p>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Email</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...filteredOrderItems].reverse().map((item, i) => (
                        <tr key={`${item.orderId}-${item.productId}-${i}`}>
                          <td>{item.orderId}</td>
                          <td>{item.customerName}</td>
                          <td>{item.customerEmail}</td>
                          <td>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>{formatPrice(item.price * item.qty)}</td>
                          <td>
                            <select
                              className="status-select"
                              value={item.status}
                              onChange={(e) =>
                                onUpdateOrderItemStatus(item.orderId, item.productId, item.vendorId, e.target.value)
                              }
                            >
                              {ORDER_STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeItem === "Inventory" && (
            <div className="panel">
              <h3>Inventory</h3>
              <div className="table-toolbar">
                <div className="table-search">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search by product name or SKU..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                  />
                </div>
              </div>
              {products.length === 0 ? (
                <p className="empty-state">No products yet — add one from the Products tab.</p>
              ) : filteredInventory.length === 0 ? (
                <p className="empty-state">No products match "{inventorySearch}".</p>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Current Stock</th>
                        <th>Adjust</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.sku}</td>
                          <td className={p.stock === 0 ? "status-red" : "status-green"}>{p.stock}</td>
                          <td>
                            <div className="stock-adjust-row">
                              <button
                                className="qty-btn"
                                onClick={() => onAdjustStock(p.id, -(Number(stockDelta[p.id]) || 1))}
                                aria-label="Decrease stock"
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                type="number"
                                min="1"
                                className="stock-delta-input"
                                value={stockDelta[p.id] ?? 1}
                                onChange={(e) =>
                                  setStockDelta((prev) => ({ ...prev, [p.id]: e.target.value }))
                                }
                              />
                              <button
                                className="qty-btn"
                                onClick={() => onAdjustStock(p.id, Number(stockDelta[p.id]) || 1)}
                                aria-label="Increase stock"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeItem === "Sales Reports" && (
            <>
              <div className="stat-grid">
                <div className="stat-card">
                  <span className="stat-label">Total Sales ({previousYear})</span>
                  <span className="stat-value orange">{formatPrice(previousYearTotal)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Total Sales (All Time)</span>
                  <span className="stat-value blue">{formatPrice(totalSales)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Items Sold ({previousYear})</span>
                  <span className="stat-value green">
                    {previousYearItems.reduce((sum, i) => sum + i.qty, 0)}
                  </span>
                </div>
              </div>

              <div className="panel">
                <h3>Monthly Sales — {previousYear}</h3>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Sales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previousYearByMonth.map((m) => (
                        <tr key={m.name}>
                          <td>{m.name}</td>
                          <td className={m.total > 0 ? "orange-text" : ""}>{formatPrice(m.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeItem === "Reviews" && (
            <div className="panel">
              <h3>Reviews on Your Products</h3>
              {allReviews.length === 0 ? (
                <p className="empty-state">No reviews yet.</p>
              ) : (
                <div className="reviews-box">
                  {allReviews.map((r, i) => (
                    <p key={i}>
                      <strong>{r.productName}</strong> — {"★".repeat(r.stars)}
                      {"☆".repeat(5 - r.stars)} {r.text}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeItem === "Payouts" && (
            <div className="panel">
              <h3>Payout History</h3>
              {payouts.length === 0 ? (
                <p className="empty-state">No payouts issued yet.</p>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Payout ID</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map((p) => (
                        <tr key={p.id}>
                          <td>{p.id}</td>
                          <td>{p.date}</td>
                          <td>{formatPrice(p.amount)}</td>
                          <td>{p.method}</td>
                          <td className={statusClass[p.status] || ""}>{p.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeItem === "Profile" && (
            <div className="panel">
              <h3>
                Vendor Profile{" "}
                <span className={approvalBadge.cls} style={{ fontSize: 12, marginLeft: 8 }}>
                  {vendor.approval_status}
                </span>
              </h3>

              <form className="inline-form" onSubmit={handleProfileSave}>
                <label className="auth-field">
                  <span>Business name</span>
                  <input
                    type="text"
                    value={profile.business_name}
                    onChange={(e) =>
                      setProfileForm({ ...profile, business_name: e.target.value })
                    }
                  />
                </label>

                <div className="inline-form-row">
                  <label className="auth-field">
                    <span>Business email</span>
                    <input
                      type="email"
                      value={profile.business_email}
                      onChange={(e) =>
                        setProfileForm({ ...profile, business_email: e.target.value })
                      }
                    />
                  </label>
                  <label className="auth-field">
                    <span>Business phone</span>
                    <input
                      type="tel"
                      value={profile.business_phone}
                      onChange={(e) =>
                        setProfileForm({ ...profile, business_phone: e.target.value })
                      }
                    />
                  </label>
                </div>

                <label className="auth-field">
                  <span>Address</span>
                  <input
                    type="text"
                    value={profile.business_address}
                    onChange={(e) =>
                      setProfileForm({ ...profile, business_address: e.target.value })
                    }
                  />
                </label>

                <div className="inline-form-row">
                  <label className="auth-field">
                    <span>City</span>
                    <input
                      type="text"
                      value={profile.city}
                      onChange={(e) => setProfileForm({ ...profile, city: e.target.value })}
                    />
                  </label>
                  <label className="auth-field">
                    <span>Country</span>
                    <input
                      type="text"
                      value={profile.country}
                      onChange={(e) => setProfileForm({ ...profile, country: e.target.value })}
                    />
                  </label>
                </div>

                <label className="auth-field">
                  <span>Description</span>
                  <textarea
                    rows={3}
                    value={profile.description}
                    onChange={(e) => setProfileForm({ ...profile, description: e.target.value })}
                  />
                </label>

                <div className="inline-form-row">
                  <label className="auth-field">
                    <span>Logo URL</span>
                    <input
                      type="text"
                      value={profile.logo_url}
                      onChange={(e) => setProfileForm({ ...profile, logo_url: e.target.value })}
                    />
                  </label>
                  <label className="auth-field">
                    <span>Website URL</span>
                    <input
                      type="text"
                      value={profile.website_url}
                      onChange={(e) => setProfileForm({ ...profile, website_url: e.target.value })}
                    />
                  </label>
                </div>

                <div className="auth-field-row-single">
                  <span className="empty-state">
                    CNIC: {vendor.cnic_number} · Document: {vendor.verification_document_url} ·
                    Verification: <span className={approvalBadge.cls}>{vendor.verification_status}</span>
                  </span>
                </div>

                <button type="submit" className="btn btn-primary auth-submit">
                  Save Profile
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      <footer className="site-footer">
        © PAK Hardware Marketplace | Vendor Dashboard
      </footer>
    </div>
  );
}
