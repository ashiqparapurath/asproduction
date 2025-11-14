import { Suspense } from 'react';
import { Header } from '@/components/header';
import { ProductGrid } from '@/components/product-grid';
import { products } from '@/lib/products';
import Link from 'next/link';

function ProductsPageContent() {
  return <ProductGrid products={products} />;
}

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/40">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <Suspense fallback={<div>Loading...</div>}>
            <ProductsPageContent />
          </Suspense>
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
