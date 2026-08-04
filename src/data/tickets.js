/* ============================================================
   MOCK SUPPORT TICKET STORE (CMS)
   Customers raise a problem from the Customer Service page;
   admins answer it from the Admin Panel -> CMS tab.
   status: "Open" | "Answered"
   ============================================================ */

let nextTicketId = 3;
export function generateTicketId() {
  return `TCK-${String(nextTicketId++).padStart(4, "0")}`;
}

export const SEED_TICKETS = [
  {
    id: "TCK-0001",
    customerId: 3,
    customerName: "Sara Ahmed",
    customerEmail: "customer@pakhardware.pk",
    subject: "Order arrived with a missing item",
    message: "My order ORD-1042 only had one wrench in the set instead of three. Can you send the rest?",
    status: "Open",
    reply: "",
    createdAt: "2026-07-30",
  },
  {
    id: "TCK-0002",
    customerId: 3,
    customerName: "Sara Ahmed",
    customerEmail: "customer@pakhardware.pk",
    subject: "Refund not received",
    message: "I cancelled an order two weeks ago and still haven't seen the refund in my account.",
    status: "Answered",
    reply: "Hi Sara, your refund of Rs. 2,200 was processed on 25th July and should reflect within 3-5 business days depending on your bank.",
    createdAt: "2026-07-18",
  },
];
