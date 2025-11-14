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
import type { Product } from '@/lib/products';

function AdminContent() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const adminRoleRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [user, firestore]);

  const { data: adminRole, isLoading: isAdminLoading } = useDoc(adminRoleRef);

  if (isAdminLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    );
  }

  if (!adminRole) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          You do not have the necessary permissions to view this page.
        </p>
      </div>
    );
  }

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
         <ProductDialog 
            isOpen={isDialogOpen} 
            onOpenChange={setIsDialogOpen}
          >
            <Button onClick={() => setIsDialogOpen(true)}>Add New Product</Button>
          </ProductDialog>
      </div>
      <ProductList />
    </div>
  );
}

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

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

  const handleSignOut = async () => {
    if (auth) {
        await auth.signOut();
        router.push('/login');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-12 md:py-20 lg:py-24">
          <div className="flex justify-between items-start">
             <AdminContent />
             {user && (
                <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}
