'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config'; // Import the config

// This function is for CLIENT-SIDE USE ONLY.
export function initializeClientFirebase() {
  if (typeof window !== 'undefined') {
    let app: FirebaseApp;
    if (!getApps().length) {
      // Use the imported config object
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    return getSdks(app);
  }
  // This error should not be reachable when used correctly inside a 'use client' component.
  throw new Error("Attempted to call client-side Firebase initialization on the server.");
}

function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
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
