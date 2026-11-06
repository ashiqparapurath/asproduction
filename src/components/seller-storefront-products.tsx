'use client';

import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { MarketplaceProduct } from '@/lib/marketplace-types';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Store, Plus, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';

export function SellerStorefrontProducts({ limitCount }: { limitCount?: number }) {
  const db = useFirestore();
  const router = useRouter();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const ref = useMemoFirebase(() => db ? query(collection(db, 'marketplace_products'), where('status', '==', 'published')) : null, [db]);
  const { data, isLoading } = useCollection<MarketplaceProduct>(ref);
  const [search, setSearch] = useState('');
  const visible = useMemo(() => (data ?? []).filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())).slice(0, limitCount), [data, search, limitCount]);
  const addProduct = (p: MarketplaceProduct) => addToCart({ id: `seller:${p.id}`, sellerId: p.sellerId, name: p.name, description: p.description, category: p.category, categoryId: p.category, price: p.price, imageUrls: p.imageUrls, showPrice: p.showPrice });
  if (isLoading) return <div className="rounded-2xl border border-dashed p-8 text-sm text-muted-foreground">Loading creator products…</div>;
  if (!data?.length) return null;
  return <section className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a68a64]">From independent creators</p><h2 className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl">Made with a little more love</h2></div><span className="inline-flex items-center gap-2 text-xs text-muted-foreground"><Store className="h-4 w-4" />TreatStory sellers</span></div>
    {!limitCount && <div className="relative max-w-sm"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search creator products…" aria-label="Search creator products" className="rounded-full bg-white pl-11" /></div>}
    {visible.length === 0 ? <p className="text-sm text-muted-foreground">No matching creator products.</p> : <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{visible.map(p => <article key={p.id} className="min-w-0 overflow-hidden rounded-2xl border border-[#e8e0d5] bg-white"><div className="aspect-[4/5] overflow-hidden bg-[#eee9e0]">{p.imageUrls?.[0] ? <img src={p.imageUrls[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">TreatStory</div>}</div><div className="space-y-2 p-4"><p className="text-[10px] uppercase tracking-widest text-[#a68a64]">{p.category}</p><h3 className="line-clamp-2 text-sm font-medium">{p.name}</h3><p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p><p className="text-sm font-semibold">{p.showPrice ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p.price) : 'Price on request'}</p><p className="text-[11px] capitalize text-muted-foreground">{p.availability.replaceAll('-', ' ')}</p><div className="mt-3 grid gap-2"><button type="button" disabled={p.availability === 'unavailable' || !p.showPrice} onClick={() => { addProduct(p); router.push(`/checkout?product=${encodeURIComponent(p.id)}`); }} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-[#29251f] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#51463a] disabled:cursor-not-allowed disabled:opacity-40"><Zap className="h-3.5 w-3.5" />Buy now</button><button type="button" disabled={p.availability === 'unavailable' || !p.showPrice} onClick={() => { addProduct(p); toast({ title: 'Added to your bag', description: p.name }); }} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[#d6c8b5] bg-white px-3 py-2.5 text-xs font-medium transition hover:bg-[#f7f5f1] disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-3.5 w-3.5" />Add to bag</button></div></div></article>)}</div>}
    <p className="text-xs text-muted-foreground">Buy now takes you directly to checkout. Cash on Delivery is subject to seller confirmation.</p>
  </section>;
}
