
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
        description: 'Checking your account access...',
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
     return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 text-center">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 p-4">
       <div className="absolute top-8 left-8">
         <Link href="/" className="brand-wordmark text-3xl">TreatStory</Link>
       </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign in to TreatStory</CardTitle>
          <CardDescription>Sign in to your marketplace account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !auth}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">New to TreatStory? <Link href="/register" className="font-semibold text-foreground underline underline-offset-4">Create an account</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}
