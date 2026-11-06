# TreatStory offline order workflow — release checklist

## Implemented
- Authenticated customers can submit offline order requests from the full-screen bag.
- Each seller listing creates a separate order document in `seller_orders`. A multi-item bag is **not atomic**: some requests may succeed before another fails; successful items are removed from the bag and reported.
- Firestore rules verify the seller, published product, current price, quantity, active seller membership and accepting-orders status at write time.
- Customers can view their orders at `/orders`; sellers can view their own orders and advance status; Super Admin can view all orders and order-value totals.
- No payment processing or online collection is implemented. Figures are order value, **not revenue**.
- Legacy catalog items continue using their existing WhatsApp enquiry workflow.

## Mandatory release steps
1. Publish the **new** `firestore.rules` from this branch in the same Firebase project as Vercel.
2. Run `npm run typecheck` and `npm run build` and fix errors before deployment. These have not been run in this environment.
3. Test Firebase Rules Emulator with anonymous users, customers, sellers A/B, suspended sellers and admin. Ensure cross-seller reads and edits are denied, prices cannot be spoofed, and transitions cannot skip steps.
4. Test Firestore query indexes and real-time order subscriptions.
5. Confirm product listings have `showPrice: true`, `status: 'published'`, valid seller access, and `isOpen: true`.
6. Add server-side idempotency, atomic multi-item checkout, inventory reservation, payment reconciliation, notifications, delivery charges and refunds before enabling paid checkout.
7. Confirm business compliance for collecting customer contact/address data and define retention/deletion policies.

## Limitations
- One order per product line; no unified checkout record yet.
- No shipping integrations, payment provider, automatic stock deduction or refunds.
- Admin order value metrics are not verified payment analytics.
- Client-side ordering should be supplemented with server-side anti-spam/rate limiting before public launch.
