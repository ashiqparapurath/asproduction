'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// This function is for CLIENT-SIDE USE ONLY.
// It is guarded by 'use client' at the top of the file and an explicit window check.
export function initializeClientFirebase() {
  if (typeof window !== 'undefined') {
    if (!getApps().length) {
      const app = initializeApp(firebaseConfig);
      return getSdks(app);
    }
    const app = getApp();
    return getSdks(app);
  }
  // This error should not be reachable when used correctly inside a 'use client' component.
  throw new Error("Attempted to call client-side Firebase initialization on the server.");
}

// This function is for SERVER-SIDE USE ONLY (e.g., Genkit flows).
// It is NOT exported with 'use client' because it lives in a file that is.
// To use it on the server, you must import it from a file that is NOT marked 'use client'.
// For this app, we will re-declare it where needed on the server to avoid module poisoning.
export function initializeServerFirebase() {
  if (typeof window === 'undefined') {
    if (getApps().length) {
      return getSdks(getApp());
    }
    const app = initializeApp(firebaseConfig);
    return getSdks(app);
  }
  throw new Error("Attempted to call server-side Firebase initialization on the client.");
}

function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
