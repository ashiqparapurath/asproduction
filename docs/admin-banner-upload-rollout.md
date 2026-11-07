# Admin banner upload — Firebase rollout

## Why the old save failed

The previous banner form converted selected image files into Base64 data URIs and stored them inside the Firestore `banners` document. A file near 1 MB expands when Base64 encoded and can exceed Firestore's maximum document size (1 MiB). The previous non-blocking save displayed success before the write finished, and any failed write triggered the generic "sign in with the correct account" toast, even if the actual cause was a document-size or data error.

## Fix in PR #2

- A selected JPG or PNG **under 1,000,000 bytes** uploads to Cloud Storage at `banners/{adminUid}/{uniqueId}.jpg|png`.
- Firestore stores only the resulting Storage download URL, not the original Base64 image.
- The UI awaits both Storage upload and Firestore save, with actionable error details.
- If a new image uploads but Firestore save fails, the upload is deleted on a best-effort basis.
- Existing banners storing a Base64 image are still viewable and editable; replacing the image uploads the replacement to Storage. Old images are intentionally not automatically deleted when changing or deleting a banner, to prevent accidental shared-image removal.
- Banner activation and deletion also wait for Firestore confirmation before displaying success.
- Admin access is verified by `roles_admin/{uid}`, as used by the admin dashboard.

## Firebase configuration and deployment

**GitHub commits do not publish Firebase rules or set up a Storage bucket.**

1. Ensure Cloud Storage for Firebase is enabled in the target project `treatstory-online`, and that a default Storage bucket exists.
2. In the Vercel preview/production project configuration, ensure `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` matches the bucket shown in Firebase Console. Make a new Vercel deployment after changing environment variables.
3. Ensure your admin account's **Firebase Authentication UID** has a document at `roles_admin/{uid}`. Do not make the `banners` collection public-writable or grant all users admin role documents.
4. Review the updated `storage.rules` and `firebase.json`. The Storage policy allows *public reads* of banner images, but **only the verified admin UID matching the path** may create/delete them; files must be JPG/PNG and no larger than 1,000,000 bytes. Images cannot be overwritten in place.
5. Test in a staging Firebase project, then publish **Storage rules** to the project used by the app:

```bash
firebase login
firebase deploy --only storage --project treatstory-online
```

You may instead paste the **entire** `storage.rules` contents into Firebase Console → Storage → Rules and publish. The first use of `firestore.exists` in Storage rules may require enabling the connection between Storage and Firestore; follow Firebase's console/CLI IAM prompt. Do not copy these rules to the Cloud Firestore Rules tab.

The existing Firestore rule `match /banners/{bannerId} { allow read: if true; allow write: if isAdmin(); }` is correct. If it is not the current published Firestore ruleset, review and publish the updated `firestore.rules` separately as part of your overall PR rollout.

## Acceptance checks

- Signed-in admin can upload a 1280×720 JPG/PNG below 1 MB, preview, save, see it on homepage and toggle activation.
- The saved Firestore `banners/{id}.imageUrl` is a short HTTPS download URL, **not** a `data:image/...;base64` string.
- A non-admin account cannot write `banners` documents or upload any `banners/{uid}/...` files, including by manipulating the UI.
- An admin cannot upload files under a different admin's UID, and non-image files and files over 1 MB are rejected by Storage rules.
- Saving without an image, missing Storage configuration, expired session, or denied Firestore/Storage write surfaces a helpful error rather than a misleading success toast.
- Confirm `npm test`, Firestore/Storage emulator compilation, TypeScript and production build pass.

**Security:** Publishing these rules is a live permission change. The PR does not deploy to Firebase or merge into `main`.
