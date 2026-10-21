import { api } from "./client";
import { adaptOrder } from "./adapters";

// The backend requires a saved address before an order can be placed.
// For the demo flow (no address form in the UI yet) we reuse the
// user's first saved address, or silently create a basic one from
// their profile info the first time they check out.
async function ensureAddress(currentUser) {
  const existing = await api.get("/api/addresses", { auth: true });
  const addresses = Array.isArray(existing) ? existing : existing.addresses || [];
  if (addresses.length > 0) return addresses[0].id;

  const created = await api.post(
    "/api/addresses",
    {
      full_name: `${currentUser.first_name} ${currentUser.last_name}`.trim(),
      phone: (currentUser.phone || "03000000000").replace(/\D/g, ""),
      address_line1: "Not specified",
      city: "Lahore",
      state: "Punjab",
      postal_code: "54000",
      country: "Pakistan",
    },
    { auth: true }
  );
  const address = created.address || created;
  return address.id;
}

// Backend orders are built from a server-side cart table, so we sync
// the locally-held cart into it before placing the order.
export async function placeOrder(currentUser, cartLines) {
  for (const line of cartLines) {
    await api.post("/api/cart", { product_id: line.productId, quantity: line.qty }, { auth: true });
  }

  const address_id = await ensureAddress(currentUser);

  const res = await api.post("/api/orders", { address_id, payment_method: "COD" }, { auth: true });
  return res.order;
}

export async function fetchMyOrders() {
  const res = await api.get("/api/orders/user", { auth: true });
  const orders = Array.isArray(res) ? res : [];
  const detailed = await Promise.all(
    orders.map(async (o) => {
      const detail = await api.get(`/api/orders/details/${o.id}`, { auth: true });
      return adaptOrder(detail.order, detail.items);
    })
  );
  return detailed;
}

export async function fetchAllOrders() {
  const res = await api.get("/api/orders/admin/all", { auth: true });
  return Array.isArray(res) ? res : [];
}

export async function updateOrderStatus(orderId, status) {
  const res = await api.put(`/api/orders/status/${orderId}`, { status }, { auth: true });
  return res.order;
}
