import { Header } from '@/components/header';
import { ProductGrid } from '@/components/product-grid';
import { products } from '@/lib/products';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/40">
      <Header />
      <main className="flex-1">
        <section className="bg-background py-12 md:py-20 lg:py-24">
          <div className="container text-center">
            <Badge variant="outline" className="mb-4">Now available</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
              The Production Collection
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl mb-8">
              Discover our curated selection of high-quality products. Built to last, designed to inspire.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductGrid products={products} />
        </div>
      </main>
      <footer className="py-8 bg-background text-center text-sm text-muted-foreground border-t">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} PRODUCTION. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
