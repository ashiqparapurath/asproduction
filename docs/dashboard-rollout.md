# Dashboard rollout checklist (draft PR)

This branch changes the **client experience and Firestore query patterns**, not payment or fulfillment authority. Do not merge or publish the branch until the checks below pass.

## Firebase deployment required

The repository now contains:

- `firestore.rules` – allows signed-in users to query `sellers/{theirUid}` even if that document is missing, without granting seller write permissions.
- `firestore.indexes.json` – composite indexes used by the newest-first order feeds, admin counts and seller action queues.
- `firebase.json` – Firestore deployment configuration.

Before deploying indexes, run `firebase firestore:indexes --project treatstory-online` and compare the currently deployed definitions with `firestore.indexes.json`. **Preserve any existing indexes and field overrides** that are not included in this draft file. Review any CLI deletion prompts; do not approve removal of unrelated existing indexes. Firebase notes that console-managed index changes should be reconciled with the local configuration before deployment.

After reviewing the diff and merging any existing index definitions, deploy to the **intended Firebase project**:

```bash
firebase login
firebase deploy --only firestore:rules,firestore:indexes --project treatstory-online
```

**Do not blindly deploy rules to the wrong environment.** Firestore indexes build asynchronously. A dashboard query may initially report a missing index; wait for the index to become ready in Firebase Console.

## Resolving `RunAggregationQuery failed-precondition` errors

If the admin dashboard logs `failed-precondition` (HTTP 400) for the following count queries, **do not loosen the Firestore security rules**. These require composite indexes in the Firebase project used by the running app:

| Collection | Query | Required composite index (Collection scope) |
| --- | --- | --- |
| `sellers` | `status == "active"` and `accessEndsAt > now` | `status` ascending, `accessEndsAt` ascending |
| `seller_orders` | `status == "pending"` and `createdAt <= yesterday` | `status` ascending, `createdAt` ascending |

Both definitions are already in `firestore.indexes.json`. You must still create them in Firebase and wait until their state is **Enabled**. In Firebase Console, open **Firestore Database → Indexes → Add index** and create the above index definitions for project `treatstory-online`.

Alternatively, from this draft branch's local checkout:

```bash
firebase login
firebase firestore:indexes --project treatstory-online
# Reconcile the output with firestore.indexes.json before deploying.
firebase deploy --only firestore:indexes --project treatstory-online
```

Do not deploy an incomplete local indexes file if Firebase already has other indexes. It may propose deleting indexes omitted from the file.

This is separate from `firestore.rules` deployment; permission errors generally return `permission-denied`, not these index preconditions.

## Buyer account: recent orders unavailable

If the account screen shows **Recent orders are temporarily unavailable** or the `/orders` page cannot load the buyer feed, inspect the Firestore listener's real error code. The shared buyer query is:

```ts
query(
  collection(db, 'seller_orders'),
  where('buyerUid', '==', auth.currentUser.uid),
  orderBy('createdAt', 'desc'),
  limit(20)
)
```

A **Collection-scope** composite index is required:

- Collection ID: `seller_orders`
- `buyerUid`: **Ascending**
- `createdAt`: **Descending**

This composite index is already declared in `firestore.indexes.json`; it must be deployed and **Enabled** in the Firebase project serving the preview. Index deployment is separate from updating `firestore.rules`.

If the listener reports `permission-denied` instead of `failed-precondition`, verify that the signed-in buyer owns those orders, the query has the `buyerUid` filter, and the expected security rules have been deployed. Do **not** permit public reads to fix a buyer feed.

The account page has one recoverable error message with a retry action; it no longer duplicates the warning.

## PWA browser console warnings

The draft branch replaces deprecated `apple-mobile-web-app-capable` with `mobile-web-app-capable` and removes the eager splash image's `fetchPriority="high"` hint. The manifest, existing installed icons and browser favicon remain unchanged. Verify the generated HTML and browser console on the draft Vercel deployment; old previews and installed PWAs can cache previous assets.

## Acceptance checklist

1. **Authentication & permissions**: test a guest, ordinary buyer with no `sellers/{uid}`, active/expired/suspended seller, and admin. Unauthorized users must not receive privileged data. A denied role lookup must show an error instead of silently treating the user as a buyer.
2. **Session reuse**: navigate dashboard → account → orders. There should be one live pair of role document subscriptions per UID; role changes must revalidate through Firestore listeners. Sign-out must clear role, address and order state before the next user can view it.
3. **Orders**: newest 20 appear first; Load older orders uses Firestore cursor pagination. Check buyer/seller/admin scope, permission denials, no duplicate order rows after new orders arrive and load-more, and updates to order status.
4. **Counts**: verify admin and seller aggregates match Firestore. Counts are refreshed when the overview mounts or Refresh is clicked; they are not real-time financial reporting. Order filters, search and CSV export cover only currently loaded pages.
5. **UX**: confirm skeleton/navigation on mobile and desktop, independent metric loading, empty states and error states.
6. **Performance**: compare the same test users/data/network conditions before and after. Client Performance API entries: `TreatStory authentication`, `TreatStory role lookup`, `TreatStory buyer recent orders`, `TreatStory orders first page`, `TreatStory admin render`, `TreatStory seller render`. In DevTools run `performance.getEntriesByType('measure')`. These are *instrumentation*, not proof that the app is faster.
7. **Security**: use Firebase emulator and a real staging project to verify rules. No client-only role or button state grants database permissions.

## Known limits / next protected-backend work

- Seller and application management tables still need full server-driven pagination, saved filters, bulk actions and a protected audit log.
- Stock reservations, retry-safe order creation and payment collection verification require trusted backend transactions or server endpoints; do not rely on client checks.
- Delivery eligibility/pricing, notifications/refunds, image uploads, public storefronts, listing moderation and settlements need separate validated workflows.
- Revenue must never be inferred from order subtotal; COD orders are not confirmed payments.
- Browser performance entries provide diagnostics only; verify deployment and real devices before claiming improvements.

## Existing draft PR

Continue changes in `design/product-card-overlay`; keep PR #1 in draft until review. No direct merge into `main`.
