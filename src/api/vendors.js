import { api } from "./client";
import { adaptVendor } from "./adapters";

export async function registerVendor(payload) {
  const res = await api.post("/api/vendors/register", payload, { auth: true });
  return adaptVendor(res.vendor);
}

// Returns null (not an error) if the current user has no vendor account yet.
export async function fetchMyVendor() {
  try {
    const res = await api.get("/api/vendors/me", { auth: true });
    return adaptVendor(res);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

export async function fetchAllVendors() {
  const res = await api.get("/api/vendors", { auth: true });
  return (Array.isArray(res) ? res : []).map(adaptVendor);
}

export async function fetchVendorDashboard(vendorId) {
  const res = await api.get(`/api/vendor-dashboard/${vendorId}`, { auth: true });
  return res;
}

export async function updateVendorProfile(vendorId, updates) {
  const res = await api.put(`/api/vendors/${vendorId}`, updates, { auth: true });
  return adaptVendor(res.vendor);
}

export async function approveVendor(vendorId) {
  const res = await api.patch(`/api/admin/vendors/${vendorId}/approve`, {}, { auth: true });
  return res.vendor;
}

export async function rejectVendor(vendorId, reason = "Does not meet marketplace requirements") {
  const res = await api.patch(`/api/admin/vendors/${vendorId}/reject`, { reason }, { auth: true });
  return res.vendor;
}
