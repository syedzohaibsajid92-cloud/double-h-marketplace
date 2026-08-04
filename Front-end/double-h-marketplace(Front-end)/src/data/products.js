/* ============================================================
   DUMMY DATA
   In a real app this would come from an API. Every storefront
   component (search, category filters, grids, product detail,
   cart) reads from this single array.

   vendorId links each product to a row in data/vendors.js — the
   storefront only ever shows products whose vendor is approved
   & active (see App.jsx's visibleProducts).
   ============================================================ */

import { SEED_CATEGORIES } from "./categories";

export const CATEGORIES = SEED_CATEGORIES.map((c) => c.name);

const VARIANT_COLORS = ["Black", "Yellow", "Grey"];

export const SEED_PRODUCTS = [
  {
    id: 1,
    vendorId: 1,
    name: "PAK Hardware Impact Drill Machine - 13mm",
    category: "Power Tools",
    brand: "PAK Hardware Official Store",
    description:
      "Heavy-duty 13mm impact drill with variable speed trigger, reversible motor, and a side-assist handle for controlled drilling into masonry, wood, and metal.",
    price: 12500,
    stock: 42,
    rating: 4.5,
    reviewCount: 128,
    sku: "DH-IMP-13-BLK",
    inStock: true,
    variants: VARIANT_COLORS,
    reviews: [
      { stars: 5, text: "Excellent build quality, fast delivery to Islamabad." },
      { stars: 4, text: "Good torque, works great for home projects." },
    ],
  },
  {
    id: 2,
    vendorId: 1,
    name: "PAK Hardware Cordless Angle Grinder - 4inch",
    category: "Power Tools",
    brand: "PAK Hardware Official Store",
    description:
      "Compact 4-inch cordless angle grinder built for cutting, grinding, and polishing metal or tile on the go, with a brushless motor for longer runtime.",
    price: 6800,
    stock: 18,
    rating: 4.2,
    reviewCount: 64,
    sku: "DH-GRD-04",
    inStock: true,
    variants: VARIANT_COLORS,
    reviews: [
      { stars: 4, text: "Lightweight and easy to handle." },
      { stars: 4, text: "Battery life could be better but does the job." },
    ],
  },
  {
    id: 3,
    vendorId: 1,
    name: "PAK Hardware Claw Hammer - 16oz",
    category: "Hand Tools",
    brand: "PAK Hardware Official Store",
    description:
      "Forged steel 16oz claw hammer with a shock-absorbing rubber grip, balanced for driving and pulling nails all day without wrist fatigue.",
    price: 2200,
    stock: 0,
    rating: 4.7,
    reviewCount: 210,
    sku: "DH-HMR-16-BLK",
    inStock: true,
    variants: VARIANT_COLORS,
    reviews: [
      { stars: 5, text: "Solid grip, well balanced." },
      { stars: 5, text: "Great value for the price." },
    ],
  },
  {
    id: 4,
    vendorId: 1,
    name: "PAK Hardware Adjustable Wrench Set - 3pc",
    category: "Hand Tools",
    brand: "PAK Hardware Official Store",
    description:
      "3-piece adjustable wrench set (6\", 8\", 10\") with chrome-vanadium jaws and a corrosion-resistant finish for a lifetime of workshop use.",
    price: 2530,
    stock: 61,
    rating: 4.4,
    reviewCount: 87,
    sku: "DH-WRN-03-GRY",
    inStock: true,
    variants: VARIANT_COLORS,
    reviews: [
      { stars: 4, text: "Sturdy and precise fit." },
      { stars: 5, text: "Exactly what I needed for the workshop." },
    ],
  },
  {
    id: 5,
    vendorId: 1,
    name: "PAK Hardware Hex Bolt Assortment Kit (100)",
    category: "Fasteners",
    brand: "PAK Hardware Official Store",
    description:
      "100-piece hex bolt, nut, and washer assortment covering the most common sizes, organized in a labeled storage case.",
    price: 1200,
    stock: 0,
    rating: 4.1,
    reviewCount: 45,
    sku: "DH-BLT-100",
    inStock: false,
    variants: VARIANT_COLORS,
    reviews: [
      { stars: 4, text: "Good variety of sizes in one box." },
      { stars: 4, text: "Handy for quick repairs." },
    ],
  },
  {
    id: 6,
    vendorId: 1,
    name: "PAK Hardware Safety Goggles - Anti Fog",
    category: "Safety Gear",
    brand: "PAK Hardware Official Store",
    description:
      "Anti-fog, scratch-resistant safety goggles with a wraparound seal for full eye protection during grinding, cutting, or chemical handling.",
    price: 750,
    stock: 96,
    rating: 4.6,
    reviewCount: 132,
    sku: "DH-SFT-GOG-BLK",
    inStock: true,
    variants: VARIANT_COLORS,
    reviews: [
      { stars: 5, text: "Comfortable fit, no fogging even after hours." },
      { stars: 4, text: "Good seal around the eyes." },
    ],
  },
  {
    id: 7,
    vendorId: 1,
    name: "PAK Hardware Work Gloves - Reinforced Palm",
    category: "Safety Gear",
    brand: "PAK Hardware Official Store",
    description:
      "Breathable work gloves with a reinforced synthetic-leather palm and knuckle protection, built for daily handling of tools and materials.",
    price: 950,
    stock: 54,
    rating: 4.3,
    reviewCount: 76,
    sku: "DH-SFT-GLV-GRY",
    inStock: true,
    variants: VARIANT_COLORS,
    reviews: [
      { stars: 4, text: "Tough and breathable." },
      { stars: 4, text: "Fits true to size." },
    ],
  },
  {
    id: 8,
    vendorId: 1,
    name: "PAK Hardware Bench Grinder - 6inch",
    category: "Machinery",
    brand: "PAK Hardware Official Store",
    description:
      "6-inch dual-wheel bench grinder with a powerful induction motor, adjustable tool rests, and eye shields for sharpening and shaping metal.",
    price: 15900,
    stock: 12,
    rating: 4.0,
    reviewCount: 39,
    sku: "DH-MCH-BGR-BLK",
    inStock: true,
    variants: VARIANT_COLORS,
    reviews: [
      { stars: 4, text: "Powerful motor, runs smoothly." },
      { stars: 3, text: "A bit noisy but performs well." },
    ],
  },
  {
    id: 9,
    vendorId: 1,
    name: "PAK Hardware Air Compressor - 24L",
    category: "Machinery",
    brand: "PAK Hardware Official Store",
    description:
      "24-litre portable air compressor with an oil-free pump, ideal for inflating tyres, running pneumatic tools, and spray-painting jobs.",
    price: 43900,
    stock: 7,
    rating: 4.5,
    reviewCount: 58,
    sku: "DH-MCH-CMP-YLW",
    inStock: true,
    variants: VARIANT_COLORS,
    reviews: [
      { stars: 5, text: "Reliable pressure, great for the garage." },
      { stars: 4, text: "Slightly heavy but built to last." },
    ],
  },
  {
    id: 10,
    vendorId: 1,
    name: "PAK Hardware PVC Pipe Cutter",
    category: "Plumbing",
    brand: "PAK Hardware Official Store",
    description:
      "Ratcheting PVC pipe cutter for clean, square cuts up to 1.5-inch diameter pipe, with a self-sharpening blade and safety lock.",
    price: 1650,
    stock: 33,
    rating: 4.2,
    reviewCount: 51,
    sku: "DH-PLM-CUT-BLK",
    inStock: true,
    variants: VARIANT_COLORS,
    reviews: [
      { stars: 4, text: "Clean cuts every time." },
      { stars: 4, text: "Compact and easy to store." },
    ],
  },
  {
    id: 11,
    vendorId: 1,
    name: "PAK Hardware Brass Tap Set",
    category: "Plumbing",
    brand: "PAK Hardware Official Store",
    description:
      "Solid brass tap set with a chrome finish and ceramic disc cartridges for a drip-free seal that lasts for years.",
    price: 3200,
    stock: 21,
    rating: 4.4,
    reviewCount: 33,
    sku: "DH-PLM-TAP-GRY",
    inStock: true,
    variants: VARIANT_COLORS,
    reviews: [
      { stars: 5, text: "No leaks after a month of use." },
      { stars: 4, text: "Good finish and weight." },
    ],
  },
  {
    id: 12,
    vendorId: 1,
    name: "PAK Hardware Self Tapping Screw Pack",
    category: "Fasteners",
    brand: "PAK Hardware Official Store",
    description:
      "Zinc-plated self-tapping screw pack in mixed sizes, sharp-threaded for drilling directly into sheet metal, wood, and plastic.",
    price: 550,
    stock: 140,
    rating: 4.0,
    reviewCount: 22,
    sku: "DH-FST-SCR-BLK",
    inStock: true,
    variants: VARIANT_COLORS,
    reviews: [
      { stars: 4, text: "Sharp threads, drive in easily." },
      { stars: 3, text: "Wish the pack had more pieces." },
    ],
  },
];

export function formatPrice(n) {
  return `Rs. ${Number(n || 0).toLocaleString("en-PK")}`;
}
