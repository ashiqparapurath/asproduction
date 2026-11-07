'use client';

import type { User } from 'firebase/auth';

export type ImageKind = 'banner' | 'product';

/** Uploads only after the server verifies the Firebase ID token and role. */
export async function uploadTreatStoryPhoto(user: User, file: File, kind: ImageKind): Promise<string> {
  const authToken = await user.getIdToken();
  const form = new FormData();
  form.append('kind', kind);
  form.append('file', file);
  let response: Response;
  try {
    response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: form,
      cache: 'no-store',
    });
  } catch {
    throw new Error('Could not connect to TreatStory image uploads. Check your internet connection.');
  }
  const result = await response.json().catch(() => null) as { url?: string; error?: string } | null;
  if (!response.ok || !result?.url) throw new Error(result?.error || 'The image could not be uploaded.');
  if (!result.url.startsWith('https://res.cloudinary.com/')) throw new Error('Unexpected image upload response.');
  return result.url;
}
