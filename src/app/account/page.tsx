'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, collection, query, where } from 'firebase/firestore';
import { useAuth, useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UserRound, ShoppingBag, PackageCheck, Clock3, Store, LogOut, Mail, Pencil, ShieldCheck, ArrowUpRight } from 'lucide-react';
import type { OrderRecord } from '@/components/order-management';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState<'admin' | 'seller' | 'customer' | null>(null);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const orderRef = useMemoFirebase(() => firestore && user ? query(collection(firestore, 'seller_orders'), where('buyerUid', '==', user.uid)) : null, [firestore, user]);
  const { data: orders } = useCollection<OrderRecord>(orderRef);
  useEffect(() => { if (!isUserLoading && !user) router.replace('/login'); }, [user, isUserLoading, router]);
  useEffect(() => { setName(user?.displayName ?? ''); }, [user]);
  useEffect(() => {
    if (!user || !firestore) return;
    let active = true;
    (async () => {
      try {
        const admin = await getDoc(doc(firestore, 'roles_admin', user.uid));
        if (admin.exists()) { if (active) setRole('admin'); return; }
        const seller = await getDoc(doc(firestore, 'sellers', user.uid));
        if (active) setRole(seller.exists() ? 'seller' : 'customer');
      } catch { if (active) setRole('customer'); }
    })();
    return () => { active = false; };
  }, [user, firestore]);
  async function saveName() {
    if (!user || !name.trim() || name.trim().length > 80) return;
    setSaving(true);
    try { await updateProfile(user, { displayName: name.trim() }); setEditing(false); toast({ title: 'Profile updated' }); }
    catch { toast({ variant: 'destructive', title: 'Could not update profile' }); }
    finally { setSaving(false); }
  }
  const firstName = (user?.displayName || user?.email?.split('@')[0] || 'there').split(' ')[0];
  const completed = orders?.filter(o => o.status === 'completed').length ?? 0;
  const active = orders?.filter(o => !['completed','cancelled','rejected'].includes(o.status)).length ?? 0;
  return <div className="min-h-screen bg-[#f7f5f1]"><Header /><main className="section-shell py-10 sm:py-16">
    {!user || !role ? <p className="text-sm text-muted-foreground">Loading your profile…</p> : <>
    <div className="mb-9"><p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a68a64]">Your personal space</p><h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-5xl">Hello, {firstName}.</h1><p className="mt-3 text-sm text-muted-foreground">Everything you love about TreatStory, all in one place.</p></div>
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-5"><div className="rounded-3xl border border-[#e8e0d5] bg-white p-7"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#efe7db] text-2xl font-medium text-[#846b49]">{(user.displayName || user.email || 'T').charAt(0).toUpperCase()}</div><h2 className="mt-5 text-xl font-semibold">{user.displayName || 'TreatStory member'}</h2><p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p><span className="mt-4 inline-flex rounded-full bg-[#f5f0e8] px-3 py-1 text-[11px] font-medium capitalize text-[#846b49]">{role === 'admin' ? 'Super Admin' : role === 'seller' ? 'Creator' : 'Member'}</span><div className="mt-6 border-t pt-5"><p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" />Account secured with Firebase Authentication</p></div></div>
      <div className="rounded-3xl border border-[#e8e0d5] bg-white p-4"><Link href="/orders" className="flex items-center gap-3 rounded-xl p-3 text-sm hover:bg-[#f7f5f1]"><ShoppingBag className="h-4 w-4" />My orders <ArrowUpRight className="ml-auto h-4 w-4" /></Link><Link href="/cart" className="flex items-center gap-3 rounded-xl p-3 text-sm hover:bg-[#f7f5f1]"><PackageCheck className="h-4 w-4" />Shopping bag <ArrowUpRight className="ml-auto h-4 w-4" /></Link><Link href="/products" className="flex items-center gap-3 rounded-xl p-3 text-sm hover:bg-[#f7f5f1]"><Store className="h-4 w-4" />Explore creators <ArrowUpRight className="ml-auto h-4 w-4" /></Link>{role === 'seller' && <Link href="/seller/dashboard" className="flex items-center gap-3 rounded-xl p-3 text-sm hover:bg-[#f7f5f1]">Seller dashboard <ArrowUpRight className="ml-auto h-4 w-4" /></Link>}{role === 'admin' && <Link href="/admin" className="flex items-center gap-3 rounded-xl p-3 text-sm hover:bg-[#f7f5f1]">Admin dashboard <ArrowUpRight className="ml-auto h-4 w-4" /></Link>}<button onClick={async () => { if (auth) await firebaseSignOut(auth); router.replace('/'); }} className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm text-red-700 hover:bg-red-50"><LogOut className="h-4 w-4" />Sign out</button></div></aside>
      <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3">{[{ label: 'Total orders', value: orders?.length ?? 0, icon: ShoppingBag }, { label: 'In progress', value: active, icon: Clock3 }, { label: 'Completed', value: completed, icon: PackageCheck }].map(metric => <div key={metric.label} className="rounded-2xl border border-[#e8e0d5] bg-white p-5"><metric.icon className="h-5 w-5 text-[#a68a64]" /><p className="mt-5 text-2xl font-semibold">{metric.value}</p><p className="mt-1 text-xs text-muted-foreground">{metric.label}</p></div>)}</div>
      <section className="rounded-3xl border border-[#e8e0d5] bg-white p-6 sm:p-8"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-[#a68a64]">Account details</p><h2 className="mt-2 text-xl font-medium">Your profile</h2></div><UserRound className="h-6 w-6 text-[#a68a64]" /></div><div className="mt-7 space-y-5"><div><p className="text-xs text-muted-foreground">Display name</p>{editing ? <div className="mt-2 flex gap-2"><Input maxLength={80} value={name} onChange={e => setName(e.target.value)} /><Button disabled={saving || !name.trim()} onClick={saveName}>Save</Button><Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button></div> : <div className="mt-2 flex items-center justify-between gap-2"><p className="font-medium">{user.displayName || 'Not set'}</p><Button variant="outline" size="sm" onClick={() => setEditing(true)}><Pencil className="mr-2 h-3.5 w-3.5" />Edit</Button></div>}</div><div className="border-t pt-5"><p className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="h-4 w-4" />Email address</p><p className="mt-2 break-all font-medium">{user.email}</p></div></div></section>
      <section className="rounded-3xl border border-[#e8e0d5] bg-[#eee6da] p-7"><p className="text-[10px] font-semibold uppercase tracking-widest text-[#846b49]">Handmade stories await</p><h2 className="mt-3 text-2xl font-medium">Discover something personal.</h2><p className="mt-2 max-w-lg text-sm text-muted-foreground">Shop thoughtful bakes, art and handmade creations from independent sellers.</p><Link href="/products" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">Explore TreatStory <ArrowUpRight className="h-4 w-4" /></Link></section>
}</div>
    </div></>}
  </main></div>;
}
