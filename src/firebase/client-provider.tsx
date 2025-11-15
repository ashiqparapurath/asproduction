'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// This is a public configuration and is safe to be in client-side code.
// Security is enforced by Firebase Security Rules, not by hiding these keys.
const firebaseConfig = {
  apiKey: "AIzaSyDdWh68ZLTE_chcIZWrbCBIpxW9RBPRmdw",
  authDomain: "studio-3363182495-f6f10.firebaseapp.com",
  projectId: "studio-3363182495-f6f10",
  storageBucket: "studio-3363182495-f6f10.firebasestorage.app",
  messagingSenderId: "416904916684",
  appId: "1:416904916684:web:eaaec339c5f7a888275c69"
};

function initializeClientFirebase() {
  if (firebaseConfig.apiKey) {
    let app: FirebaseApp;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    return {
      firebaseApp: app,
      auth: getAuth(app),
      firestore: getFirestore(app),
    };
  }
  return null;
}


interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    // It's safe to initialize Firebase here.
    if (typeof window !== 'undefined') {
       const services = initializeClientFirebase();
       setFirebaseServices(services);
    }
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices?.firebaseApp || null}
      auth={firebaseServices?.auth || null}
      firestore={firebaseServices?.firestore || null}
    >
      {children}
    </FirebaseProvider>
  );
}
