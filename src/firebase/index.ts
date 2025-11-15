'use client';

// This file is intentionally left with minimal code.
// The client-side Firebase initialization is now self-contained within FirebaseClientProvider.
// This prevents circular dependencies and ensures a clean separation of concerns.

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
