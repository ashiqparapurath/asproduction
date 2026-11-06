'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Header } from '@/components/header';

export default function DashboardRouter() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [error, setError] = useState(false);
  useEffect(() => {
    if (isUserLoading) return;
    if (!user) { router.replace('/login'); return; }
    if (!db) return;
    let active = true;
    (async () => {
      try {
        const admin = await getDoc(doc(db, 'roles_admin', user.uid));
        if (!active) return;
        if (admin.exists()) { router.replace('/admin'); return; }
        try {
          const seller = await getDoc(doc(db, 'sellers', user.uid));
          if (!active) return;
          router.replace(seller.exists() ? '/seller/dashboard' : '/account');
        } catch (roleError) {
          console.warn('Seller role lookup unavailable; continuing to customer account.', roleError);
          if (active) router.replace('/account');
        }
      } catch (roleError) {
        console.warn('Role lookup unavailable; continuing to customer account.', roleError);
        if (active) router.replace('/account');
      }
    })();
    return () => { active = false; };
  }, [user, isUserLoading, db, router]);
  return <div className="min-h-screen bg-[#f7f5f1]"><Header /><main className="section-shell py-16"><p className="text-sm text-muted-foreground">{error ? 'Unable to verify your account role. Check Firebase permissions and reload.' : 'Opening your workspace…'}</p></main></div>;
}
