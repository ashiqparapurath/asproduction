'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductList } from '@/components/admin/product-list';
import { ProductDialog } from '@/components/admin/product-dialog';

function AdminContent() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const adminRoleRef = useMemoFirebase(() => {
    // This check is crucial: only create the ref if user and firestore are available.
    if (!user || !firestore) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [user, firestore]);

  const { data: adminRole, isLoading: isAdminLoading } = useDoc(adminRoleRef);

  const handleSignOut = async () => {
    if (auth) {
      setIsSigningOut(true);
      await auth.signOut();
      // Directly navigating to the home page upon sign-out.
      router.push('/');
    }
  };

  // While checking for the admin role, show a skeleton.
  if (isAdminLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  // If the user has no admin role document, deny access.
  if (!adminRole) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          You do not have the necessary permissions to view this page.
        </p>
        <Button onClick={handleSignOut} variant="outline" className="mt-4">
          Sign Out & Go Home
        </Button>
      </div>
    );
  }

  // If the user is an admin, show the full admin panel.
  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
            Admin Panel
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your products here.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ProductDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={() => setIsDialogOpen(true)}>Add New Product</Button>
          </ProductDialog>
          <Button onClick={handleSignOut} variant="outline" disabled={isSigningOut}>
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>
      </div>
      <ProductList />
    </div>
  );
}

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If auth state is resolved and there's no user, redirect to login.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // While checking auth state or if there's no user (before redirect), show loading.
  if (isUserLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="container py-12 md:py-20 lg:py-24">
            <div className="space-y-4">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // If a user is logged in, render the content which will then check for admin role.
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-12 md:py-20 lg:py-24">
          <AdminContent />
        </div>
      </main>
    </div>
  );
}
