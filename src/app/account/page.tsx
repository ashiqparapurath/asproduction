'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'seller' | 'customer' | null>(null);
  useEffect(() => {
    if (!isUserLoading && !user) router.replace('/login');
  }, [user, isUserLoading, router]);
  useEffect(() => {
    if (!user || !firestore) return;
    let active = true;
    async function loadRole() {
      try {
        const admin = await getDoc(doc(firestore!, 'roles_admin', user!.uid));
        if (admin.exists()) { if (active) setRole('admin'); return; }
        const seller = await getDoc(doc(firestore!, 'sellers', user!.uid));
        if (active) setRole(seller.exists() ? 'seller' : 'customer');
      } catch { if (active) setRole('customer'); }
    }
    void loadRole();
    return () => { active = false; };
  }, [user, firestore]);
  return <div className="min-h-screen bg-background"><Header /><main className="section-shell mx-auto max-w-2xl py-16">
    <p className="eyebrow text-[#a68a64]">Your TreatStory account</p>
    <h1 className="mt-3 text-4xl font-medium tracking-tight">Welcome back.</h1>
    {!user || !role ? <p className="mt-8 text-muted-foreground">Loading your account…</p> :
      <div className="mt-8 space-y-6 rounded-3xl border bg-card p-8">
        <div><p className="text-xs uppercase tracking-widest text-muted-foreground">Signed in as</p><p className="mt-2 font-medium">{user.email}</p></div>
        <p className="text-sm text-muted-foreground">Account type: {role === 'admin' ? 'Super Admin' : role === 'seller' ? 'Seller' : 'Customer'}</p>
        {role === 'admin' && <Link href="/admin" className="editorial-button">Open Super Admin dashboard</Link>}
        {role === 'seller' && <Link href="/seller/dashboard" className="editorial-button">Open Seller Studio</Link>}
        {role === 'customer' && <Link href="/become-a-seller" className="editorial-button">Apply to become a seller</Link>}
        <div><Button variant="outline" onClick={async () => { await auth?.signOut(); router.replace('/'); }}>Sign out</Button></div>
      </div>}
  </main></div>;
}
