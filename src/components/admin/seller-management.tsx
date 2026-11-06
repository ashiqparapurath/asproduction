'use client';

import { useState } from 'react';
import { collection, doc, serverTimestamp, updateDoc, Timestamp } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Seller } from '@/lib/marketplace-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function SellerManagement() {
  const db = useFirestore();
  const { toast } = useToast();
  const ref = useMemoFirebase(() => db ? collection(db, 'sellers') : null, [db]);
  const { data: sellers, isLoading } = useCollection<Seller>(ref);
  const [working, setWorking] = useState<string | null>(null);
  const [extensionDays, setExtensionDays] = useState(30);
  const [filter, setFilter] = useState('');
  async function change(seller: Seller, action: 'activate' | 'suspend' | 'extend') {
    if (!db || working) return;
    setWorking(seller.id);
    try {
      const expiry = seller.accessEndsAt as { toMillis?: () => number } | undefined;
      const base = Math.max(Date.now(), expiry?.toMillis?.() ?? 0);
      const patch = action === 'extend'
        ? { accessEndsAt: Timestamp.fromMillis(base + extensionDays * 86400000), status: 'active', updatedAt: serverTimestamp() }
        : { status: action === 'suspend' ? 'suspended' : 'active', updatedAt: serverTimestamp() };
      await updateDoc(doc(db, 'sellers', seller.id), patch);
      toast({ title: 'Seller updated' });
    } catch {
      toast({ variant: 'destructive', title: 'Could not update seller' });
    } finally { setWorking(null); }
  }
  const visible = (sellers ?? []).filter(s => (s.businessName + ' ' + s.contactEmail + ' ' + s.status).toLowerCase().includes(filter.toLowerCase()));
  return <section className="space-y-5">
    <div><h2 className="text-2xl font-semibold">Seller management</h2><p className="text-sm text-muted-foreground">Review approved stores, suspend access and extend trial or subscription expiry.</p></div>
    <div className="flex flex-wrap gap-3"><Input className="max-w-sm" aria-label="Search sellers" placeholder="Search sellers…" value={filter} onChange={e => setFilter(e.target.value)} /><label className="flex items-center gap-2 text-sm">Extension (days)<Input className="w-24" type="number" min={1} max={365} value={extensionDays} onChange={e => setExtensionDays(Math.min(365, Math.max(1, Number(e.target.value) || 1)))} /></label></div>
    {isLoading ? <p>Loading sellers…</p> : visible.length === 0 ? <p className="rounded-2xl border p-8 text-sm text-muted-foreground">No sellers found.</p> :
      <div className="space-y-3">{visible.map(seller => {
        const expiry = seller.accessEndsAt as { toDate?: () => Date } | undefined;
        return <article key={seller.id} className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 lg:flex-row lg:items-center">
          <div><h3 className="font-semibold">{seller.businessName}</h3><p className="mt-1 text-sm text-muted-foreground">{seller.contactEmail} · {seller.businessCategory}</p><p className="mt-2 text-xs uppercase tracking-widest">{seller.status} · {seller.accessType} · Expires {expiry?.toDate?.().toLocaleDateString() ?? 'Not set'}</p></div>
          <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" disabled={working !== null} onClick={() => change(seller, 'extend')}>Extend access</Button>{seller.status === 'suspended' ? <Button size="sm" disabled={working !== null} onClick={() => change(seller, 'activate')}>Reactivate</Button> : <Button size="sm" variant="destructive" disabled={working !== null} onClick={() => change(seller, 'suspend')}>Suspend</Button>}</div>
        </article>;
      })}</div>}
  </section>;
}
