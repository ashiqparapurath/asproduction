'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';

// This function is for CLIENT-SIDE USE ONLY.
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

function getSdks(firebaseApp: FirebaseApp) {
  // Pass an empty object to ensure it connects to the cloud instance, not an emulator.
  const firestore = initializeFirestore(firebaseApp, {});
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: firestore,
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
