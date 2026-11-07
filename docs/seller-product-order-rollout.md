# Seller orders, product details and admin access — rollout notes

This change is included **only in existing draft PR #1**. No production merge or Firebase deployment is performed by a GitHub commit.

## Features

- Seller order management removes the Completed order value metric and the seller-only subtotal footnote.
- Seller orders show a bounded seller-scoped Firestore fallback when the primary newest-first query fails with `failed-precondition`. This is a *temporary* unindexed view ordered by document ID; it is not a reliable replacement for the newest-first query. On `permission-denied`, the view instead shows a specific access error and retry.
- Seller fulfillment adds `ready → out-for-delivery → completed`; `ready → completed` remains possible for pickup/other direct fulfillment. Buyers and admins see the same status.
- Marketplace product cards use all supplied image URLs (even legacy newline-separated data) and open a shareable `/product/seller%3A{id}` page. Legacy cards open `/product/{id}`.
- Product detail pages allow browsing photos and submitting optional personalization requests; each product's note travels with its cart entry into `customerNote` at checkout. **No pricing or payment changes are automatically applied**.
- Seller product creation/editing allows up to 10 HTTPS photos, optional weight/unit, minimum order quantity, customization prompts and handling notes.
- Admin seller management offers status filtering, manual trial expiry date, access-plan selector and day-based extension with confirmation.

## Firebase project changes required before going live

**Do not deploy directly to a production Firebase project without staging validation.** Reconcile existing indexes (the local file does not necessarily contain all index definitions present in Firebase).

1. Review `firestore.rules` in this PR. Its `validMarketplaceProduct` accepts validated optional weight, quantity, care and personalization fields.
2. Review the `seller_orders` rule that authorizes the `out-for-delivery` status transition only for the seller on their own order (or admin).
3. Verify the **Collection-scope** composite index **`seller_orders`: `sellerId` Ascending + `createdAt` Descending** is **Enabled**. This enables the primary seller incoming-order feed. The required definition is in `firestore.indexes.json`.
4. Verify other dashboard and account indexes listed in `docs/dashboard-rollout.md` are already Enabled.
5. Reconcile indexes, review rules in a staging Firebase project, and only then deploy to the intended environment:

```bash
firebase login
firebase firestore:indexes --project treatstory-online
# Reconcile remote indexes with firestore.indexes.json before proceeding!
firebase deploy --only firestore:rules,firestore:indexes --project treatstory-online
```

**Important:** Updating rules in the Firebase Console without the index will not make the newest-first seller order feed work. Conversely, enabling the index without deploying the new rules will cause `out-for-delivery` and the new optional product fields to be rejected.

## Validation

- Use a staging seller account with at least two orders, including a pending order and a ready order.
- Simulate missing composite index: seller should see a limited fallback view and its explicit warning, not a blank generic error.
- After enabling index: newest 20 orders ordered by `createdAt`, Load older orders via cursor, status changes to Out for delivery and Completed reflected for buyer.
- Verify seller may update only their own order; another seller and a guest must be denied by Firestore.
- Add two valid URLs on separate lines in a product; verify card arrows, thumbnail gallery, and details page. Confirm the item is shareable.
- Confirm weight and personalization save and reload, values appear on detail page, and minimum quantity is enforced at checkout and in rules.
- Confirm an admin can extend or set an expiry for any seller and non-admin cannot do so.
- Run `npm test`, `npm run typecheck`, `npm run build` and real mobile browser checks.

**Not included:** Secure stock reservation, payment settlement, actual carrier/tracking integrations, priced product variants or trusted delivery notifications. "Out for delivery" is a seller-updated fulfillment status, not verified courier tracking.
