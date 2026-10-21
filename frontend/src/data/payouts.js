/* ============================================================
   MOCK PAYOUT STORE
   Previous payouts issued to a vendor, shown on the vendor
   dashboard's Payouts tab.
   ============================================================ */

export const SEED_PAYOUTS = [
  { id: "PYT-501", vendorId: 1, date: "2026-05-01", amount: 118400, method: "Bank Transfer", status: "Paid" },
  { id: "PYT-502", vendorId: 1, date: "2026-06-01", amount: 96250, method: "Bank Transfer", status: "Paid" },
  { id: "PYT-503", vendorId: 1, date: "2026-07-01", amount: 142900, method: "Bank Transfer", status: "Paid" },
  { id: "PYT-504", vendorId: 1, date: "2026-08-01", amount: 62100, method: "Bank Transfer", status: "Pending" },
];
