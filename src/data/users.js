/* ============================================================
   MOCK USER STORE
   Stands in for the real /api/auth backend. Field names match
   the API Payload Reference exactly (first_name, last_name,
   email, password, phone) so this can be swapped for real
   fetch() calls later without changing the Auth component's
   form shape.

   is_vendor: true once a customer has completed vendor
   registration + verification submission (see data/vendors.js
   for the actual vendor record, keyed by userId).
   wishlist: array of product ids the user has saved.
   ============================================================ */

export const SEED_USERS = [
  {
    id: 1,
    first_name: "Ayesha",
    last_name: "Raza",
    email: "admin@pakhardware.pk",
    password: "Admin123",
    phone: "03001112222",
    role: "admin",
    is_verified: true,
    is_vendor: false,
    wishlist: [],
  },
  {
    id: 2,
    first_name: "Bilal",
    last_name: "Sheikh",
    email: "vendor@pakhardware.pk",
    password: "Vendor123",
    phone: "03003334444",
    role: "customer",
    is_verified: true,
    is_vendor: true,
    wishlist: [3, 6],
  },
  {
    id: 3,
    first_name: "Sara",
    last_name: "Ahmed",
    email: "customer@pakhardware.pk",
    password: "Customer123",
    phone: "03005556666",
    role: "customer",
    is_verified: true,
    is_vendor: false,
    wishlist: [1],
  },
];

export const DEMO_LOGINS = [
  { role: "customer", label: "Customer demo", email: "customer@pakhardware.pk", password: "Customer123" },
  { role: "vendor", label: "Vendor demo", email: "vendor@pakhardware.pk", password: "Vendor123" },
  { role: "admin", label: "Admin demo", email: "admin@pakhardware.pk", password: "Admin123" },
];

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* Name fields: letters only (plus common Urdu-name punctuation like
   apostrophes/hyphens), no digits, no spaces — each field is a single
   token (first name / last name are already split into two inputs). */
export function isValidNameToken(value) {
  return /^[A-Za-z][A-Za-z'-]*$/.test(value.trim());
}

/* Strip anything that isn't a letter as the user types, so it's
   impossible to enter a space or digit in the first place. */
export function sanitizeNameInput(value) {
  return value.replace(/[^A-Za-z'-]/g, "");
}

/* Pakistani mobile format: 11 digits, starting with 0 (e.g. 03001234567). */
export function isValidPhone(value) {
  return /^0\d{10}$/.test(value.trim());
}

/* Strip anything that isn't a digit and cap at 11 characters. */
export function sanitizePhoneInput(value) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function hasAdminAccount(users) {
  return users.some((u) => u.role === "admin");
}

/* A user has vendor-dashboard access once they've completed vendor
   onboarding (is_vendor) — the legacy seed vendor also carries
   role "vendor" but is otherwise a normal customer account too. */
export function hasVendorAccess(user) {
  return !!user && (user.role === "vendor" || user.is_vendor);
}
