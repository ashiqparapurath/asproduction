import Link from 'next/link';
import { Box, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-background/80 border-b sticky top-0 z-20 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Box className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground tracking-tight">
              AS PRODUCTION
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">New Arrivals</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Shopping Cart</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
