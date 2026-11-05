'use client';

import { Header } from '@/components/header';
import { ProductGridContainer } from '@/components/product-grid';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, limit, orderBy, query } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';
import { Sparkles } from 'lucide-react';

function NewArrivalsContent() {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'products'), orderBy('createdAt', 'desc'), limit(4)) : null, [firestore]);
  const { data: newArrivals, isLoading } = useCollection<Product>(productsQuery);

  if (isLoading) return <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="space-y-3"><Skeleton className="aspect-[4/5] w-full rounded-[18px]" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-1/3" /></div>)}</div>;
  if (!newArrivals || newArrivals.length === 0) return <div className="rounded-3xl border border-dashed border-[#ded4c7] bg-white/60 px-5 py-20 text-center"><p className="text-sm text-muted-foreground">No new arrivals just yet. Check back soon for fresh finds.</p></div>;
  return <ProductGridContainer products={newArrivals} />;
}

export default function NewArrivalsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="section-shell flex-1 pb-16 pt-10 sm:pb-24 sm:pt-14">
        <div className="mb-10 rounded-[26px] bg-[#eee8de] px-6 py-10 sm:mb-14 sm:px-12 sm:py-16">
          <p className="eyebrow flex items-center gap-2 text-[#967a55]"><Sparkles className="h-3.5 w-3.5" /> Just landed</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-medium leading-[1.05] tracking-[-0.055em] sm:text-6xl">Fresh finds.<br /><span className="font-serif italic font-normal text-[#a68a64]">New little stories.</span></h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">Meet the latest additions to the TreatStory collection. First looks, fresh ideas and new favourites.</p>
        </div>
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}><NewArrivalsContent /></Suspense>
      </main>
      <footer className="border-t border-[#e8e0d5] py-7">
        <div className="section-shell flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <Link href="/" className="brand-wordmark text-2xl">TreatStory</Link>
          <div className="flex gap-5 text-[10px] uppercase tracking-[0.13em] text-muted-foreground"><Link href="/terms-of-service">Terms</Link><Link href="/privacy-policy">Privacy</Link></div>
          <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} TreatStory</p>
        </div>
      </footer>
    </div>
  );
}
