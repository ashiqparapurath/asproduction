'use client';

import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { MarketplaceProduct } from '@/lib/marketplace-types';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search, Store, Zap, ShoppingBag } from 'lucide-react';
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
            <article key={p.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e8e1d8] bg-white shadow-[0_3px_18px_rgba(35,29,23,0.045)] transition-shadow duration-300 hover:shadow-[0_12px_30px_rgba(35,29,23,0.09)]">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#f1eee9]">
                {p.imageUrls?.[0] ? <img src={p.imageUrls[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" /> : <div className="flex h-full items-center justify-center font-serif text-lg text-[#958575]">TreatStory</div>}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/10 to-transparent" />
                <span className="absolute left-2.5 top-2.5 max-w-[calc(100%-20px)] truncate rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-medium text-[#51463a] shadow-sm sm:left-3 sm:top-3">{p.category}</span>
                <span className={`absolute bottom-3 left-3 rounded-md px-2.5 py-1 text-[10px] font-medium backdrop-blur-sm ${p.availability === 'unavailable' ? 'bg-[#29251f]/85 text-white' : 'bg-white/90 text-[#51463a]'}`}>{p.availability === 'unavailable' ? 'Unavailable' : p.availability === 'made-to-order' ? 'Made to order' : 'Available'}</span>
                <button type="button" disabled={!available} aria-label={`Add ${p.name} to bag`} onClick={() => { addProduct(p); toast({ title: 'Added to your bag', description: p.name }); }} className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#29251f] shadow-sm transition-colors hover:bg-[#f4eee5] disabled:cursor-not-allowed disabled:opacity-50 sm:bottom-3 sm:right-3"><ShoppingBag className="h-4 w-4" /></button>
              </div>
              <div className="flex flex-1 flex-col px-3.5 pb-4 pt-3.5 sm:px-4">
                <h3 className="line-clamp-2 min-h-[2.6em] text-sm font-semibold leading-snug tracking-tight text-[#29251f] sm:text-[15px]">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-xs">{p.description}</p>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#f0ebe5] pt-3">
                  <p className="text-sm font-semibold tracking-tight text-[#29251f] sm:text-base">{p.showPrice ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p.price) : 'Price on request'}</p>
                </div>
                <button type="button" disabled={!available} onClick={() => { addProduct(p); router.push(`/checkout?product=${encodeURIComponent(p.id)}`); }} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[#29251f] bg-[#29251f] px-3 py-2.5 text-[11px] font-semibold text-white transition hover:bg-[#51463a] disabled:cursor-not-allowed disabled:border-[#ddd4c8] disabled:bg-[#eee9e0] disabled:text-[#958575] sm:text-xs"><Zap className="h-3.5 w-3.5" />{available ? 'Buy now' : p.showPrice ? 'Unavailable' : 'Enquire for price'}</button>
              </div>
            </article>
          );
        })}
      </div>
    )}
    <p className="text-xs text-muted-foreground">Buy now takes you directly to checkout. Cash on Delivery is subject to seller confirmation.</p>
  </section>;
}
