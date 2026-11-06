'use client';

import Link from 'next/link';
import { Header } from '@/components/header';
import { OrderManagement } from '@/components/order-management';
import { useUser } from '@/firebase';

export default function OrdersPage() {
  const { user, isUserLoading } = useUser();
  return <div className="min-h-screen bg-[#f7f5f1]"><Header /><main className="section-shell py-12"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a68a64]">TreatStory orders</p><h1 className="mt-3 text-4xl font-medium">Your orders</h1><p className="mb-8 mt-3 text-sm text-muted-foreground">Track each creator's acceptance, preparation and fulfillment progress.</p>{isUserLoading ? <p>Loading…</p> : user ? <OrderManagement mode="customer" /> : <Link href="/login" className="editorial-button">Sign in to track orders</Link>}</main></div>;
}
