'use client';

import Link from 'next/link';
import { Menu, ShoppingBag, Search, ArrowUpRight, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useUser } from '@/firebase';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop all' },
  { href: '/new-arrivals', label: 'New arrivals' },
  { href: '/about', label: 'Our story' },
  { href: '/become-a-seller', label: 'Sell with us' },
];

export function Header() {
  const { cartCount } = useCart();
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="hidden sm:flex h-8 items-center justify-center bg-[#28231f] px-4 text-[10px] font-medium tracking-[0.18em] text-[#f7f1e8]">
        GOOD THINGS, THOUGHTFULLY FOUND <span className="mx-2 text-[#c8a879]">✳</span> WELCOME TO TREATSTORY
      </div>
      <header className="sticky top-0 z-40 border-b border-[#e9e2d8] bg-background/95 backdrop-blur-xl">
        <div className="section-shell">
          <div className="grid h-[68px] grid-cols-[1fr_auto_1fr] items-center md:h-[82px]">
            <div className="flex items-center justify-start">
              <div className="md:hidden">
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Open navigation" className="-ml-2 h-10 w-10 rounded-full">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[min(86vw,360px)] border-r-0 bg-[#faf8f3]">
                    <SheetHeader className="border-b border-[#e9e2d8] pb-6 text-left">
                      <SheetTitle>
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="brand-wordmark text-3xl text-foreground">TreatStory</Link>
                      </SheetTitle>
                      <p className="eyebrow pt-2 text-muted-foreground">A little something for every story</p>
                    </SheetHeader>
                    <nav className="mt-8 flex flex-col">
                      {navItems.map((item, index) => (
                        <SheetClose asChild key={item.href}>
                          <Link href={item.href} className="flex items-center justify-between border-b border-[#e9e2d8] py-5 text-lg font-medium tracking-tight">
                            <span><span className="mr-4 text-xs text-[#b59a73]">0{index + 1}</span>{item.label}</span>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                          </Link>
                        </SheetClose>
                      ))}
                    </nav>
                    <div className="absolute bottom-8 left-6 right-6 rounded-2xl bg-[#eee7dc] p-5">
                      <p className="eyebrow text-muted-foreground">The TreatStory edit</p>
                      <p className="mt-2 text-sm leading-relaxed">Discover pieces that make the everyday feel a little more special.</p>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <Link href="/products" className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground md:flex">
                <Search className="h-4 w-4" /> Explore
              </Link>
            </div>

            <Link href="/" aria-label="TreatStory home" className="brand-wordmark justify-self-center text-[29px] leading-none text-foreground sm:text-[34px] md:text-[39px]">
              TreatStory
            </Link>

            <div className="flex items-center justify-end gap-1 sm:gap-3">
              <nav className="hidden items-center gap-7 lg:flex">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted-foreground transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Link href={user ? "/dashboard" : "/login"} aria-label={user ? "Open dashboard" : "Sign in"} title={user ? "Open dashboard" : "Sign in"} className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted"><UserRound className="h-[19px] w-[19px]" /></Link>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Shopping bag" className="relative h-10 w-10 rounded-full">
                    <ShoppingBag className="h-[19px] w-[19px]" />
                    {cartCount > 0 && <Badge className="absolute -right-0.5 -top-0.5 h-[19px] min-w-[19px] justify-center rounded-full border-2 border-background bg-[#b28f62] px-1 text-[10px] text-white">{cartCount}</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent className="flex flex-col">
                  <SheetHeader><SheetTitle>Your bag <span className="text-muted-foreground">({cartCount})</span></SheetTitle></SheetHeader>
                  <CartDrawer />
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <nav className="hidden h-10 items-center justify-center gap-10 border-t border-[#eee8df] lg:hidden md:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground">{item.label}</Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
}
