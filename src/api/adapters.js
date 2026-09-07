/* ============================================================
   ADAPTERS
   Converts real backend rows (snake_case Postgres columns) into
   the exact shapes the existing UI components already expect,
   so components don't need to be rewritten.
   ============================================================ */

export function adaptUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    first_name: u.first_name,
    last_name: u.last_name,
    email: u.email,
    role: (u.role || "customer").toLowerCase(),
    is_verified: !!u.is_verified,
    is_vendor: (u.role || "").toLowerCase() === "vendor",
    wishlist: u.wishlist || [],
  };
}

export function adaptVendor(v) {
  if (!v) return null;
  const status = (v.status || "").toLowerCase();
  const approval_status =
    v.approval_status || (status === "approved" ? "Approved" : status === "rejected" ? "Rejected" : "Pending");
  return {
    id: v.id,
    userId: v.user_id,
    business_name: v.business_name,
    business_email: v.business_email,
    business_phone: v.business_phone,
    business_address: v.business_address,
    city: v.city,
    country: v.country,
    description: v.description || "",
    logo_url: v.logo_url || "",
    website_url: v.website_url || "",
    commission_rate: v.commission_rate || 0,
    approval_status,
    status: status || "pending",
    is_active: v.is_active === true || v.is_active === "true" || approval_status === "Approved",
    verification_status: v.verification_status || "Not Submitted",
    pending_payout: v.pending_payout || 0,
    total_sales: v.total_sales || 0,
  };
}

export function adaptProduct(p) {
  if (!p) return null;
  const stock = Number(p.stock) || 0;
  return {
    id: p.id,
    vendorId: p.vendor_id,
    name: p.name,
    description: p.description || "",
    price: Number(p.price) || 0,
    stock,
    category: p.category_name || p.category || "",
    category_id: p.category_id,
    image_url: p.image_url || "",
    image: p.image_url || "",
        brand: p.brand || p.vendor_name || "",
    sku: p.sku || "",
    unit: p.unit || "piece",
    rating: Number(p.rating) || 0,
    reviewCount: Number(p.review_count) || 0,
    inStock: stock > 0,
    approval_status: p.approval_status || "pending",
    variants: [],
    reviews: [],
  };
}

export function adaptCategory(c) {
  if (!c) return null;
  return { id: c.id, name: c.name };
}

export function adaptOrder(o, items = []) {
  if (!o) return null;
  return {
    id: o.id,
    status: o.status,
    date: (o.created_at || "").slice(0, 10),
    total_amount: Number(o.total_amount) || 0,
    payment_method: o.payment_method,
    items: items.map((it) => ({
      productId: it.product_id,
      name: it.name,
      price: Number(it.price) || 0,
      qty: it.quantity,
      status: o.status,
    })),
  };
}
