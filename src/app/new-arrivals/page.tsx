import { Header } from '@/components/header';
import { ProductGrid } from '@/components/product-grid';
import { products } from '@/lib/products';
import Link from 'next/link';

export default function NewArrivalsPage() {
  // Let's define new arrivals as the last 4 products added.
  const newArrivals = products.slice(-4);

  return (
    <div className="flex flex-col min-h-screen bg-secondary/40">
      <Header />
      <main className="flex-1 py-12">
        <div className="container">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">New Arrivals</h1>
            <p className="max-w-xl mx-auto text-muted-foreground md:text-xl mt-4">
              Check out the latest additions to our collection. Fresh finds, just for you.
            </p>
          </div>
          <ProductGrid products={newArrivals} />
        </div>
      </main>
      <footer className="py-8 bg-background text-center text-sm text-muted-foreground border-t">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} AS PRODUCTION. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
