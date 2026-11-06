'use client';

import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Seller, SellerApplication, MarketplaceProduct } from '@/lib/marketplace-types';
import type { Product } from '@/lib/products';
import { Store, Package, ClipboardList, ShieldAlert, ArrowUpRight, CheckCircle2, Layers3 } from 'lucide-react';

function Metric({ label, value, icon: Icon, caption }: { label: string; value: string | number; icon: typeof Store; caption: string }) {
  return <article className="rounded-3xl border border-[#e8e1d6] bg-white p-6"><div className="flex items-center justify-between"><span className="text-xs font-medium text-muted-foreground">{label}</span><Icon className="h-5 w-5 text-[#a68a64]" /></div><p className="mt-6 text-4xl font-semibold tracking-tight text-[#2c261f]">{value}</p><p className="mt-2 text-xs text-muted-foreground">{caption}</p></article>;
}
export function AdminOverview({ navigate }: { navigate?: (tab: string) => void }) {
  const db = useFirestore();
  const sellersRef = useMemoFirebase(() => db ? collection(db, 'sellers') : null, [db]);
  const appsRef = useMemoFirebase(() => db ? collection(db, 'seller_applications') : null, [db]);
  const productsRef = useMemoFirebase(() => db ? collection(db, 'products') : null, [db]);
  const marketplaceRef = useMemoFirebase(() => db ? collection(db, 'marketplace_products') : null, [db]);
  const { data: sellers, isLoading: sellersLoading } = useCollection<Seller>(sellersRef);
  const { data: applications, isLoading: appsLoading } = useCollection<SellerApplication>(appsRef);
  const { data: legacyProducts, isLoading: legacyLoading } = useCollection<Product>(productsRef);
  const { data: marketplaceProducts, isLoading: marketplaceLoading } = useCollection<MarketplaceProduct & { status?: string }>(marketplaceRef);
  const loading = sellersLoading || appsLoading || legacyLoading || marketplaceLoading;
  const pending = (applications ?? []).filter(a => a.status === 'pending');
  const active = (sellers ?? []).filter(s => s.status === 'active' && ((s.accessEndsAt as { toMillis?: () => number } | null)?.toMillis?.() ?? 0) > Date.now());
  const restricted = (sellers ?? []).filter(s => s.status !== 'active' || ((s.accessEndsAt as { toMillis?: () => number } | null)?.toMillis?.() ?? 0) <= Date.now());
  const published = (marketplaceProducts ?? []).filter(p => p.status === 'published').length;
  const total = (marketplaceProducts?.length ?? 0) + (legacyProducts?.length ?? 0);
  const categories = (sellers ?? []).reduce<Record<string, number>>((acc, seller) => { acc[seller.businessCategory] = (acc[seller.businessCategory] ?? 0) + 1; return acc; }, {});
  const max = Math.max(1, ...Object.values(categories));
  const metrics = [
    { label: 'Active sellers', value: active.length, icon: Store, caption: 'Approved and within access period' },
    { label: 'Applications awaiting review', value: pending.length, icon: ClipboardList, caption: 'Businesses needing a decision' },
    { label: 'Total catalog listings', value: total, icon: Package, caption: `${published} published seller listings` },
    { label: 'Restricted seller accounts', value: restricted.length, icon: ShieldAlert, caption: 'Suspended, expired or inactive' },
  ];
  return <section className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a68a64]">Operations intelligence</p><h2 className="mt-2 text-2xl font-medium tracking-tight">Marketplace at a glance</h2><p className="mt-2 text-sm text-muted-foreground">Live operational data from your Firestore collections.</p></div><span className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" />Live database</span></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(m => <Metric key={m.label} {...m} value={loading ? '…' : m.value} />)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
      <div className="rounded-3xl border border-[#e8e1d6] bg-white p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-[#a68a64]">Seller onboarding</p><h3 className="mt-2 text-xl font-medium">Applications queue</h3></div><ClipboardList className="h-5 w-5 text-[#a68a64]" /></div>
        <div className="mt-6 space-y-3">{pending.length === 0 ? <p className="rounded-2xl bg-[#f7f5f1] p-6 text-sm text-muted-foreground">No applications awaiting review.</p> : pending.slice(0, 5).map(a => <div key={a.id} className="flex items-center justify-between gap-3 border-b pb-3"><div><p className="text-sm font-medium">{a.businessName}</p><p className="mt-1 text-xs text-muted-foreground">{a.businessCategory} · {a.contactEmail}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800">Pending</span></div>)}</div>
        <button onClick={() => navigate?.('sellers')} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#856b48] hover:underline">Review applications <ArrowUpRight className="h-4 w-4" /></button>
      </div>
      <div className="rounded-3xl border border-[#e8e1d6] bg-white p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-xs font-medium text-[#a68a64]">Business mix</p><h3 className="mt-2 text-xl font-medium">Seller categories</h3></div><Layers3 className="h-5 w-5 text-[#a68a64]" /></div>
        <div className="mt-7 space-y-5">{Object.keys(categories).length === 0 ? <p className="text-sm text-muted-foreground">No sellers to analyze yet.</p> : Object.entries(categories).sort((a,b) => b[1]-a[1]).map(([name, count]) => <div key={name}><div className="mb-2 flex justify-between text-xs"><span className="capitalize">{name.replaceAll('-', ' ')}</span><span className="font-semibold">{count}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#eee9e1]"><div className="h-full rounded-full bg-[#aa8d67]" style={{ width: `${count/max*100}%` }} /></div></div>)}</div>
      </div>
    </div>
    <div className="flex items-start gap-3 rounded-2xl border border-[#e8e1d6] bg-[#f2ede4] p-5"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#967b58]" /><p className="text-sm leading-6 text-[#5b5145]">Financial analytics, buyer retention and order conversion will become available after secure checkout and payment tracking are implemented. No revenue figures are estimated here.</p></div>
  </section>;
}
