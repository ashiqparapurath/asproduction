
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Sparkles, ShoppingBag, ShieldCheck } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const [checkingRole, setCheckingRole] = useState(false);
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    if (isUserLoading || !user || !firestore) return;
    let cancelled = false;
    async function routeByRole() {
      setCheckingRole(true);
      try {
        const admin = await getDoc(doc(firestore!, 'roles_admin', user!.uid));
        if (cancelled) return;
        if (admin.exists()) {
          router.replace('/admin');
          return;
        }
        // A buyer does not need a seller application or seller role.
        // Failed optional role reads must not block a successful login.
        try {
          const seller = await getDoc(doc(firestore!, 'sellers', user!.uid));
          if (cancelled) return;
          if (seller.exists()) {
            router.replace('/seller/dashboard');
            return;
          }
        } catch (roleError) {
          console.warn('Seller role lookup unavailable; continuing as customer.', roleError);
        }
        if (!cancelled) router.replace('/');
      } catch (roleError) {
        console.warn('Role lookup unavailable; routing to customer storefront.', roleError);
        if (!cancelled) router.replace('/');
      }
    }
    void routeByRole();
    return () => { cancelled = true; };
  }, [user, isUserLoading, firestore, router, toast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
       toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Authentication service is not available. Please try again later.',
      });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Login Successful',
        description: 'Welcome back to TreatStory.',
      });
      // The useEffect will handle the redirect
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || (user && checkingRole)) {
    return <div className="flex min-h-screen items-center justify-center bg-[#faf8f4]"><div className="flex items-center gap-3 text-sm text-[#756b5e]"><span className="h-5 w-5 animate-spin rounded-full border-2 border-[#d7c7b3] border-t-[#453a2f]" />Opening TreatStory…</div></div>;
  }

  return (
    <main className="min-h-screen bg-[#faf8f4] text-[#2c2823] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#e9dfd0] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1500&q=85')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1d1916]/45 via-[#1d1916]/10 to-[#1d1916]/75" />
        <div className="relative z-10 flex items-center justify-between px-10 pt-10 xl:px-16">
          <Link href="/" className="brand-wordmark text-4xl text-white">TreatStory</Link>
          <span className="rounded-full border border-white/40 bg-white/15 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">Made with heart</span>
        </div>
        <div className="relative z-10 max-w-xl px-10 pb-14 text-white xl:px-16 xl:pb-20">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f0d9b5]"><Sparkles className="h-4 w-4" /> Thoughtfully discovered</p>
          <h2 className="mt-5 text-5xl font-medium leading-[1.08] tracking-tight xl:text-6xl">Every little find has <span className="font-serif italic font-normal">a story.</span></h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/85">From homemade bakes to thoughtful handcrafted gifts, discover creations made with care by independent makers.</p>
          <div className="mt-9 flex items-center gap-5 border-t border-white/30 pt-6 text-xs text-white/85"><span className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Curated finds</span><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Your personal account</span></div>
        </div>
      </section>

      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 sm:py-9 lg:px-12 xl:px-20">
        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <Link href="/" className="brand-wordmark text-[30px] leading-none lg:hidden">TreatStory</Link>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[#e6ded2] bg-white px-4 py-2.5 text-xs font-medium transition hover:bg-[#f2ece4]"><ArrowLeft className="h-3.5 w-3.5" /> Back to shop</Link>
        </div>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10 sm:py-14">
          <div className="mb-8">
            <h1 className="text-[36px] font-medium leading-tight tracking-tight sm:text-[44px]">Welcome back.</h1>
            <p className="mt-3 text-sm leading-6 text-[#7a7167]">Sign in to keep your favourite finds, orders and delivery details together.</p>
          </div>
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2"><Label htmlFor="email" className="text-xs font-semibold">Email address</Label><Input id="email" type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} className="h-12 rounded-xl border-[#ddd4c8] bg-white px-4 text-sm focus-visible:ring-[#a78c6a]" /></div>
            <div className="space-y-2"><Label htmlFor="password" className="text-xs font-semibold">Password</Label><div className="relative"><Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} className="h-12 rounded-xl border-[#ddd4c8] bg-white px-4 pr-12 text-sm focus-visible:ring-[#a78c6a]" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(v=>!v)} className="absolute inset-y-0 right-1 flex w-11 items-center justify-center rounded-lg text-[#7a7167] hover:text-[#29251f]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            <Button type="submit" disabled={isLoading || !auth} className="h-12 w-full rounded-full bg-[#29251f] text-sm font-semibold text-white transition hover:bg-[#51463a]">{isLoading ? 'Signing in…' : <>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
          </form>
          <div className="mt-7 border-t border-[#e8e0d5] pt-6"><p className="text-center text-sm text-[#7a7167]">New to TreatStory? <Link href="/register" className="font-semibold text-[#29251f] underline decoration-[#bca07b] underline-offset-4 hover:text-[#8c6c43]">Create an account</Link></p></div>
          <p className="mt-7 flex items-center justify-center gap-2 text-center text-xs text-[#958a7c]"><ShieldCheck className="h-4 w-4" /> Secure sign-in for customers and creators</p>
        </div>
        <p className="text-center text-[11px] text-[#a3998e]">© {new Date().getFullYear()} TreatStory · Little finds. Lovely stories.</p>
      </section>
    </main>
  );
}
