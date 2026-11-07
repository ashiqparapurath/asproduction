'use client';

import { useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { ProductImage } from '@/components/product-image';
import type { MarketplaceProduct } from '@/lib/marketplace-types';

const formatMoney = (price: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export function SellerProductCard({ product: p, addToBag, buyNow }: {
  product: MarketplaceProduct;
  addToBag: (product: MarketplaceProduct) => void;
  buyNow: (product: MarketplaceProduct) => void;
}) {
  // Support correctly stored arrays as well as legacy newline-separated values.
  const photos = (p.imageUrls ?? []).flatMap(url => url.split(/\r?\n/)).map(url => url.trim()).filter(Boolean);
  const [index, setIndex] = useState(0);
  const current = Math.min(index, Math.max(0, photos.length - 1));
  const available = p.availability !== 'unavailable' && p.showPrice;
  function move(direction: number, event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIndex(n => (n + direction + photos.length) % photos.length);
  }

  return <article className="group relative min-w-0 overflow-hidden rounded-[22px] border border-white/70 bg-[#f1eee9] shadow-[0_6px_24px_rgba(35,29,23,0.09)] transition-shadow duration-300 hover:shadow-[0_16px_36px_rgba(35,29,23,0.15)]">
    <div className="relative aspect-[3/4] overflow-hidden bg-[#f1eee9]">
      <ProductImage src={photos[current]} alt={`${p.name} — photo ${current + 1}`} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <Link href={`/product/${encodeURIComponent('seller:' + p.id)}`} aria-label={`View details and photos for ${p.name}`} className="absolute inset-0 z-10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#c9ae85]" />
      <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 max-w-[45%] truncate rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-medium text-[#51463a] shadow-sm">{p.category}</span>
      <span className={`pointer-events-none absolute right-2.5 top-2.5 z-10 max-w-[45%] truncate rounded-md px-2.5 py-1 text-[10px] font-medium ${p.availability === 'unavailable' ? 'bg-[#29251f]/85 text-white' : 'bg-white/90 text-[#51463a]'}`}>{p.availability === 'unavailable' ? 'Unavailable' : p.availability === 'made-to-order' ? 'Made to order' : 'Available'}</span>
      {photos.length > 1 && <>
        <button type="button" onClick={e => move(-1, e)} aria-label={`Previous photo of ${p.name}`} className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#29251f] shadow sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" onClick={e => move(1, e)} aria-label={`Next photo of ${p.name}`} className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#29251f] shadow sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"><ChevronRight className="h-4 w-4" /></button>
        <div aria-label={`Photo ${current + 1} of ${photos.length}`} className="pointer-events-none absolute left-1/2 top-11 z-10 flex -translate-x-1/2 gap-1">{photos.slice(0, 10).map((_, n) => <span key={n} className={`h-1.5 rounded-full bg-white ${n === current ? 'w-3' : 'w-1.5 opacity-60'}`} />)}</div>
      </>}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex flex-col gap-2 text-white sm:inset-x-4 sm:bottom-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug drop-shadow-sm sm:text-base">{p.name}</h3>
        {p.description && <p className="hidden line-clamp-2 text-[11px] leading-snug text-white/85 sm:block sm:text-xs">{p.description}</p>}
        <p className="text-lg font-semibold tracking-tight sm:text-xl">{p.showPrice ? formatMoney(p.price) : 'Price on request'}</p>
        <div className="pointer-events-auto relative z-20 flex gap-2">
          <button type="button" disabled={!available} onClick={() => addToBag(p)} aria-label={`Add ${p.name} to bag`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#29251f] transition hover:bg-[#f4eee5] disabled:opacity-60 sm:h-10 sm:w-auto sm:flex-1 sm:gap-2 sm:px-3"><ShoppingBag className="h-4 w-4" /><span className="hidden text-[11px] font-semibold sm:inline">Add to bag</span></button>
          <button type="button" disabled={!available} onClick={() => buyNow(p)} className="flex h-10 min-w-0 flex-1 items-center justify-center rounded-full border border-white/70 bg-white/15 px-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/25 disabled:opacity-60">{available ? 'Buy now' : 'Unavailable'}</button>
        </div>
      </div>
    </div>
  </article>;
}
