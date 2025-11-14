
'use client';

import Link from 'next/link';
import { ShoppingCart, LogIn, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from '@/context/cart-context';
import { CartDrawer } from './cart-drawer';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/firebase';

export function Header() {
  const { cartCount } = useCart();
  const { user, isUserLoading } = useUser();

  return (
    <header className="bg-background/80 border-b sticky top-0 z-20 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="AS PRODUCTION Logo" width={32} height={32} className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground tracking-tight">
                AS PRODUCTION
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center justify-center gap-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
            <Link href="/new-arrivals" className="text-muted-foreground hover:text-foreground transition-colors">New Arrivals</Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </nav>

          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    {cartCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{cartCount}</Badge>
                    )}
                    <ShoppingCart className="h-5 w-5" />
                    <span className="sr-only">Shopping Cart</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col">
                  <SheetHeader>
                    <SheetTitle>Your Cart</SheetTitle>
                  </SheetHeader>
                  <CartDrawer />
                </SheetContent>
              </Sheet>
              {!isUserLoading && (
                <Button asChild variant="ghost" size="icon">
                  {user ? (
                    <Link href="/admin">
                      <UserIcon className="h-5 w-5" />
                      <span className="sr-only">Admin</span>
                    </Link>
                  ) : (
                    <Link href="/login">
                      <LogIn className="h-5 w-5" />
                       <span className="sr-only">Login</span>
                    </Link>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
