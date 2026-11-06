'use client';

import { useMemo, useState } from 'react';
import { collection, query, where, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Package, Search } from 'lucide-react';

export type OrderRecord = {
  id: string; buyerUid: string; sellerId: string; productId: string; productName: string;
  quantity: number; unitPrice: number; subtotal: number; paymentMethod?: 'cod';
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'rejected' | 'cancelled';
  customerName: string; customerPhone: string; deliveryAddress: string; customerNote: string;
  createdAt?: { toDate?: () => Date };
};
const next: Record<string, string[]> = { pending: ['accepted', 'rejected'], accepted: ['preparing', 'cancelled'], preparing: ['ready', 'cancelled'], ready: ['completed'] };
const money = (v: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
export function OrderManagement({ mode }: { mode: 'seller' | 'admin' | 'customer' }) {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const ref = useMemoFirebase(() => !db || !user ? null : mode === 'admin' ? collection(db, 'seller_orders') : query(collection(db, 'seller_orders'), where(mode === 'seller' ? 'sellerId' : 'buyerUid', '==', user.uid)), [db, user, mode]);
  const { data, isLoading } = useCollection<OrderRecord>(ref);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [working, setWorking] = useState<string | null>(null);
  const orders = useMemo(() => (data ?? []).filter(o => (filter === 'all' || o.status === filter) && (o.productName + ' ' + o.id + ' ' + o.customerName).toLowerCase().includes(search.toLowerCase())).sort((a, b) => (b.createdAt?.toDate?.()?.getTime() ?? 0) - (a.createdAt?.toDate?.()?.getTime() ?? 0)), [data, filter, search]);
  const total = (data ?? []).reduce((sum, o) => sum + o.subtotal, 0);
  const completed = (data ?? []).filter(o => o.status === 'completed').reduce((sum, o) => sum + o.subtotal, 0);
  async function transition(order: OrderRecord, status: string) {
    if (!db || working || !next[order.status]?.includes(status) && mode !== 'admin') return;
    setWorking(order.id);
    try { await updateDoc(doc(db, 'seller_orders', order.id), { status, updatedAt: serverTimestamp() }); toast({ title: 'Order updated' }); }
    catch { toast({ variant: 'destructive', title: 'Could not update order' }); }
    finally { setWorking(null); }
  }
  return <section className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-3">{[{ label: 'Total orders', value: String(data?.length ?? 0) }, { label: 'Order value (not collected)', value: money(total) }, { label: 'Completed order value', value: money(completed) }].map(m => <div key={m.label} className="rounded-2xl border bg-white p-5"><p className="text-xs text-muted-foreground">{m.label}</p><p className="mt-3 text-2xl font-semibold">{m.value}</p></div>)}</div>
    <p className="text-xs text-muted-foreground">These figures represent order values, not verified payments or revenue. Orders use offline fulfillment.</p>
    <div className="flex flex-wrap gap-3"><div className="relative min-w-[180px] flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…" className="bg-white pl-9" /></div><select aria-label="Filter order status" value={filter} onChange={e => setFilter(e.target.value)} className="rounded-xl border bg-white px-4 text-sm">{['all', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'rejected', 'cancelled'].map(s => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>)}</select></div>
    {isLoading ? <p className="text-sm text-muted-foreground">Loading orders…</p> : !orders.length ? <div className="rounded-2xl border bg-white p-12 text-center"><Package className="mx-auto h-8 w-8 text-[#a68a64]" /><p className="mt-4 text-sm">No matching orders yet.</p></div> : <div className="space-y-4">{orders.map(o => <article key={o.id} className="rounded-2xl border bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs text-muted-foreground">Order {o.id.slice(0, 10)} · {o.createdAt?.toDate?.()?.toLocaleDateString('en-IN') ?? 'New'}</p><h3 className="mt-2 font-semibold">{o.productName} × {o.quantity}</h3><p className="mt-1 text-sm">{money(o.subtotal)}</p></div><span className="rounded-full bg-[#eee7dc] px-3 py-1 text-xs font-medium capitalize">{o.status}</span></div>
    <div className="mt-4 grid gap-2 border-t pt-4 text-xs text-muted-foreground sm:grid-cols-2"><p>Customer: {o.customerName}</p><p>Phone: {o.customerPhone}</p><p>Payment: {o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Offline (legacy order)'}</p><p className="sm:col-span-2">Delivery: {o.deliveryAddress}</p>{o.customerNote && <p className="sm:col-span-2">Note: {o.customerNote}</p>}{mode === 'admin' && <p className="sm:col-span-2">Seller: {o.sellerId}</p>}</div>
    {mode !== 'customer' && <div className="mt-5 flex flex-wrap gap-2">{(next[o.status] ?? []).map(s => <Button key={s} size="sm" variant={s === 'rejected' || s === 'cancelled' ? 'outline' : 'default'} disabled={working !== null} onClick={() => transition(o, s)} className="rounded-full capitalize">{s}</Button>)}</div>}</article>)}</div>}
  </section>;
}
