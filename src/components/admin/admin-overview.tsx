'use client';

import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Seller, SellerApplication, CheckoutOrder, SellerOrder } from '@/lib/marketplace-types';
import type { Product } from '@/lib/products';

export function AdminOverview() {
  const db = useFirestore();
  const sellersRef = useMemoFirebase(() => db ? collection(db, 'sellers') : null, [db]);
  const appsRef = useMemoFirebase(() => db ? collection(db, 'seller_applications') : null, [db]);
  const productsRef = useMemoFirebase(() => db ? collection(db, 'products') : null, [db]);
  const ordersRef = useMemoFirebase(() => db ? collection(db, 'checkout_orders') : null, [db]);
  const { data: sellers, isLoading: sellersLoading } = useCollection<Seller>(sellersRef);
  const { data: applications, isLoading: appsLoading } = useCollection<SellerApplication>(appsRef);
  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsRef);
  const { data: orders, isLoading: ordersLoading } = useCollection<CheckoutOrder>(ordersRef);
  const loading = sellersLoading || appsLoading || productsLoading || ordersLoading;
  const stats = [
    { label: 'Active sellers', value: sellers?.filter(s => s.status === 'active').length ?? 0 },
    { label: 'Pending applications', value: applications?.filter(a => a.status === 'pending').length ?? 0 },
    { label: 'Suspended / expired', value: sellers?.filter(s => s.status === 'suspended' || s.status === 'expired').length ?? 0 },
    { label: 'Listed products', value: products?.length ?? 0 },
    { label: 'Checkout orders', value: orders?.length ?? 0 },
    { label: 'Order value (offline)', value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format((orders ?? []).reduce((sum, order) => sum + (Number(order.total) || 0), 0)) },
  ];
  return <section className="space-y-6">
    <div><h2 className="text-2xl font-semibold">Marketplace overview</h2><p className="mt-1 text-sm text-muted-foreground">Live Firestore records across the TreatStory marketplace. Order value is not collected revenue.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map(stat => <Card key={stat.label} className="rounded-2xl"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle></CardHeader><CardContent><p className="text-3xl font-semibold tracking-tight">{loading ? '…' : stat.value}</p></CardContent></Card>)}
    </div>
    <p className="text-xs text-muted-foreground">Buyer counts, commissions, payouts and actual revenue will be added once customer records and payments are implemented.</p>
  </section>;
}
