'use client';

import { useState, type FormEvent } from 'react';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import type { MarketplaceProduct, Seller } from '@/lib/marketplace-types';

export function CreatorCheckout() {
  const { user } = useUser();
  const db = useFirestore();
  const { cartItems, removeFromCart } = useCart();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string[]>([]);
  const items = cartItems.filter(i => i.id.startsWith('seller:'));
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!db || !user || busy || !items.length) return;
    setBusy(true);
    const placed: string[] = [];
    try {
      // Orders are deliberately submitted per listing so rules can verify
      // each product, seller, price and quantity independently.
      for (const item of items) {
        const productId = item.id.slice('seller:'.length);
        const snapshot = await getDoc(doc(db, 'marketplace_products', productId));
        if (!snapshot.exists()) throw new Error('A product is no longer available.');
        const product = snapshot.data() as MarketplaceProduct;
        if (product.status !== 'published' || product.availability === 'unavailable' || !product.showPrice) throw new Error(`${product.name} cannot be ordered.`);
        const sellerSnapshot = await getDoc(doc(db, 'sellers', product.sellerId));
        if (!sellerSnapshot.exists()) throw new Error(`The seller for ${product.name} is no longer available.`);
        const seller = sellerSnapshot.data() as Seller;
        if (seller.status !== 'active') throw new Error(`${seller.businessName || 'This seller'} is not currently active.`);
        if (!seller.isOpen) throw new Error(`${seller.businessName || 'This seller'} is not accepting orders right now.`);
        const expiry = seller.accessEndsAt as { toMillis?: () => number } | undefined;
        if (!expiry?.toMillis || expiry.toMillis() <= Date.now()) throw new Error(`${seller.businessName || 'This seller'}'s marketplace access has expired.`);
        if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new Error('Choose a quantity between 1 and 99.');
        if (name.trim().length < 2 || phone.trim().length < 5 || address.trim().length < 10) throw new Error('Please complete your contact and delivery details.');
        const order = await addDoc(collection(db, 'seller_orders'), {
          buyerUid: user.uid, sellerId: product.sellerId, productId,
          productName: product.name, quantity: item.quantity,
          unitPrice: product.price, subtotal: product.price * item.quantity,
          status: 'pending', customerName: name.trim(), customerPhone: phone.trim(),
          deliveryAddress: address.trim(), customerNote: note.trim(),
          createdAt: serverTimestamp(), updatedAt: serverTimestamp()
        });
        placed.push(order.id);
        removeFromCart(item.id);
      }
      setResult(placed);
      toast({ title: 'Orders submitted', description: `${placed.length} creator order(s) placed.` });
    } catch (err) {
      if (placed.length) setResult(placed);
      const message = err instanceof Error ? err.message : 'Please retry remaining items.';
      const helpful = message.includes('permission') ? 'Firestore rejected the order. Confirm the latest rules are published, and check that the seller is active, open, and has a future accessEndsAt timestamp. If all are valid, run the seller_orders create request in the Firestore Rules simulator.' : message;
      toast({ variant: 'destructive', title: 'Could not finish checkout', description: `${placed.length} order(s) succeeded. ${helpful}` });
    } finally { setBusy(false); }
  }
  if (!items.length && !result.length) return null;
  return <section className="mt-7 rounded-2xl border bg-[#f7f5f1] p-5"><h3 className="text-lg font-medium">Creator checkout</h3><p className="mt-2 text-xs leading-5 text-muted-foreground">Place an offline order request with each creator. No payment is collected online. Sellers confirm availability and fulfillment.</p>
    {result.length > 0 && <div className="mt-4 rounded-xl bg-white p-4 text-sm"><p className="font-semibold">{result.length} order(s) submitted</p><p className="mt-2 text-xs text-muted-foreground">Order references: {result.map(id => id.slice(0, 10)).join(', ')}</p><Link href="/orders" className="mt-3 inline-block underline underline-offset-4">Track your orders</Link></div>}
    {!user ? <Link href="/login" className="editorial-button mt-5">Sign in to order</Link> : items.length > 0 && <form onSubmit={submit} className="mt-5 space-y-3"><Input required minLength={2} maxLength={120} placeholder="Full name" aria-label="Full name" value={name} onChange={e => setName(e.target.value)} /><Input required minLength={5} maxLength={40} placeholder="Contact phone" aria-label="Contact phone" value={phone} onChange={e => setPhone(e.target.value)} /><Textarea required minLength={10} maxLength={1000} placeholder="Delivery address" aria-label="Delivery address" value={address} onChange={e => setAddress(e.target.value)} /><Textarea maxLength={1000} placeholder="Special instructions (optional)" aria-label="Special instructions" value={note} onChange={e => setNote(e.target.value)} /><Button type="submit" disabled={busy || !db} className="w-full rounded-full">{busy ? 'Submitting orders…' : `Place ${items.length} creator order(s)`}</Button></form>}
  </section>;
}
