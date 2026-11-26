# Feature research: auto spares ecommerce in Kenya

Research performed on 2026-11-26 against live Kenyan and East African auto-parts
storefronts, POS/inventory vendors, and local payment integration case studies.

## What the Kenyan market expects

| Priority | Feature | Why it matters locally | Status in this repo |
| --- | --- | --- | --- |
| P0 | Vehicle fitment search (make, model, year, engine/VIN) | Wrong parts are the single biggest complaint; leading local shops lead with "tell us what you drive" and match by chassis/engine, not just model. | Backend fields planned (`make`, `model`, `year`, `engine`, `partNumber`, `condition`, `sku`); frontend fitment UI is a follow-up. |
| P0 | M-Pesa checkout (STK push, Paybill/Till) and cash on delivery | M-Pesa is the default payment rail; Cash on Delivery remains common for Nairobi orders. | Payment method + status captured on orders; provider interface stubbed with hooks for a later Daraja integration. |
| P0 | Real-time stock with reservation on checkout and low-stock alerts | Counter sales and online orders must share one stock truth; overselling damages trust. | Orders reserve stock in a DB transaction and restore it on cancellation; admin stock updates are in the API. |
| P0 | Order tracking and status workflow (Pending → Confirmed → Dispatched → Delivered/Cancelled) | Customers and workshops want delivery status without calling the shop. | Order statuses and public lookup by order number + phone are in the API. |
| P1 | WhatsApp/SMS notifications and order enquiries | Most Kenyan spare-part buying still starts on WhatsApp; automated receipts and dispatch alerts reduce staff load. | Enquiry endpoint exists on the web prototype; notification adapter is a documented follow-up. |
| P1 | Part condition labels (genuine, OEM, aftermarket, ex-Japan) and brand/SKU search | Buyers compare price against condition and part number before ordering. | Product schema includes condition, brand, SKU and OEM part number. |
| P1 | Staff roles with audit history | Shops need to control who changes prices/stock and see who did what. | Super admin, sales manager and sales person roles; only super admin can manage users/roles. |
| P1 | Countrywide delivery rules (Nairobi same-day, upcountry 1–3 days) and transparent delivery fee | Local sites advertise this explicitly at checkout. | Delivery method and fee are stored per order. |
| P2 | Trade/mechanic pricing, customer credit ledgers, dealer accounts | Garages and matatu operators are repeat buyers with different prices and credit terms. | Deferred: needs customer accounts and price tiers. |
| P2 | Returns/warranty window with manager approval | Typically 7 days on eligible parts, with returns re-stocked only after inspection. | Deferred: needs return records and approval workflow. |
| P2 | Supplier purchase orders, barcode labels, rack/bin locations and multi-branch stock | Valuable once the catalogue grows past a few thousand SKUs. | Deferred: needs warehouses and supplier records. |
| P2 | Digital receipts/invoices, sales reports and SEO-friendly fitment landing pages | Supports repeat buyers and organic discovery. | Deferred. |

## Sources

- AutoJiji Kenya — vehicle fitment, M-Pesa escrow, verified vendors: https://autojiji.co.ke/
- MK Auto Spares (Kirinyaga Road) — fitment by chassis, condition labels, M-Pesa/COD, 7-day returns: https://mkautospares.co.ke/about-us/
- Calhan Hansel Autotech — make/model/year fitment, same-day Nairobi and countrywide delivery: https://www.calhanautotechsolutions.co.ke/
- Garaji Marketplace — fitment search, order tracking, M-Pesa: https://garajisystems.co.ke/automotive-parts-marketplace-kenya
- Raven Tech Group (R4 Automotive) — Daraja STK push, idempotent callbacks, order state machine: https://www.raventechgroup.com/case-studies/r4-automotive
- Kredo — live storefront inventory sync and staff permissions for Kenyan auto parts dealers: https://trykredo.com/solutions/digital-storefront-and-catalog/auto-parts-dealer/kenya
- SaleTick — stock self-update, low-stock alerts, staff roles and WhatsApp ordering: https://saletick.net/in/kenya/auto-spare-parts
- Vega POS — M-Pesa integration, low-stock alerts, barcode/scanner support: https://vega.co.ke/blog/pos-system-for-spare-parts-shops-in-kenya/
- Cloudtrade — dispatch/delivery tracking, rack locations, returns approval: https://cloudtrade.pro/auto-spare-parts-pos-kenya/
- Sparix — live inventory sync and stock reservation for online orders: https://www.sparix.ai/auto-spare-parts-ecommerce-platform

## Recommended next steps after this phase

1. Wire the existing web app to the API with Zustand for cart/session state and TanStack Query for server state.
2. Add a fitment selector and SKU/part-number search to the storefront.
3. Implement the M-Pesa provider adapter with Daraja STK push, signed callbacks and idempotent payment events.
4. Add WhatsApp/SMS notification hooks and a PDF invoice endpoint.
5. Add dealer price tiers, returns, and supplier/purchase-order management as separate features.
