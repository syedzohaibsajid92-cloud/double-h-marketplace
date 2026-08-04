/* ============================================================
   MOCK ORDER STORE
   Each order carries the buyer's name/email and a list of line
   items. Every item carries its own vendorId + status, since one
   order can contain products from several vendors and each vendor
   only manages the status of their own line items.

   item.status: "Processing" | "In Production" | "In Delivery" |
                "Delivered" | "Terminated" | "Cancelled"
   ============================================================ */

export const ORDER_STATUSES = [
  "Processing",
  "In Production",
  "In Delivery",
  "Delivered",
  "Terminated",
  "Cancelled",
];

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

let nextOrderId = 1043;
export function generateOrderId() {
  return `ORD-${nextOrderId++}`;
}

/* One order per month across the previous year (2025) so the vendor
   Sales Report tab has a real Jan..Dec trend to render, plus a
   handful of recent orders in the current year for the live
   dashboards/order queues. All line items belong to vendorId 1
   (the seeded PAK Hardware Official Store) since that's the only
   pre-approved vendor; newly onboarded vendors start with zero. */
export const SEED_ORDERS = [
  { id: "ORD-1001", customerName: "Hassan Iqbal", customerEmail: "hassan.iqbal@example.com", date: "2025-01-14", items: [{ productId: 3, vendorId: 1, name: "PAK Hardware Claw Hammer - 16oz", price: 2200, qty: 2, status: "Delivered" }] },
  { id: "ORD-1002", customerName: "Zainab Malik", customerEmail: "zainab.malik@example.com", date: "2025-02-08", items: [{ productId: 1, vendorId: 1, name: "PAK Hardware Impact Drill Machine - 13mm", price: 12500, qty: 1, status: "Delivered" }] },
  { id: "ORD-1003", customerName: "Usman Tariq", customerEmail: "usman.tariq@example.com", date: "2025-02-22", items: [{ productId: 6, vendorId: 1, name: "PAK Hardware Safety Goggles - Anti Fog", price: 750, qty: 4, status: "Delivered" }] },
  { id: "ORD-1004", customerName: "Ayesha Noor", customerEmail: "ayesha.noor@example.com", date: "2025-03-11", items: [{ productId: 9, vendorId: 1, name: "PAK Hardware Air Compressor - 24L", price: 43900, qty: 1, status: "Delivered" }] },
  { id: "ORD-1005", customerName: "Bilal Aslam", customerEmail: "bilal.aslam@example.com", date: "2025-03-27", items: [{ productId: 4, vendorId: 1, name: "PAK Hardware Adjustable Wrench Set - 3pc", price: 2530, qty: 3, status: "Delivered" }] },
  { id: "ORD-1006", customerName: "Sana Yousaf", customerEmail: "sana.yousaf@example.com", date: "2025-04-05", items: [{ productId: 2, vendorId: 1, name: "PAK Hardware Cordless Angle Grinder - 4inch", price: 6800, qty: 2, status: "Delivered" }] },
  { id: "ORD-1007", customerName: "Kamran Sheikh", customerEmail: "kamran.sheikh@example.com", date: "2025-04-19", items: [{ productId: 11, vendorId: 1, name: "PAK Hardware Brass Tap Set", price: 3200, qty: 2, status: "Delivered" }] },
  { id: "ORD-1008", customerName: "Mariam Farooq", customerEmail: "mariam.farooq@example.com", date: "2025-05-09", items: [{ productId: 7, vendorId: 1, name: "PAK Hardware Work Gloves - Reinforced Palm", price: 950, qty: 5, status: "Delivered" }] },
  { id: "ORD-1009", customerName: "Adeel Raza", customerEmail: "adeel.raza@example.com", date: "2025-05-30", items: [{ productId: 8, vendorId: 1, name: "PAK Hardware Bench Grinder - 6inch", price: 15900, qty: 1, status: "Delivered" }] },
  { id: "ORD-1010", customerName: "Nida Hameed", customerEmail: "nida.hameed@example.com", date: "2025-06-12", items: [{ productId: 10, vendorId: 1, name: "PAK Hardware PVC Pipe Cutter", price: 1650, qty: 3, status: "Delivered" }] },
  { id: "ORD-1011", customerName: "Faisal Chaudhry", customerEmail: "faisal.chaudhry@example.com", date: "2025-06-25", items: [{ productId: 1, vendorId: 1, name: "PAK Hardware Impact Drill Machine - 13mm", price: 12500, qty: 2, status: "Delivered" }] },
  { id: "ORD-1012", customerName: "Rabia Anwar", customerEmail: "rabia.anwar@example.com", date: "2025-07-03", items: [{ productId: 12, vendorId: 1, name: "PAK Hardware Self Tapping Screw Pack", price: 550, qty: 8, status: "Delivered" }] },
  { id: "ORD-1013", customerName: "Waqas Ahmed", customerEmail: "waqas.ahmed@example.com", date: "2025-07-21", items: [{ productId: 3, vendorId: 1, name: "PAK Hardware Claw Hammer - 16oz", price: 2200, qty: 1, status: "Delivered" }] },
  { id: "ORD-1014", customerName: "Hira Saeed", customerEmail: "hira.saeed@example.com", date: "2025-08-02", items: [{ productId: 6, vendorId: 1, name: "PAK Hardware Safety Goggles - Anti Fog", price: 750, qty: 6, status: "Delivered" }] },
  { id: "ORD-1015", customerName: "Omer Khalid", customerEmail: "omer.khalid@example.com", date: "2025-08-19", items: [{ productId: 9, vendorId: 1, name: "PAK Hardware Air Compressor - 24L", price: 43900, qty: 1, status: "Delivered" }] },
  { id: "ORD-1016", customerName: "Sadia Bashir", customerEmail: "sadia.bashir@example.com", date: "2025-09-06", items: [{ productId: 4, vendorId: 1, name: "PAK Hardware Adjustable Wrench Set - 3pc", price: 2530, qty: 4, status: "Delivered" }] },
  { id: "ORD-1017", customerName: "Tariq Mehmood", customerEmail: "tariq.mehmood@example.com", date: "2025-09-24", items: [{ productId: 2, vendorId: 1, name: "PAK Hardware Cordless Angle Grinder - 4inch", price: 6800, qty: 1, status: "Delivered" }] },
  { id: "ORD-1018", customerName: "Iqra Siddiqui", customerEmail: "iqra.siddiqui@example.com", date: "2025-10-08", items: [{ productId: 7, vendorId: 1, name: "PAK Hardware Work Gloves - Reinforced Palm", price: 950, qty: 3, status: "Delivered" }] },
  { id: "ORD-1019", customerName: "Zeeshan Butt", customerEmail: "zeeshan.butt@example.com", date: "2025-10-29", items: [{ productId: 11, vendorId: 1, name: "PAK Hardware Brass Tap Set", price: 3200, qty: 1, status: "Delivered" }] },
  { id: "ORD-1020", customerName: "Amna Riaz", customerEmail: "amna.riaz@example.com", date: "2025-11-11", items: [{ productId: 1, vendorId: 1, name: "PAK Hardware Impact Drill Machine - 13mm", price: 12500, qty: 3, status: "Delivered" }] },
  { id: "ORD-1021", customerName: "Junaid Latif", customerEmail: "junaid.latif@example.com", date: "2025-11-28", items: [{ productId: 10, vendorId: 1, name: "PAK Hardware PVC Pipe Cutter", price: 1650, qty: 2, status: "Delivered" }] },
  { id: "ORD-1022", customerName: "Mahnoor Aziz", customerEmail: "mahnoor.aziz@example.com", date: "2025-12-15", items: [{ productId: 8, vendorId: 1, name: "PAK Hardware Bench Grinder - 6inch", price: 15900, qty: 2, status: "Delivered" }] },
  { id: "ORD-1023", customerName: "Salman Qureshi", customerEmail: "salman.qureshi@example.com", date: "2025-12-30", items: [{ productId: 12, vendorId: 1, name: "PAK Hardware Self Tapping Screw Pack", price: 550, qty: 10, status: "Delivered" }] },

  { id: "ORD-1040", customerName: "Sara Ahmed", customerEmail: "customer@pakhardware.pk", date: "2026-07-10", items: [{ productId: 1, vendorId: 1, name: "PAK Hardware Impact Drill Machine - 13mm", price: 12500, qty: 1, status: "Delivered" }] },
  { id: "ORD-1041", customerName: "Hamza Farid", customerEmail: "hamza.farid@example.com", date: "2026-07-22", items: [{ productId: 2, vendorId: 1, name: "PAK Hardware Cordless Angle Grinder - 4inch", price: 6800, qty: 1, status: "Processing" }, { productId: 6, vendorId: 1, name: "PAK Hardware Safety Goggles - Anti Fog", price: 750, qty: 2, status: "Processing" }] },
  { id: "ORD-1042", customerName: "Sara Ahmed", customerEmail: "customer@pakhardware.pk", date: "2026-07-29", items: [{ productId: 4, vendorId: 1, name: "PAK Hardware Adjustable Wrench Set - 3pc", price: 2530, qty: 1, status: "In Production" }] },
];

export function orderTotal(order) {
  return order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}
