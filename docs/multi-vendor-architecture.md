# TreatStory multi-vendor foundation

This branch starts the migration from a single-store Firestore storefront to a three-role marketplace for home bakers, artists, and handmade creators.

## Core collections

| Collection | Document ID | Purpose | Writer |
| --- | --- | --- | --- |
| `seller_applications` | applicant auth UID | Registration and approval queue | Applicant creates; admin reviews |
| `sellers` | generated seller ID | Storefront identity, owner UID, status and access expiration | Admin controls lifecycle; owner edits permitted profile fields |
| `products` | generated product ID | Shared product discovery, with `sellerId` for seller-owned products | Approved, unexpired seller or admin |
| `checkout_orders` | generated checkout ID | One buyer-facing checkout containing seller-order references | Trusted backend only |
| `seller_orders` | generated order ID | One order per seller, created from a checkout | Trusted backend only |
| `conversations` | generated conversation ID | Buyer/seller participant identities | Trusted backend only initially |
| `audit_logs` | generated event ID | Administrative history | Trusted backend only |

## Rules and lifecycle

- Existing products without a `sellerId` remain legacy platform-owned products.
- Seller status and access expiration must be controlled by the super admin, never by seller-editable forms.
- Seller application creation must bind `ownerUid` to the authenticated UID. Approval creates a seller record.
- Seller access must check both active status and `accessEndsAt` against trusted server time.
- Product ownership must be immutable once created.
- Multi-seller checkout must re-read product prices and availability on a trusted backend, create seller orders atomically, and use an idempotency key.
- No online payment collection in the initial release; order payment method is `offline`.
- Never ship seller-specific queries or dashboards until Firestore security rules are deployed and tested with multiple accounts.
- Seller inbox, messages, and order state transitions require their own access-controlled server endpoints.
- Public storefront routes will use `/store/[slug]` and resolve to an immutable seller ID.

## Delivery order

1. Domain types and data migration design.
2. Firestore rules and rules emulator tests for cross-seller access.
3. Seller registration, approval and access management.
4. Seller profile, product CRUD and public storefront.
5. Customer accounts, secure offline checkout and seller-specific orders.
6. Seller order actions, messaging, notifications and analytics.

## Release gate

Before launch: test super admin, two separate sellers, and two buyers; confirm cross-tenant reads/writes fail, expired sellers cannot edit products, and checkout prices cannot be forged. Run `npm run typecheck` and `npm run build`, then deploy Firestore rules and indexes with the application.
