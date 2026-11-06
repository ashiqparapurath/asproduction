'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { collection, doc, addDoc, deleteDoc, updateDoc, getDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { MarketplaceProduct, Seller, SellerApplication } from '@/lib/marketplace-types';
import { LayoutDashboard, Package, Settings, ShoppingBag, Plus, ArrowUpRight, Clock3, Store, Trash2, Pencil, X, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

type Section = 'overview' | 'products' | 'orders' | 'store';
type ProductDraft = { name: string; description: string; price: string; category: string; imageUrls: string; availability: MarketplaceProduct['availability']; stockQuantity: string; preparationDays: string; showPrice: boolean; status: 'draft' | 'published' };
const emptyDraft: ProductDraft = { name: '', description: '', price: '', category: '', imageUrls: '', availability: 'available', stockQuantity: '', preparationDays: '', showPrice: true, status: 'draft' };
const dateText = (value: unknown) => { const d = (value as { toDate?: () => Date } | null)?.toDate?.(); return d ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'; };

export default function SellerDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [application, setApplication] = useState<SellerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>('overview');
  const [editing, setEditing] = useState<MarketplaceProduct | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [storeDraft, setStoreDraft] = useState({ description: '', contactPhone: '', isOpen: true });

  useEffect(() => { if (!isUserLoading && !user) router.replace('/login'); }, [isUserLoading, user, router]);
  useEffect(() => {
    if (!db || !user) return;
    let live = true;
    setLoading(true);
    (async () => {
      try {
        const [sellerSnap, appSnap] = await Promise.all([
          getDoc(doc(db, 'sellers', user.uid)),
          getDoc(doc(db, 'seller_applications', user.uid)),
        ]);
        if (!live) return;
        const s = sellerSnap.exists() ? ({ id: sellerSnap.id, ...sellerSnap.data() } as Seller) : null;
        setSeller(s);
        setApplication(appSnap.exists() ? ({ id: appSnap.id, ...appSnap.data() } as SellerApplication) : null);
        if (s) setStoreDraft({ description: s.description, contactPhone: s.contactPhone, isOpen: s.isOpen });
      } catch {
        if (live) toast({ variant: 'destructive', title: 'Unable to load seller access', description: 'Check your Firestore rules.' });
      } finally { if (live) setLoading(false); }
    })();
    return () => { live = false; };
  }, [db, user, toast]);

  const productsQuery = useMemoFirebase(() => db && user && seller ? query(collection(db, 'marketplace_products'), where('sellerId', '==', user.uid)) : null, [db, user, seller]);
  const { data: products, isLoading: productsLoading } = useCollection<MarketplaceProduct & { status?: string }>(productsQuery);
  const active = !!seller && seller.status === 'active' && ((seller.accessEndsAt as { toMillis?: () => number } | null)?.toMillis?.() ?? 0) > Date.now();
  const visible = useMemo(() => (products ?? []).filter(p => (p.name + ' ' + p.category).toLowerCase().includes(search.toLowerCase())), [products, search]);
  const published = (products ?? []).filter(p => p.status === 'published').length;

  function openForm(product?: MarketplaceProduct & { status?: string }) {
    setEditing(product ?? null);
    setDraft(product ? {
      name: product.name, description: product.description, price: String(product.price), category: product.category,
      imageUrls: product.imageUrls.join('\n'), availability: product.availability,
      stockQuantity: product.stockQuantity == null ? '' : String(product.stockQuantity),
      preparationDays: product.preparationDays == null ? '' : String(product.preparationDays),
      showPrice: product.showPrice, status: product.status === 'published' ? 'published' : 'draft'
    } : emptyDraft);
    setFormOpen(true);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db || !user || !active || busy) return;
    const price = Number(draft.price);
    if (!Number.isFinite(price) || price < 0) return toast({ variant: 'destructive', title: 'Enter a valid price' });
    const imageUrls = draft.imageUrls.split(/\n|,/).map(v => v.trim()).filter(Boolean);
    if (imageUrls.some(url => !/^https:\/\//i.test(url))) return toast({ variant: 'destructive', title: 'Image links must use HTTPS' });
    setBusy(true);
    try {
      const data = {
        sellerId: user.uid, name: draft.name.trim(), description: draft.description.trim(), category: draft.category.trim(),
        price, imageUrls, showPrice: draft.showPrice, availability: draft.availability,
        stockQuantity: draft.stockQuantity ? Number(draft.stockQuantity) : 0,
        preparationDays: draft.preparationDays ? Number(draft.preparationDays) : 0,
        status: draft.status, updatedAt: serverTimestamp()
      };
      if (editing) await updateDoc(doc(db, 'marketplace_products', editing.id), data);
      else await addDoc(collection(db, 'marketplace_products'), { ...data, createdAt: serverTimestamp() });
      toast({ title: editing ? 'Product updated' : 'Product created' });
      setFormOpen(false);
    } catch { toast({ variant: 'destructive', title: 'Could not save product', description: 'Check your account access and field values.' }); }
    finally { setBusy(false); }
  }

  async function removeProduct(product: MarketplaceProduct) {
    if (!db || !active || busy || !window.confirm('Delete this product permanently?')) return;
    setBusy(true);
    try { await deleteDoc(doc(db, 'marketplace_products', product.id)); toast({ title: 'Product deleted' }); }
    catch { toast({ variant: 'destructive', title: 'Could not delete product' }); }
    finally { setBusy(false); }
  }

  async function saveStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db || !user || !active || busy) return;
    setBusy(true);
    try {
      await updateDoc(doc(db, 'sellers', user.uid), { ...storeDraft, updatedAt: serverTimestamp() });
      setSeller(s => s ? { ...s, ...storeDraft } : s);
      toast({ title: 'Store settings saved' });
    } catch { toast({ variant: 'destructive', title: 'Could not save store settings' }); }
    finally { setBusy(false); }
  }

  const menu: { key: Section; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'products', label: 'My products', icon: Package },
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
    { key: 'store', label: 'Store settings', icon: Settings },
  ];

  if (isUserLoading || loading) return <div className="min-h-screen bg-[#f7f5f1]"><Header /><main className="section-shell py-16 text-sm text-muted-foreground">Preparing your seller workspace…</main></div>;
  if (!seller) return <div className="min-h-screen bg-[#f7f5f1]"><Header /><main className="section-shell mx-auto max-w-2xl py-20"><p className="eyebrow text-[#a68a64]">TreatStory for creators</p><h1 className="mt-4 text-4xl font-medium">Your seller journey starts here.</h1><p className="mt-5 text-muted-foreground">{application ? `Your application is ${application.status}. Your workspace becomes available once approved.` : 'Apply to become a seller to access your workspace.'}</p><Link href="/become-a-seller" className="editorial-button mt-8">Seller application <ArrowUpRight className="ml-2 h-4 w-4" /></Link></main></div>;

  return <div className="min-h-screen bg-[#f7f5f1]"><Header />
    <div className="section-shell grid gap-7 py-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10 lg:py-12">
      <aside className="space-y-6">
        <div className="rounded-3xl bg-[#29251f] p-6 text-white"><p className="text-[10px] uppercase tracking-[0.2em] text-[#c9ae85]">Seller studio</p><h2 className="mt-3 break-words text-2xl font-medium">{seller.businessName}</h2><p className="mt-3 inline-flex items-center gap-2 text-xs text-white/70"><span className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-400' : 'bg-amber-400'}`} />{active ? 'Store access active' : 'Access restricted'}</p></div>
        <nav aria-label="Seller workspace" className="flex gap-2 overflow-x-auto lg:flex-col">{menu.map(item => <button key={item.key} onClick={() => setSection(item.key)} className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition lg:w-full ${section === item.key ? 'bg-[#e7dfd2] font-semibold text-[#29251f]' : 'text-muted-foreground hover:bg-white'}`}><item.icon className="h-4 w-4" />{item.label}</button>)}</nav>
        <Link href="/account" className="inline-flex items-center gap-2 px-4 text-xs text-muted-foreground hover:text-foreground"><LogOut className="h-4 w-4" />Account & sign out</Link>
      </aside>
      <main className="min-w-0 space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-[#a68a64]">Your creative business</p><h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">{menu.find(m => m.key === section)?.label}</h1><p className="mt-2 text-sm text-muted-foreground">Manage your TreatStory presence in one place.</p></div>{section === 'products' && <Button onClick={() => openForm()} disabled={!active} className="rounded-full"><Plus className="mr-2 h-4 w-4" />New product</Button>}</div>
        {!active && <div role="alert" className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950"><AlertCircle className="h-5 w-5 shrink-0" /><span>Your seller access is suspended, expired or not yet active. Editing and publishing are disabled. Contact TreatStory administration to renew access.</span></div>}
        {section === 'overview' && <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">{[
            { label: 'Total products', value: productsLoading ? '…' : products?.length ?? 0, icon: Package },
            { label: 'Published products', value: productsLoading ? '…' : published, icon: CheckCircle2 },
            { label: 'Draft products', value: productsLoading ? '…' : (products?.length ?? 0) - published, icon: Clock3 },
          ].map(metric => <div key={metric.label} className="rounded-2xl border border-[#e9e3d9] bg-white p-6"><metric.icon className="h-5 w-5 text-[#a68a64]" /><p className="mt-6 text-3xl font-semibold">{metric.value}</p><p className="mt-1 text-sm text-muted-foreground">{metric.label}</p></div>)}</div>
          <div className="rounded-3xl border border-[#e9e3d9] bg-white p-7"><p className="eyebrow text-[#a68a64]">Membership</p><h2 className="mt-3 text-xl font-medium capitalize">{seller.accessType} access</h2><p className="mt-2 text-sm text-muted-foreground">Valid until {dateText(seller.accessEndsAt)} · Status: {seller.status}</p><div className="mt-6 border-t pt-5"><h3 className="font-medium">Get your store ready</h3><p className="mt-2 text-sm text-muted-foreground">Add high-quality photos, publish products and keep your business contact details current.</p><Button variant="outline" className="mt-4 rounded-full" onClick={() => setSection('products')}>Manage products <ArrowUpRight className="ml-2 h-4 w-4" /></Button></div></div>
        </div>}
        {section === 'products' && <div className="space-y-5">
          <Input aria-label="Search your products" placeholder="Search your catalog…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm rounded-full bg-white" />
          {productsLoading ? <p className="text-sm text-muted-foreground">Loading catalog…</p> : visible.length === 0 ? <div className="rounded-3xl border border-dashed bg-white p-12 text-center"><Package className="mx-auto h-8 w-8 text-[#a68a64]" /><h3 className="mt-4 text-xl font-medium">No products yet</h3><p className="mt-2 text-sm text-muted-foreground">Create your first listing to get started.</p><Button onClick={() => openForm()} disabled={!active} className="mt-5 rounded-full">Add product</Button></div> :
            <div className="overflow-hidden rounded-2xl border bg-white"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#f1ede6] text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Availability</th><th className="px-5 py-4">Visibility</th><th className="px-5 py-4">Actions</th></tr></thead><tbody>{visible.map(p => <tr key={p.id} className="border-t"><td className="min-w-[180px] px-5 py-4"><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.category}</p></td><td className="px-5 py-4">₹{p.price.toLocaleString('en-IN')}</td><td className="px-5 py-4 capitalize">{p.availability.replaceAll('-', ' ')}</td><td className="px-5 py-4 capitalize">{p.status ?? 'draft'}</td><td className="px-5 py-4"><div className="flex gap-2"><Button size="sm" variant="outline" disabled={!active} onClick={() => openForm(p)} aria-label={`Edit ${p.name}`}><Pencil className="h-4 w-4" /></Button><Button size="sm" variant="outline" disabled={!active || busy} onClick={() => removeProduct(p)} aria-label={`Delete ${p.name}`}><Trash2 className="h-4 w-4" /></Button></div></td></tr>)}</tbody></table></div></div>}
        </div>}
        {section === 'orders' && <div className="rounded-3xl border bg-white p-8"><ShoppingBag className="h-7 w-7 text-[#a68a64]" /><h2 className="mt-4 text-xl font-medium">Order management is coming next</h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Secure seller-specific checkout and order status transitions are not yet enabled. This section intentionally does not show fabricated orders or totals.</p></div>}
        {section === 'store' && <form onSubmit={saveStore} className="space-y-6 rounded-3xl border bg-white p-6 sm:p-8"><div><h2 className="text-xl font-medium">Business profile</h2><p className="mt-1 text-sm text-muted-foreground">Only editable store details appear here. Business identity and access are controlled by TreatStory.</p></div><div><Label>Business name</Label><Input value={seller.businessName} disabled className="mt-2" /></div><div><Label htmlFor="storeDescription">About your store</Label><Textarea id="storeDescription" rows={5} maxLength={2000} value={storeDraft.description} onChange={e => setStoreDraft(s => ({ ...s, description: e.target.value }))} className="mt-2" /></div><div><Label htmlFor="storePhone">Contact phone</Label><Input id="storePhone" maxLength={40} value={storeDraft.contactPhone} onChange={e => setStoreDraft(s => ({ ...s, contactPhone: e.target.value }))} className="mt-2" /></div><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={storeDraft.isOpen} onChange={e => setStoreDraft(s => ({ ...s, isOpen: e.target.checked }))} />Accepting enquiries</label><Button type="submit" disabled={!active || busy} className="rounded-full">Save changes</Button></form>}
      </main>
    </div>
    {formOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3" role="presentation"><div role="dialog" aria-modal="true" aria-label="Product editor" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl sm:p-8"><div className="flex items-center justify-between"><h2 className="text-2xl font-medium">{editing ? 'Edit product' : 'New product'}</h2><Button variant="ghost" size="icon" onClick={() => setFormOpen(false)} aria-label="Close"><X className="h-5 w-5" /></Button></div><form onSubmit={saveProduct} className="mt-6 space-y-4"><div><Label htmlFor="productName">Product name</Label><Input id="productName" required minLength={2} maxLength={120} value={draft.name} onChange={e => setDraft(s => ({ ...s, name: e.target.value }))} /></div><div><Label htmlFor="productDescription">Description</Label><Textarea id="productDescription" required maxLength={2000} value={draft.description} onChange={e => setDraft(s => ({ ...s, description: e.target.value }))} /></div><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="productPrice">Price (INR)</Label><Input id="productPrice" required type="number" min="0" step="0.01" value={draft.price} onChange={e => setDraft(s => ({ ...s, price: e.target.value }))} /></div><div><Label htmlFor="productCategory">Category</Label><Input id="productCategory" required maxLength={80} value={draft.category} onChange={e => setDraft(s => ({ ...s, category: e.target.value }))} /></div></div><div><Label htmlFor="productImages">Image URLs (one HTTPS link per line)</Label><Textarea id="productImages" rows={3} value={draft.imageUrls} onChange={e => setDraft(s => ({ ...s, imageUrls: e.target.value }))} /></div><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="productAvailability">Availability</Label><select id="productAvailability" className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={draft.availability} onChange={e => setDraft(s => ({ ...s, availability: e.target.value as MarketplaceProduct['availability'] }))}><option value="available">Available</option><option value="made-to-order">Made to order</option><option value="unavailable">Unavailable</option></select></div><div><Label htmlFor="productStatus">Visibility</Label><select id="productStatus" className="mt-1 h-10 w-full rounded-md border px-3 text-sm" value={draft.status} onChange={e => setDraft(s => ({ ...s, status: e.target.value as ProductDraft['status'] }))}><option value="draft">Draft</option><option value="published">Published</option></select></div></div><div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="stock">Stock quantity</Label><Input id="stock" type="number" min="0" step="1" value={draft.stockQuantity} onChange={e => setDraft(s => ({ ...s, stockQuantity: e.target.value }))} /></div><div><Label htmlFor="prep">Preparation days</Label><Input id="prep" type="number" min="0" step="1" value={draft.preparationDays} onChange={e => setDraft(s => ({ ...s, preparationDays: e.target.value }))} /></div></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.showPrice} onChange={e => setDraft(s => ({ ...s, showPrice: e.target.checked }))} />Show price publicly</label><div className="flex justify-end gap-3 pt-3"><Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button><Button type="submit" disabled={busy || !active}>{busy ? 'Saving…' : 'Save product'}</Button></div></form></div></div>}
  </div>;
}
