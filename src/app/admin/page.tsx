'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut as firebaseSignOut } from 'firebase/auth';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
import { useAuth, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { Header } from '@/components/header';
import { OrderManagement } from '@/components/order-management';
import { Button } from '@/components/ui/button';
import { ProductList } from '@/components/admin/product-list';
import { MarketplaceCatalog } from '@/components/admin/marketplace-catalog';
import { SellerApplications } from '@/components/admin/seller-applications';
import { SellerManagement } from '@/components/admin/seller-management';
import { AdminOverview } from '@/components/admin/admin-overview';
import { ProductDialog } from '@/components/admin/product-dialog';
import { BannerList } from '@/components/admin/banner-list';
import { BannerDialog } from '@/components/admin/banner-dialog';
import { CategoryList } from '@/components/admin/category-list';
import { CategoryDialog } from '@/components/admin/category-dialog';
import { EnquirySettingsForm } from '@/components/admin/enquiry-settings-form';
import { LayoutDashboard, Store, ClipboardList, Package, ImageIcon, Tags, Settings, LogOut, ArrowUpRight, ShieldCheck } from 'lucide-react';

type Tab = 'orders' | 'overview' | 'applications' | 'sellers' | 'catalog' | 'products' | 'banners' | 'categories' | 'settings';
const navigation: { id: Tab; label: string; icon: typeof Store; group: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'Workspace' },
  { id: 'orders', label: 'Orders & fulfillment', icon: ClipboardList, group: 'Marketplace' },
  { id: 'applications', label: 'Seller applications', icon: ClipboardList, group: 'Marketplace' },
  { id: 'sellers', label: 'Seller management', icon: Store, group: 'Marketplace' },
  { id: 'catalog', label: 'Seller catalog', icon: Package, group: 'Marketplace' },
  { id: 'products', label: 'Legacy products', icon: Package, group: 'Content' },
  { id: 'banners', label: 'Banners', icon: ImageIcon, group: 'Content' },
  { id: 'categories', label: 'Categories', icon: Tags, group: 'Content' },
  { id: 'settings', label: 'Store settings', icon: Settings, group: 'Configuration' },
];

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [productOpen, setProductOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const adminRef = useMemoFirebase(() => user && db ? doc(db, 'roles_admin', user.uid) : null, [user, db]);
  const { data: admin, isLoading: adminLoading } = useDoc(adminRef);

  useEffect(() => { if (!isUserLoading && !user) router.replace('/login'); }, [isUserLoading, user, router]);

  async function signOut() {
    if (!auth) return;
    setSigningOut(true);
    try { await firebaseSignOut(auth); router.replace('/'); }
    catch { setSigningOut(false); }
  }

  if (isUserLoading || !user || adminLoading) return <div className="min-h-screen bg-[#f7f5f1]"><Header /><main className="section-shell py-16 text-sm text-muted-foreground">Verifying administrator access…</main></div>;
  if (!admin) return <div className="min-h-screen bg-[#f7f5f1]"><Header /><main className="section-shell mx-auto max-w-xl py-20"><ShieldCheck className="h-8 w-8 text-[#a68a64]" /><h1 className="mt-5 text-3xl font-medium">Administrator access required</h1><p className="mt-3 text-sm text-muted-foreground">This workspace is restricted to verified TreatStory administrators.</p><Link href="/account" className="editorial-button mt-7">Return to account</Link></main></div>;

  return <div className="min-h-screen bg-[#f7f5f1]"><Header />
    <div className="section-shell grid min-w-0 gap-4 py-4 sm:gap-6 sm:py-7 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8 lg:py-10">
      <aside className="min-w-0 space-y-3 lg:space-y-6">
        <div className="rounded-2xl bg-[#29251f] p-4 text-white sm:p-6 lg:rounded-3xl"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#c9ae85]" /><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9ae85]">Control center</p></div><h2 className="mt-2 text-xl font-medium sm:mt-4 sm:text-2xl">TreatStory HQ</h2><p className="mt-2 text-xs text-white/65">Super Administrator</p><p className="mt-3 hidden truncate border-t border-white/15 pt-3 text-xs text-white/75 lg:block">{user.email}</p></div>
        <nav aria-label="Admin navigation" className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:block lg:space-y-5 lg:overflow-visible lg:px-0 lg:pb-0">{['Workspace', 'Marketplace', 'Content', 'Configuration'].map(group => <div key={group} className="contents lg:block"><p className="mb-2 hidden px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a68a64] lg:block">{group}</p><div className="contents lg:flex lg:flex-col lg:gap-2">{navigation.filter(item => item.group === group).map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`flex min-h-11 shrink-0 snap-start items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[#e9e2d8] bg-white px-4 py-2.5 text-center text-xs font-medium transition lg:w-full lg:justify-start lg:rounded-xl lg:border-transparent lg:px-4 lg:py-3 lg:text-left lg:text-sm ${tab === item.id ? 'bg-[#e7dfd2] font-semibold text-[#29251f]' : 'text-muted-foreground hover:bg-white'}`}><item.icon className="h-4 w-4 shrink-0" /><span>{item.label}</span></button>)}</div></div>)}</nav>
        <Button variant="outline" className="hidden w-full justify-start rounded-xl lg:flex" onClick={signOut} disabled={signingOut}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
      </aside>
      <main className="min-w-0 space-y-4 sm:space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a68a64]">Marketplace operations</p><h1 className="mt-2 text-2xl font-medium tracking-tight sm:text-4xl">{navigation.find(item => item.id === tab)?.label}</h1><p className="mt-2 hidden text-sm text-muted-foreground sm:block">Manage creators, storefront content and platform operations.</p></div><div className="flex w-full flex-wrap gap-2 sm:w-auto"><Link href="/" className="inline-flex h-10 items-center gap-2 rounded-full border bg-white px-4 text-xs font-medium">View marketplace <ArrowUpRight className="h-4 w-4" /></Link>{tab === 'products' && <ProductDialog isOpen={productOpen} onOpenChange={setProductOpen}><Button onClick={() => setProductOpen(true)}>Add product</Button></ProductDialog>}{tab === 'banners' && <BannerDialog isOpen={bannerOpen} onOpenChange={setBannerOpen}><Button onClick={() => setBannerOpen(true)}>Add banner</Button></BannerDialog>}{tab === 'categories' && <CategoryDialog isOpen={categoryOpen} onOpenChange={setCategoryOpen}><Button onClick={() => setCategoryOpen(true)}>Add category</Button></CategoryDialog>}</div></div>
        {tab === 'overview' && <AdminOverview navigate={next => setTab(next === 'sellers' ? 'applications' : next as Tab)} />}
        {tab === 'orders' && <OrderManagement mode="admin" />}
        {tab === 'applications' && <SellerApplications />}
        {tab === 'sellers' && <SellerManagement />}
        {tab === 'catalog' && <MarketplaceCatalog />}
        {tab === 'products' && <ProductList />}
        {tab === 'banners' && <BannerList />}
        {tab === 'categories' && <CategoryList />}
        {tab === 'settings' && <EnquirySettingsForm />}
      </main>
    </div>
  </div>;
}
