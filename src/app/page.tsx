import { Header } from '@/components/header';
import { ProductGrid } from '@/components/product-grid';
import { products } from '@/lib/products';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductGrid products={products} />
      </main>
      <footer className="py-6 bg-background text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} PRODUCTION. All rights reserved.
      </footer>
    </div>
  );
}
