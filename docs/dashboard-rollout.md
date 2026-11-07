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
