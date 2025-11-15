'use client';
import { Header } from '@/components/header';
import { ProductGrid } from '@/components/product-grid';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, limit, orderBy, query } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

function NewArrivalsContent() {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), orderBy('createdAt', 'desc'), limit(4));
  }, [firestore]);

  const { data: newArrivals, isLoading } = useCollection<Product>(productsQuery);

  if (isLoading) {
    return (
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <Skeleton className="w-full h-64" />
            </CardContent>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardContent className="p-4 pt-0 flex justify-between items-center">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!newArrivals || newArrivals.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No new arrivals at the moment. Add some in the admin panel!</p>
      </div>
    )
  }


  return <ProductGrid products={newArrivals} />;
}


export default function NewArrivalsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/40">
      <Header />
      <main className="flex-1 py-12">
        <div className="container">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">New Arrivals</h1>
            <p className="max-w-xl mx-auto text-muted-foreground md:text-xl mt-4">
              Check out the latest additions to our collection. Fresh finds, just for you.
            </p>
          </div>
          <NewArrivalsContent />
        </div>
      </main>
      <footer className="py-8 bg-background text-center text-sm text-muted-foreground border-t">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} AS PRODUCTION. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
