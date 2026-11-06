# TreatStory dashboard release notes

Branch: `multi-vendor-foundation`

## Seller Studio
- `/seller/dashboard`: role-gated seller workspace with responsive sidebar, overview, listing search, product create/edit/delete, draft/published state, stock, preparation time, store description/phone/open status, and trial expiration.
- Approved seller login and account profile link to this workspace.
- Products are stored in `marketplace_products` (separate from legacy `products`).
- Seller writes are restricted in `firestore.rules` to their own UID and an active unexpired seller record. Client UI restrictions are not a security boundary.

## Super Admin
- `/admin`: redesigned responsive operations console with seller onboarding, seller access controls, cross-seller catalog moderation, live overview metrics, and legacy content management.
- Admin access continues to depend on `roles_admin/{uid}`.

## Release checklist (required before production)
1. Publish and test the updated `firestore.rules` in the **correct Firebase project**. Vercel deploys do not publish Firestore rules.
2. Run Firebase Emulator security tests: anonymous visitors cannot read drafts; seller A cannot read or edit seller B drafts or seller profile; expired/suspended sellers cannot write; non-admins cannot grant roles; admins can review applications and moderate catalog.
3. Run `npm install` and `npm run build` against this branch, fix any type/build errors, then deploy to a protected Vercel preview.
4. Verify sign-in, application approval, trial expiry, catalog CRUD, and Super Admin actions against a test Firebase project.
5. Integrate `marketplace_products` into public storefront pages before claiming seller listings are publicly shoppable. The legacy homepage still reads `products`.
6. Build server-validated checkout, seller suborders, customer ownership, notifications, messaging, and audit logging before enabling orders or payment.

**Not implemented yet:** seller order processing, customer checkout, public seller store pages, image uploads to Firebase Storage, revenue reporting, and automated subscription billing.

**Caution:** Existing legacy products remain admin-managed. Publishing a seller listing currently changes its catalog state but does not automatically place it on the existing public product grid.
