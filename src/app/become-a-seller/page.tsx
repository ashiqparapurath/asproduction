'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Header } from '@/components/header';
import { useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { SellerCategory } from '@/lib/marketplace-types';

const categories: { value: SellerCategory; label: string }[] = [
  { value: 'home-bakery', label: 'Home bakery' },
  { value: 'art', label: 'Art and paintings' },
  { value: 'handmade', label: 'Handmade crafts and gifts' },
  { value: 'other', label: 'Other creative business' },
];

export default function BecomeSellerPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState<SellerCategory>('home-bakery');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !firestore || submitting) return;
    setSubmitting(true);
    try {
      await setDoc(doc(firestore, 'seller_applications', user.uid), {
        ownerUid: user.uid,
        businessName: businessName.trim(),
        businessCategory,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        description: description.trim(),
        status: 'pending',
        submittedAt: serverTimestamp(),
      });
      setSubmitted(true);
      toast({ title: 'Application submitted', description: 'Your request is awaiting review.' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not submit application',
        description: 'Please check your details. Existing applications cannot be submitted again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="section-shell mx-auto max-w-3xl py-12 sm:py-20">
        <p className="eyebrow text-[#a68a64]">Create with TreatStory</p>
        <h1 className="mt-3 text-4xl font-medium tracking-tight sm:text-6xl">Become a seller<span className="text-[#a68a64]">.</span></h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">Bring your home bakery, art or handmade business to our growing creative marketplace. Applications are reviewed before a seller account is activated.</p>

        {submitted ? (
          <div role="status" className="mt-10 rounded-3xl border bg-white p-8">
            <h2 className="text-2xl font-medium">Application received</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Your application is pending review. Seller dashboard access will be available after approval and account activation.</p>
            <Link href="/" className="mt-6 inline-block text-sm font-semibold underline underline-offset-4">Return to marketplace</Link>
          </div>
        ) : isUserLoading ? (
          <p className="mt-10 text-sm text-muted-foreground">Checking your account…</p>
        ) : !user ? (
          <div className="mt-10 rounded-3xl border bg-white p-8">
            <h2 className="text-xl font-medium">Sign in required</h2>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to submit a seller application. New account registration will be introduced with the buyer account system.</p>
            <Link href="/login" className="editorial-button mt-6">Sign in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-10 space-y-6 rounded-3xl border bg-white p-5 sm:p-8">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input id="businessName" required minLength={2} maxLength={120} value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your creative business name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessCategory">Business category</Label>
              <select id="businessCategory" value={businessCategory} onChange={e => setBusinessCategory(e.target.value as SellerCategory)} className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
                {categories.map(category => <option key={category.value} value={category.value}>{category.label}</option>)}
              </select>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="contactEmail">Contact email</Label><Input id="contactEmail" type="email" required maxLength={254} value={contactEmail} onChange={e => setContactEmail(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="contactPhone">Contact phone</Label><Input id="contactPhone" type="tel" required maxLength={40} value={contactPhone} onChange={e => setContactPhone(e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="description">Tell us about your business</Label><Textarea id="description" required maxLength={2000} rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="What do you create? What makes your work special?" /></div>
            <Button type="submit" className="h-12 w-full rounded-full" disabled={submitting || !firestore}>{submitting ? 'Submitting…' : 'Submit seller application'}</Button>
            <p className="text-xs text-muted-foreground">Submitting an application does not automatically activate selling privileges.</p>
          </form>
        )}
      </main>
    </div>
  );
}
