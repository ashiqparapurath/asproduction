
'use client';

import Link from 'next/link';
import { Menu, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useCart } from '@/context/cart-context';
import { CartDrawer } from './cart-drawer';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export function Header() {
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background/80 border-b sticky top-0 z-20 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Open Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <SheetHeader>
                        <SheetTitle>
                             <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                                <Image src="/logo.png" alt="AS PRODUCTION Logo" width={24} height={24} />
                                <span className="text-lg font-bold">AS PRODUCTION</span>
                            </Link>
                        </SheetTitle>
                        </SheetHeader>
                        <nav className="mt-8 flex flex-col gap-4">
                            <SheetClose asChild>
                               <Link href="/" className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                            </SheetClose>
                             <SheetClose asChild>
                                <Link href="/products" className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
                             </SheetClose>
                             <SheetClose asChild>
                                <Link href="/new-arrivals" className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">New Arrivals</Link>
                             </SheetClose>
                            <SheetClose asChild>
                                <Link href="/about" className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
                            </SheetClose>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
             <Link href="/" className="hidden md:flex items-center gap-2">
              <Image src="/logo.png" alt="AS PRODUCTION Logo" width={32} height={32} className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground tracking-tight">
                AS PRODUCTION
              </span>
            </Link>
          </div>
          
           <div className="md:hidden">
             <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="AS PRODUCTION Logo" width={28} height={28} className="h-7 w-7" />
                 <span className="text-lg font-bold text-foreground tracking-tight">AS PROD</span>
             </Link>
          </div>

          <nav className="hidden md:flex items-center justify-center gap-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
            <Link href="/new-arrivals" className="text-muted-foreground hover:text-foreground transition-colors">New Arrivals</Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </nav>

          <div className="flex justify-end">
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
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
