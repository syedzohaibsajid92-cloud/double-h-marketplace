/* ============================================================
   MOCK VENDOR STORE
   Stands in for the real /api/vendors backend. Field names match
   the Vendor Module API Payload Reference:
   business_name, business_email, business_phone, business_address,
   city, country, description, logo_url, website_url,
   cnic_number, verification_document_url.

   approval_status: "Pending" | "Approved" | "Rejected"
   status:          "pending" | "active" | "rejected"
   is_active:       whether the vendor's products are allowed to
                     appear on the public storefront.
   verification_status: "Not Submitted" | "Pending" | "Verified" | "Rejected"
   ============================================================ */

export const CITIES = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
];

export const COUNTRIES = ["Pakistan", "United Arab Emirates", "Saudi Arabia", "United Kingdom", "United States"];

export const SEED_VENDORS = [
  {
    id: 1,
    userId: 2,
    business_name: "PAK Hardware Official Store",
    business_email: "vendor@pakhardware.pk",
    business_phone: "03003334444",
    business_address: "Plot 14, Industrial Estate",
    city: "Lahore",
    country: "Pakistan",
    description:
      "Official PAK Hardware storefront selling power tools, hand tools, fasteners, safety gear, machinery, and plumbing supplies.",
    logo_url: "",
    website_url: "https://pakhardware.pk",
    approval_status: "Approved",
    status: "active",
    is_active: true,
    cnic_number: "35202-1234567-1",
    verification_document_url: "cnic-front-back.pdf",
    verification_status: "Verified",
    created_at: "2025-11-02",
  },
];

export const EMPTY_VENDOR_FORM = {
  business_name: "",
  business_email: "",
  business_phone: "",
  business_address: "",
  city: "",
  country: "Pakistan",
  description: "",
  logo_url: "",
  website_url: "",
};

export const EMPTY_VERIFICATION_FORM = {
  cnic_number: "",
  verification_document_url: "",
};

/* Pakistani CNIC format: 12345-1234567-1 */
export function isValidCnic(value) {
  return /^\d{5}-\d{7}-\d$/.test(value.trim());
}

export function sanitizeCnicInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  const part1 = digits.slice(0, 5);
  const part2 = digits.slice(5, 12);
  const part3 = digits.slice(12, 13);
  return [part1, part2, part3].filter(Boolean).join("-");
}
