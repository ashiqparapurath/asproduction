'use client';

import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { MarketplaceProduct } from '@/lib/marketplace-types';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Store, ShoppingBag } from 'lucide-react';
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
    {visible.length === 0 ? <p className="text-sm text-muted-foreground">No matching creator products.</p> : (
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
        {visible.map(p => {
          const available = p.availability !== 'unavailable' && p.showPrice;
          return (
            <article key={p.id} className="group relative min-w-0 overflow-hidden rounded-[22px] border border-white/70 bg-[#f1eee9] shadow-[0_6px_24px_rgba(35,29,23,0.09)] transition-shadow duration-300 hover:shadow-[0_16px_36px_rgba(35,29,23,0.15)]">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#f1eee9]">
                {p.imageUrls?.[0] ? <img src={p.imageUrls[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" /> : <div className="flex h-full items-center justify-center font-serif text-lg text-[#958575]">TreatStory</div>}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <span className="absolute left-2.5 top-2.5 max-w-[calc(100%-20px)] truncate rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-medium text-[#51463a] shadow-sm sm:left-3 sm:top-3">{p.category}</span>
                <span className={`absolute right-3 top-3 rounded-md px-2.5 py-1 text-[10px] font-medium backdrop-blur-sm ${p.availability === 'unavailable' ? 'bg-[#29251f]/85 text-white' : 'bg-white/90 text-[#51463a]'}`}>{p.availability === 'unavailable' ? 'Unavailable' : p.availability === 'made-to-order' ? 'Made to order' : 'Available'}</span>
                <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2 text-white sm:inset-x-4 sm:bottom-4">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug drop-shadow-sm sm:text-base">{p.name}</h3>
                  {p.description && <p className="line-clamp-2 text-[11px] leading-snug text-white/85 sm:text-xs">{p.description}</p>}
                  <p className="min-w-0 text-lg font-semibold tracking-tight text-white sm:text-xl">{p.showPrice ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p.price) : 'Price on request'}</p>
                  <div className="flex gap-2"><button type="button" disabled={!available} onClick={() => { addProduct(p); toast({ title: 'Added to your bag', description: p.name }); }} className="flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-2 text-[10px] font-semibold text-[#29251f] transition hover:bg-[#f4eee5] disabled:opacity-60"><ShoppingBag className="h-3.5 w-3.5" />Add to bag</button><button type="button" disabled={!available} onClick={() => { addProduct(p); router.push(`/checkout?product=${encodeURIComponent(p.id)}`); }} className="flex min-h-9 flex-1 items-center justify-center rounded-full border border-white/70 bg-white/15 px-2 text-[10px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-60">{available ? 'Buy now' : 'Unavailable'}</button></div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    )}
    <p className="text-xs text-muted-foreground">Buy now takes you directly to checkout. Cash on Delivery is subject to seller confirmation.</p>
  </section>;
}
