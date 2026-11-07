# Marketplace optimization audit — 7 November 2026

## Scope and architecture

Retains Next.js 15 App Router, React 18, Firebase Auth, Firestore realtime reads, existing collections/security rules, and the existing per-listing COD order validation. Reviewed the 16 page routes, shared navigation, catalog loading hooks, cart/checkout, seller/admin entry points, icon metadata, and build configuration. No database migration or production deployment.

The repository has no native Android/iOS project, service worker, dedicated product-detail route, public seller-profile route, wishlist, review flow, or online payment flow. These are not fabricated as part of this optimization. PWA maskable assets and an opaque Apple touch icon cover the existing installation surfaces; native package installation remains unverified.

## Findings and changes

- Creator images used raw full-resolution image URLs. Known supported origins now use responsive Next Image sizing, with lazy loading and a local fallback. Other existing origins remain usable without expanding the image proxy allowlist.
- Creator teasers fetched every published item before slicing to four/eight cards. Limited teasers now apply Firestore `limit` directly, preserving their existing ordering.
- Full catalogs mounted every matching product card. Both grids now render 24 at a time with Show more; full-dataset text/category filtering is preserved. This is render pagination, not server pagination for full catalogs. Global substring search still requires full catalog reads; changing that correctly needs a search/index strategy.
- Public catalog snapshots are shared for identical queries and scoped to the current user. A 30-second memory cache avoids skeletons on warm returns, unsubscribes when unused, and revalidates when revisited. Orders, roles and private profile data are excluded.
- Collection/document hooks previously flashed empty/stale state on query changes and mislabeled all failures as permission failures. They now expose actual errors and retries, and clear data on target changes. Catalog, order and main admin list failures have retry UI.
- Admin imported all panels/forms eagerly. Panel/form code is now dynamically loaded with section skeletons.
- Checkout unmounted its confirmation when the last purchased item was removed. It now preserves the mounted confirmation, follows URL product selection, waits for cart hydration and returns to checkout after login. Server-side order checks remain unchanged.
- Firebase initialization could temporarily signal a signed-out state before Auth started. Initialization now keeps the authentication loading gate closed until services are ready.
- Header active states, scrollable mobile navigation, non-overlapping short-screen menu content, safe-area padding, reduced-motion support, carousel keyboard visibility and dialog scroll bounds improved.
- Admin/seller sections now use URL parameters so direct links, refresh and browser history retain the section.
- Icons are generated from the existing source logo with transparent source padding removed. Separate normal/maskable PNGs, 180px Apple icon, 192/512px install icons and 1024px master are included. Favicon retained. The old dynamic icon endpoint redirects to static assets.
- Splash uses the same brand background and icon with no artificial minimum display timer. Route/client data skeletons dismiss naturally when their content is ready.
- Added route error/not-found recovery. Nonblocking write permission feedback no longer throws through the root provider.
- Fixed the pre-existing Next/package-lock mismatch that prevented `npm ci`.

## Verification

- Seven automated regression tests cover catalog subscription sharing, warm cache/revalidation, account/query isolation, original error/retry behavior, checkout confirmation retention, product-query navigation and opaque icon dimensions.
- TypeScript validation and Next production build pass.
- Build baseline at `8a3ae5b` used the same installed Next 15.3.6 dependencies as the revised build, because the original lockfile was out of sync.
- Admin first-load JavaScript: **346 kB baseline → approximately 277 kB revised** (about 20% smaller). The admin route itself decreased from 64.2 kB to roughly 5.4 kB. These are Next build bundle estimates, not measured user latency or Core Web Vitals.
- Storefront first-load JS is roughly unchanged/slightly larger due to caching/recovery logic; no claim of a universal bundle reduction.
- Literal internal page links resolve to existing routes. Manifest is a static asset, not a page route. Dynamic banner links require live-data validation.
- Preview unavailable: the managed preview launcher appends `--host`/`--strictPort`, which Next rejects. Browser layout checks and Lighthouse/Core Web Vitals are therefore **not verified**.
- Live Firebase credentials and customer/seller/admin test accounts were unavailable. Actual sign-in, Firestore permission/index behavior, order submission, native installation and end-to-end role flows remain **not verified**. Tests mock Firebase and must not be represented as live backend validation.

## Before merging

Use the existing PR preview with configured Firebase to check mobile/desktop layouts, protected deep links, failed reads/retries, cart restore, login return, successful/partial COD orders, seller/admin actions, and real-device installation. Measure Lighthouse and real request timings there. Keep this PR in draft until that validation is complete.
