import React, { useMemo, useState } from "react";
import {
  LayoutGrid,
  Store,
  Package,
  ClipboardList,
  Users,
  Tags,
  ShieldCheck,
  FileText,
  BarChart3,
  Menu,
  X,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Plus,
  Mail,
  Phone,
  MapPin,
  Globe,
  Search,
} from "lucide-react";
import logo from "../assets/logo.jpeg";
import { formatPrice } from "../data/products";
import {
  isValidEmail,
  isValidNameToken,
  sanitizeNameInput,
  isValidPhone,
  sanitizePhoneInput,
} from "../data/users";

const SIDEBAR_ITEMS = [
  { label: "Overview", icon: LayoutGrid },
  { label: "Vendors", icon: Store },
  { label: "Products", icon: Package },
  { label: "Orders", icon: ClipboardList },
  { label: "Customers", icon: Users },
  { label: "Categories", icon: Tags },
  { label: "Reports", icon: BarChart3 },
  { label: "CMS", icon: FileText },
  { label: "Admins", icon: ShieldCheck },
];

const EMPTY_ADMIN_FORM = { first_name: "", last_name: "", email: "", password: "", phone: "" };

function trendPoints(values, width, height) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  return values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function AdminPanel({
  currentUser,
  users,
  vendors,
  products,
  categories,
  orders,
  tickets,
  onApproveVendor,
  onRejectVendor,
  onAddCategory,
  onAddAdmin,
  onReplyTicket,
  onUpdateOrderStatus,
  onDeleteProduct,
}) {
  const [activeItem, setActiveItem] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [zeroSalesOnly, setZeroSalesOnly] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryMsg, setCategoryMsg] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [adminForm, setAdminForm] = useState(EMPTY_ADMIN_FORM);
  const [adminErrors, setAdminErrors] = useState({});
  const [adminMsg, setAdminMsg] = useState("");

  const [vendorSearch, setVendorSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productSort, setProductSort] = useState("default");
  const [orderSearch, setOrderSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  // ---- shared computations ------------------------------------------------
  const allItems = orders.flatMap((o) =>
  o.items.map((item) => ({
    ...item,
    orderId: o.id,
    date: o.date,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    status: o.status,
  }))
);
  const fulfilledItems = allItems.filter((i) => i.status !== "Cancelled" && i.status !== "Terminated");

  function salesCountFor(productId) {
    return fulfilledItems.filter((i) => i.productId === productId).reduce((sum, i) => sum + i.qty, 0);
  }
  function revenueFor(productId) {
    return fulfilledItems
      .filter((i) => i.productId === productId)
      .reduce((sum, i) => sum + i.price * i.qty, 0);
  }
  function vendorRevenue(vendorId) {
    return fulfilledItems
      .filter((i) => i.vendorId === vendorId)
      .reduce((sum, i) => sum + i.price * i.qty, 0);
  }
  function vendorProductCount(vendorId) {
    return products.filter((p) => p.vendorId === vendorId).length;
  }

  const totalRevenue = fulfilledItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const pendingVendors = vendors.filter((v) => v.approval_status === "Pending");
  const customers = users.filter((u) => u.role === "customer");
  const admins = users.filter((u) => u.role === "admin");
  const selectedVendor = vendors.find((v) => v.id === selectedVendorId);
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  // last-12-point revenue trend (from all orders, chronological)
  const revenueTrend = (() => {
    const now = new Date();
    const months = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
    return months.map(({ year, month }) =>
      fulfilledItems
        .filter((i) => {
          const d = new Date(i.date);
          return d.getFullYear() === year && d.getMonth() === month;
        })
        .reduce((sum, i) => sum + i.price * i.qty, 0)
    );
  })();
  const width = 520;
  const height = 140;
  const points = trendPoints(revenueTrend, width, height);

  // ---- categories ------------------------------------------------------
  function handleAddCategory(e) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    const exists = categories.some((c) => c.name.toLowerCase() === newCategory.trim().toLowerCase());
    onAddCategory(newCategory);
    setCategoryMsg(exists ? "That category already exists." : `"${newCategory.trim()}" added.`);
    setNewCategory("");
    setTimeout(() => setCategoryMsg(""), 2500);
  }

  // ---- CMS ------------------------------------------------------------
  function handleSelectTicket(id) {
    setSelectedTicketId(id);
    const t = tickets.find((t) => t.id === id);
    setReplyText(t?.reply || "");
  }
  function handleSendReply(e) {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    onReplyTicket(selectedTicket.id, replyText.trim());
  }

  // ---- admins ------------------------------------------------------------
  function handleAdminChange(field, value) {
    let clean = value;
    if (field === "first_name" || field === "last_name") clean = sanitizeNameInput(value);
    if (field === "phone") clean = sanitizePhoneInput(value);
    setAdminForm((prev) => ({ ...prev, [field]: clean }));
  }

  function handleAddAdminSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!adminForm.first_name.trim() || !isValidNameToken(adminForm.first_name))
      errs.first_name = "Letters only, no spaces or numbers.";
    if (!adminForm.last_name.trim() || !isValidNameToken(adminForm.last_name))
      errs.last_name = "Letters only, no spaces or numbers.";
    if (!adminForm.email.trim() || !isValidEmail(adminForm.email))
      errs.email = "Enter a valid email address.";
    else if (users.some((u) => u.email.toLowerCase() === adminForm.email.trim().toLowerCase()))
      errs.email = "An account with this email already exists.";
    if (!adminForm.password || adminForm.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (adminForm.phone && !isValidPhone(adminForm.phone))
      errs.phone = "Enter an 11-digit number starting with 0.";
    setAdminErrors(errs);
    if (Object.keys(errs).length > 0) return;

    onAddAdmin({
      id: Date.now(),
      first_name: adminForm.first_name.trim(),
      last_name: adminForm.last_name.trim(),
      email: adminForm.email.trim(),
      password: adminForm.password,
      phone: adminForm.phone.trim(),
      role: "admin",
      is_verified: true,
      is_vendor: false,
      wishlist: [],
    });
    setAdminForm(EMPTY_ADMIN_FORM);
    setAdminMsg("New admin account created.");
    setTimeout(() => setAdminMsg(""), 2500);
  }
  function handleDeleteClick(productId, productName) {
    if (window.confirm(`Delete "${productName}"? This cannot be undone.`)) {
      onDeleteProduct(productId);
    }
  }
  const productsSorted = [...products].sort((a, b) => salesCountFor(b.id) - salesCountFor(a.id));
  const productsShown = zeroSalesOnly ? productsSorted.filter((p) => salesCountFor(p.id) === 0) : productsSorted;
  const vendorsSorted = [...vendors].sort((a, b) => vendorRevenue(b.id) - vendorRevenue(a.id));

  // ---- search + sort: Vendors / Products / Orders / Customers tables ------
  const filteredVendors = useMemo(() => {
    const term = vendorSearch.trim().toLowerCase();
    if (!term) return vendors;
    return vendors.filter(
      (v) =>
        v.business_name.toLowerCase().includes(term) ||
        (v.city || "").toLowerCase().includes(term) ||
        (v.business_email || "").toLowerCase().includes(term) ||
        v.approval_status.toLowerCase().includes(term)
    );
  }, [vendors, vendorSearch]);

  const filteredProductsShown = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    let list = productsShown;
    if (term) {
      list = list.filter((p) => {
        const vendorName = vendors.find((v) => v.id === p.vendorId)?.business_name || "";
        return (
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          vendorName.toLowerCase().includes(term)
        );
      });
    }
    const sorted = [...list];
    switch (productSort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "sales-desc":
        sorted.sort((a, b) => salesCountFor(b.id) - salesCountFor(a.id));
        break;
      case "sales-asc":
        sorted.sort((a, b) => salesCountFor(a.id) - salesCountFor(b.id));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    return sorted;
  }, [productsShown, productSearch, productSort, vendors]);

  const filteredAllItems = useMemo(() => {
    const term = orderSearch.trim().toLowerCase();
    if (!term) return allItems;
    return allItems.filter((item) => {
      const vendorName = vendors.find((v) => v.id === item.vendorId)?.business_name || "";
      return (
        item.orderId.toLowerCase().includes(term) ||
        item.customerName.toLowerCase().includes(term) ||
        item.name.toLowerCase().includes(term) ||
        item.status.toLowerCase().includes(term) ||
        vendorName.toLowerCase().includes(term)
      );
    });
  }, [allItems, orderSearch, vendors]);

  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter(
      (c) =>
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }, [customers, customerSearch]);

  return (
    <div className="dashboard-shell">
      <header className="site-header">
        <div className="header-top-row">
          <div className="brand">
            <img src={logo} alt="PAK Hardware logo" className="brand-logo" />
            <span className="brand-name">PAK HARDWARE</span>
          </div>
          <div className="header-right">
            <span className="page-label">ADMIN PANEL</span>
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
                  setSelectedVendorId(null);
                }}
              >
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </aside>

        <main className="dashboard-main">
          {activeItem === "Overview" && (
            <>
              <div className="stat-grid">
                <div className="stat-card">
                  <span className="stat-label">Total Vendors</span>
                  <span className="stat-value green">{vendors.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Total Products</span>
                  <span className="stat-value orange">{products.length}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Total Revenue</span>
                  <span className="stat-value orange">{formatPrice(totalRevenue)}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Total Customers</span>
                  <span className="stat-value blue">{customers.length}</span>
                </div>
              </div>

              <div className="mid-grid">
                <div className="panel">
                  <h3>Revenue Trend (Last 12 Months)</h3>
                  <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="trend-chart"
                    preserveAspectRatio="none"
                  >
                    <polyline points={points} className="trend-line" />
                    {revenueTrend.map((v, i) => {
                      const max = Math.max(...revenueTrend, 1);
                      const min = Math.min(...revenueTrend, 0);
                      const range = max - min || 1;
                      const x = (i / Math.max(revenueTrend.length - 1, 1)) * width;
                      const y = height - ((v - min) / range) * height;
                      return <circle key={i} cx={x} cy={y} r="3" className="trend-dot" />;
                    })}
                  </svg>
                </div>

                <div className="panel">
                  <h3>Pending Vendor Approvals</h3>
                  {pendingVendors.length === 0 ? (
                    <p className="empty-state">No vendors waiting for approval.</p>
                  ) : (
                    <ul className="simple-list">
                      {pendingVendors.map((v) => (
                        <li key={v.id}>
                          <span>{v.business_name}</span>
                          <button className="btn btn-approve" onClick={() => onApproveVendor(v.id)}>
                            Approve
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="panel">
                <h3>Open Support Tickets</h3>
                {tickets.filter((t) => t.status === "Open").length === 0 ? (
                  <p className="empty-state">No open tickets.</p>
                ) : (
                  <div className="table-scroll">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Ticket</th>
                          <th>Customer</th>
                          <th>Subject</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets
                          .filter((t) => t.status === "Open")
                          .map((t) => (
                            <tr key={t.id}>
                              <td>{t.id}</td>
                              <td className="orange-text">{t.customerName}</td>
                              <td>{t.subject}</td>
                              <td>
                                <button
                                  className="btn btn-review"
                                  onClick={() => {
                                    setActiveItem("CMS");
                                    handleSelectTicket(t.id);
                                  }}
                                >
                                  Answer
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeItem === "Vendors" && !selectedVendor && (
            <div className="panel">
              <h3>All Vendors</h3>
              <div className="table-toolbar">
                <div className="table-search">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search vendors by name, city, email, or status..."
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                  />
                </div>
              </div>
              {filteredVendors.length === 0 ? (
                <p className="empty-state">No vendors match "{vendorSearch}".</p>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Business Name</th>
                        <th>City</th>
                        <th>Approval</th>
                        <th>Status</th>
                        <th>Products</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVendors.map((v) => (
                        <tr key={v.id}>
                          <td>{v.business_name}</td>
                          <td>{v.city}</td>
                          <td>
                            <span
                              className={
                                v.approval_status === "Approved"
                                  ? "status-green"
                                  : v.approval_status === "Rejected"
                                  ? "status-red"
                                  : "status-amber"
                              }
                            >
                              {v.approval_status}
                            </span>
                          </td>
                          <td>{v.status}</td>
                          <td>{vendorProductCount(v.id)}</td>
                          <td>
                            <button className="btn btn-outline btn-sm" onClick={() => setSelectedVendorId(v.id)}>
                              View
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

          {activeItem === "Vendors" && selectedVendor && (
            <div className="panel">
              <button className="back-link" onClick={() => setSelectedVendorId(null)}>
                <ArrowLeft size={15} /> Back to all vendors
              </button>

              <div className="panel-header-row">
                <h3>{selectedVendor.business_name}</h3>
                <span
                  className={
                    selectedVendor.approval_status === "Approved"
                      ? "status-green"
                      : selectedVendor.approval_status === "Rejected"
                      ? "status-red"
                      : "status-amber"
                  }
                >
                  {selectedVendor.approval_status}
                </span>
              </div>

              <div className="vendor-info-grid">
                <span>
                  <Mail size={13} /> {selectedVendor.business_email}
                </span>
                <span>
                  <Phone size={13} /> {selectedVendor.business_phone}
                </span>
                <span>
                  <MapPin size={13} /> {selectedVendor.business_address}, {selectedVendor.city},{" "}
                  {selectedVendor.country}
                </span>
                {selectedVendor.website_url && (
                  <span>
                    <Globe size={13} /> {selectedVendor.website_url}
                  </span>
                )}
              </div>
              {selectedVendor.description && <p className="empty-state">{selectedVendor.description}</p>}
              <p className="empty-state">
                CNIC: {selectedVendor.cnic_number || "—"} · Document:{" "}
                {selectedVendor.verification_document_url || "—"} · Verification:{" "}
                {selectedVendor.verification_status}
              </p>

              {selectedVendor.approval_status === "Pending" && (
                <div className="onboarding-nav">
                  <button className="btn btn-approve" onClick={() => onApproveVendor(selectedVendor.id)}>
                    <CheckCircle2 size={15} /> Approve Vendor
                  </button>
                  <button className="btn btn-outline" onClick={() => onRejectVendor(selectedVendor.id)}>
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              )}

              <div className="stat-grid" style={{ marginTop: 20 }}>
                <div className="stat-card">
                  <span className="stat-label">Products Bought (units)</span>
                  <span className="stat-value orange">
                    {products
                      .filter((p) => p.vendorId === selectedVendor.id)
                      .reduce((sum, p) => sum + salesCountFor(p.id), 0)}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Revenue</span>
                  <span className="stat-value blue">{formatPrice(vendorRevenue(selectedVendor.id))}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Total Products</span>
                  <span className="stat-value green">{vendorProductCount(selectedVendor.id)}</span>
                </div>
              </div>

              <h3 style={{ marginTop: 20 }}>Products with Zero Sales</h3>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Stock</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter((p) => p.vendorId === selectedVendor.id && salesCountFor(p.id) === 0)
                      .map((p) => (
                        <tr key={p.id}>
                          <td>{p.name}</td>
                          <td>{p.stock}</td>
                          <td>{formatPrice(p.price)}</td>
                        </tr>
                      ))}
                    {products.filter((p) => p.vendorId === selectedVendor.id && salesCountFor(p.id) === 0)
                      .length === 0 && (
                      <tr>
                        <td colSpan={3} className="empty-state">
                          Every product has sold at least once.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeItem === "Products" && (
            <div className="panel">
              <div className="panel-header-row">
                <h3>All Products</h3>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={zeroSalesOnly}
                    onChange={(e) => setZeroSalesOnly(e.target.checked)}
                  />
                  Show zero-sales products only
                </label>
              </div>
              <div className="table-toolbar">
                <div className="table-search">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search products by name, category, or vendor..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                </div>
                <div className="sort-select-wrap">
                  <label htmlFor="admin-product-sort">Sort by:</label>
                  <select
                    id="admin-product-sort"
                    className="sort-select"
                    value={productSort}
                    onChange={(e) => setProductSort(e.target.value)}
                  >
                    <option value="default">Units Sold: High to Low</option>
                    <option value="sales-asc">Units Sold: Low to High</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                  </select>
                </div>
              </div>
              <div className="table-scroll">
                <table className="data-table">
                                    <thead>
                    <tr>
                      <th>Product</th>
                      <th>Vendor</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Units Sold</th>
                      <th>Revenue</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProductsShown.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td className="orange-text">
                          {vendors.find((v) => v.id === p.vendorId)?.business_name || "—"}
                        </td>
                        <td>{p.category}</td>
                        <td>{formatPrice(p.price)}</td>
                        <td className={salesCountFor(p.id) === 0 ? "status-red" : "status-green"}>
                          {salesCountFor(p.id)}
                        </td>
                                                <td>{formatPrice(revenueFor(p.id))}</td>
                        <td>
                          <button className="btn btn-outline btn-sm" onClick={() => handleDeleteClick(p.id, p.name)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredProductsShown.length === 0 && (
                                            <tr>
                        <td colSpan={7} className="empty-state">
                          No products match this view.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeItem === "Orders" && (
            <div className="panel">
              <h3>All Orders</h3>
              <div className="table-toolbar">
                <div className="table-search">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search orders by ID, customer, product, vendor, or status..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
              </div>
              {filteredAllItems.length === 0 ? (
                <p className="empty-state">No orders match "{orderSearch}".</p>
              ) : (
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Vendor</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...filteredAllItems].reverse().map((item, i) => (
                        <tr key={`${item.orderId}-${item.productId}-${i}`}>
                          <td>{item.orderId}</td>
                          <td>{item.date}</td>
                          <td>{item.customerName}</td>
                          <td className="orange-text">
                            {vendors.find((v) => v.id === item.vendorId)?.business_name || "—"}
                          </td>
                          <td>{item.name}</td>
                          <td>{item.qty}</td>
                          <td
                            className={
                              item.status === "Delivered"
                                ? "status-green"
                                : item.status === "Terminated" || item.status === "Cancelled"
                                ? "status-red"
                                : "status-amber"
                            }
                          >
                            {item.status}
                          </td>
                          <td>
  <select
    className="status-select"
    value={item.status}
    onChange={(e) => onUpdateOrderStatus(item.orderId, item.productId, e.target.value)}
  >
    <option value="Pending">Pending</option>
    <option value="Processing">Processing</option>
    <option value="Shipped">Shipped</option>
    <option value="Delivered">Delivered</option>
    <option value="Cancelled">Cancelled</option>
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

          {activeItem === "Customers" && (
            <div className="panel">
              <h3>Customers</h3>
              <div className="table-toolbar">
                <div className="table-search">
                  <Search size={15} />
                  <input
                    type="text"
                    placeholder="Search customers by name or email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Orders</th>
                      <th>Items Bought</th>
                      <th>Total Spent</th>
                      <th>Wishlist</th>
                      <th>Vendor?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((c) => {
                      const custOrders = orders.filter((o) => o.customerEmail === c.email);
                      const custItems = custOrders.flatMap((o) => o.items);
                      const itemsBought = custItems.reduce((sum, i) => sum + i.qty, 0);
                      const totalSpent = custItems.reduce((sum, i) => sum + i.price * i.qty, 0);
                      return (
                        <tr key={c.id}>
                          <td>
                            {c.first_name} {c.last_name}
                          </td>
                          <td>{c.email}</td>
                          <td>{custOrders.length}</td>
                          <td>{itemsBought}</td>
                          <td>{formatPrice(totalSpent)}</td>
                          <td>{c.wishlist.length}</td>
                          <td>{c.is_vendor ? "Yes" : "No"}</td>
                        </tr>
                      );
                    })}
                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="empty-state">
                          {customerSearch ? `No customers match "${customerSearch}".` : "No customers yet."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeItem === "Categories" && (
            <div className="panel">
              <h3>Categories</h3>
              <form className="inline-form-row add-category-form" onSubmit={handleAddCategory}>
                <input
                  type="text"
                  placeholder="New category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  <Plus size={14} /> Add Category
                </button>
              </form>
              {categoryMsg && <p className="empty-state orange-text">{categoryMsg}</p>}
              <div className="tag-list">
                {categories.map((c) => (
                  <span key={c.id} className="tag">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeItem === "Reports" && (
            <>
              <div className="panel">
                <h3>Products — Most to Least Sold</h3>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Product</th>
                        <th>Vendor</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsSorted.map((p, i) => (
                        <tr key={p.id}>
                          <td>{i + 1}</td>
                          <td>{p.name}</td>
                          <td className="orange-text">
                            {vendors.find((v) => v.id === p.vendorId)?.business_name || "—"}
                          </td>
                          <td className={salesCountFor(p.id) === 0 ? "status-red" : "status-green"}>
                            {salesCountFor(p.id)}
                          </td>
                          <td>{formatPrice(revenueFor(p.id))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="panel">
                <h3>Vendors — Best to Worst Performing</h3>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Vendor</th>
                        <th>Approval</th>
                        <th>Products</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorsSorted.map((v, i) => (
                        <tr key={v.id}>
                          <td>{i + 1}</td>
                          <td>{v.business_name}</td>
                          <td
                            className={
                              v.approval_status === "Approved"
                                ? "status-green"
                                : v.approval_status === "Rejected"
                                ? "status-red"
                                : "status-amber"
                            }
                          >
                            {v.approval_status}
                          </td>
                          <td>{vendorProductCount(v.id)}</td>
                          <td className={vendorRevenue(v.id) === 0 ? "status-red" : ""}>
                            {formatPrice(vendorRevenue(v.id))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeItem === "CMS" && (
            <div className="panel">
              <h3>Customer Support Tickets</h3>
              <div className="cms-layout">
                <div className="table-scroll cms-ticket-list">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Ticket</th>
                        <th>Customer</th>
                        <th>Subject</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((t) => (
                        <tr
                          key={t.id}
                          className={`clickable-row ${selectedTicketId === t.id ? "selected-row" : ""}`}
                          onClick={() => handleSelectTicket(t.id)}
                        >
                          <td>{t.id}</td>
                          <td>{t.customerName}</td>
                          <td>{t.subject}</td>
                          <td className={t.status === "Open" ? "status-amber" : "status-green"}>{t.status}</td>
                        </tr>
                      ))}
                      {tickets.length === 0 && (
                        <tr>
                          <td colSpan={4} className="empty-state">
                            No tickets yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {selectedTicket ? (
                  <div className="cms-ticket-detail">
                    <h4>{selectedTicket.subject}</h4>
                    <p className="empty-state">
                      {selectedTicket.customerName} ({selectedTicket.customerEmail}) ·{" "}
                      {selectedTicket.createdAt}
                    </p>
                    <p>{selectedTicket.message}</p>
                    <form onSubmit={handleSendReply}>
                      <label className="auth-field">
                        <span>Reply</span>
                        <textarea
                          rows={4}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply..."
                        />
                      </label>
                      <button type="submit" className="btn btn-primary auth-submit">
                        Send Reply
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="cms-ticket-detail">
                    <p className="empty-state">Select a ticket to view and reply.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeItem === "Admins" && (
            <div className="panel">
              <h3>Admin Accounts</h3>
              <ul className="simple-list">
                {admins.map((a) => (
                  <li key={a.id}>
                    <span>
                      {a.first_name} {a.last_name} — {a.email}
                    </span>
                    {a.id === currentUser.id && <span className="orange-text">You</span>}
                  </li>
                ))}
              </ul>

              <h3 style={{ marginTop: 20 }}>Add New Admin</h3>
              <p className="empty-state">Only an existing admin can create another admin account.</p>
              <form className="inline-form" onSubmit={handleAddAdminSubmit}>
                <div className="inline-form-row">
                  <label className="auth-field">
                    <span>First name</span>
                    <input
                      type="text"
                      value={adminForm.first_name}
                      onChange={(e) => handleAdminChange("first_name", e.target.value)}
                    />
                    {adminErrors.first_name && <em className="auth-field-error">{adminErrors.first_name}</em>}
                  </label>
                  <label className="auth-field">
                    <span>Last name</span>
                    <input
                      type="text"
                      value={adminForm.last_name}
                      onChange={(e) => handleAdminChange("last_name", e.target.value)}
                    />
                    {adminErrors.last_name && <em className="auth-field-error">{adminErrors.last_name}</em>}
                  </label>
                </div>

                <label className="auth-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={adminForm.email}
                    onChange={(e) => handleAdminChange("email", e.target.value)}
                  />
                  {adminErrors.email && <em className="auth-field-error">{adminErrors.email}</em>}
                </label>

                <div className="inline-form-row">
                  <label className="auth-field">
                    <span>Password</span>
                    <input
                      type="password"
                      value={adminForm.password}
                      onChange={(e) => handleAdminChange("password", e.target.value)}
                    />
                    {adminErrors.password && <em className="auth-field-error">{adminErrors.password}</em>}
                  </label>
                  <label className="auth-field">
                    <span>Phone (optional)</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={11}
                      value={adminForm.phone}
                      onChange={(e) => handleAdminChange("phone", e.target.value)}
                    />
                    {adminErrors.phone && <em className="auth-field-error">{adminErrors.phone}</em>}
                  </label>
                </div>

                {adminMsg && <p className="empty-state orange-text">{adminMsg}</p>}
                <button type="submit" className="btn btn-primary auth-submit">
                  Create Admin
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      <footer className="site-footer">© PAK Hardware Marketplace | Admin Panel</footer>
    </div>
  );
}
