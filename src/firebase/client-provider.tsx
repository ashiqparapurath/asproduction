'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeClientFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // useMemo will run on the server, so we cannot initialize firebase here directly.
  // Instead, we pass the initializer function to the provider.
  // The FirebaseProvider, which is also a client component, will then be responsible
  // for calling it within a useEffect to ensure it only runs on the client.
  const firebaseServices = useMemo(() => {
    // This check prevents the function from executing on the server.
    if (typeof window === 'undefined') {
      return null;
    }
    return initializeClientFirebase();
  }, []);

  // If we are on the server, firebaseServices will be null. We can render a loading state
  // or null, but we must not pass null to the FirebaseProvider.
  if (!firebaseServices) {
    // Render nothing or a loading spinner on the server.
    // The client will then re-render with the initialized services.
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
