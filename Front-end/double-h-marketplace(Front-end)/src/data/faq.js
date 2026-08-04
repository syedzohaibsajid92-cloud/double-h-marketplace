/* ============================================================
   CUSTOMER SERVICE — KEYWORD-MATCHING FAQ ENGINE
   Lightweight stand-in for a real AI/LLM backend. Each entry
   lists trigger keywords; the engine scores every entry by how
   many keywords appear in the shopper's message and returns the
   best match. Swap `answerFor()` for a real API call later
   without touching any component code.
   ============================================================ */

import {
  PackageSearch,
  Truck,
  RotateCcw,
  CreditCard,
  ShieldCheck,
  Store,
  UserCog,
  Percent,
} from "lucide-react";

export const QUICK_TOPICS = [
  { id: "track", label: "Track my order", icon: PackageSearch },
  { id: "shipping", label: "Shipping & delivery", icon: Truck },
  { id: "returns", label: "Returns & refunds", icon: RotateCcw },
  { id: "payment", label: "Payment methods", icon: CreditCard },
  { id: "warranty", label: "Warranty & genuine tools", icon: ShieldCheck },
  { id: "vendor", label: "Become a vendor", icon: Store },
  { id: "account", label: "Account & OTP", icon: UserCog },
  { id: "coupon", label: "Coupons & discounts", icon: Percent },
];

export const FAQ_ENTRIES = [
  {
    id: "track",
    keywords: ["track", "order status", "where is my order", "tracking", "shipment", "my order"],
    reply:
      "You can track any order from Cart & Checkout → your order confirmation, or under \"My Orders\" once you're logged in. Every order shows live status: Pending → Shipped → Delivered. Do you have an order number you'd like me to look up?",
  },
  {
    id: "shipping",
    keywords: ["shipping", "delivery", "deliver", "how long", "cost of shipping", "free shipping"],
    reply:
      "Shipping is free on orders over Rs. 5,000. Below that, a flat Rs. 250 shipping fee applies, plus 5% tax on the subtotal. Most orders across Pakistan arrive within 3–5 business days, and major cities often see next-day delivery.",
  },
  {
    id: "returns",
    keywords: ["return", "refund", "exchange", "cancel", "cancel order", "damaged", "wrong item"],
    reply:
      "Orders can be cancelled free of charge while they're still \"Pending\" — just open the order and select Cancel. For damaged or incorrect items after delivery, you're eligible for a return/refund within 7 days; I can start that request for you if you share the order number.",
  },
  {
    id: "payment",
    keywords: ["payment", "pay", "cod", "cash on delivery", "card", "stripe", "paypal", "bank transfer"],
    reply:
      "We accept Cash on Delivery (default), major debit/credit cards, PayPal, and direct bank transfer. You can choose your preferred method at checkout — COD is the most popular option for orders across Pakistan.",
  },
  {
    id: "warranty",
    keywords: ["warranty", "genuine", "authentic", "fake", "quality", "original"],
    reply:
      "Every listing on PAK Hardware is sold by verified vendors who go through our document + CNIC verification process. Power tools carry a standard manufacturer warranty — the exact duration is listed on each product page under \"Vendor\" details.",
  },
  {
    id: "vendor",
    keywords: ["vendor", "sell", "seller", "become a vendor", "register as vendor", "open a store"],
    reply:
      "To sell on PAK Hardware, register as a vendor from your account, then submit your CNIC and a verification document. Our admin team typically reviews new vendor applications within 1–2 business days.",
  },
  {
    id: "account",
    keywords: ["otp", "verify", "verification", "account", "login", "password", "forgot password", "reset password"],
    reply:
      "Account issues are usually quick to fix: verification codes are 6 digits and expire after 10 minutes — request a fresh one if yours timed out. For a locked-out account, use \"Forgot Password\" on the login screen to receive a reset code by email.",
  },
  {
    id: "coupon",
    keywords: ["coupon", "discount", "promo", "code", "sale", "offer"],
    reply:
      "Active coupon codes can be applied at checkout in the Order Summary box. Keep an eye on the homepage banner and category pages — vendor-specific promotions rotate regularly, especially around seasonal sales.",
  },
  {
    id: "human",
    keywords: ["human", "agent", "representative", "talk to someone", "real person", "call"],
    reply:
      "Of course — I can connect you with a human support agent. Our team is available Monday–Saturday, 9 AM–9 PM PKT. Would you like me to raise a support ticket for you now?",
  },
];

const FALLBACK_REPLY =
  "I didn't quite catch that. Try asking about order tracking, shipping, returns, payments, warranty, becoming a vendor, or your account — or tap a topic below.";

const GREETING_KEYWORDS = ["hi", "hello", "hey", "salam", "assalam"];

export function answerFor(rawMessage) {
  const message = rawMessage.toLowerCase().trim();

  if (GREETING_KEYWORDS.some((g) => message === g || message.startsWith(g + " "))) {
    return "Hi there! 👋 I'm the PAK Hardware assistant. Ask me about an order, shipping, returns, payments, or anything else — I'm here to help.";
  }

  let best = null;
  let bestScore = 0;

  for (const entry of FAQ_ENTRIES) {
    const score = entry.keywords.reduce(
      (acc, kw) => (message.includes(kw) ? acc + kw.split(" ").length : acc),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return best ? best.reply : FALLBACK_REPLY;
}

export function answerForTopic(topicId) {
  const entry = FAQ_ENTRIES.find((e) => e.id === topicId);
  return entry ? entry.reply : FALLBACK_REPLY;
}
