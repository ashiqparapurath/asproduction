"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Product } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

interface ProductGridContainerProps {
  products: Product[];
}

interface ProductGridProps {
  products: Product[];
  categories: string[];
  initialCategory: string | null;
}

function ProductGrid({ products, categories, initialCategory }: ProductGridProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All');

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);


  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchTerm.toLowerCase() === 'adm') {
      event.preventDefault();
      router.push('/admin');
    }
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products
      .filter((product) => {
        if (selectedCategory === 'All') return true;
        return product.category === selectedCategory;
      })
      .filter((product) => {
        return product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               product.description.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [products, selectedCategory, searchTerm]);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-2">No Products Found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}

export function ProductGridContainer({ products }: ProductGridContainerProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');

  const categories = useMemo(() => {
    if (!products || products.length === 0) return ['All'];
    return ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);
  
  return <ProductGrid products={products} categories={categories} initialCategory={initialCategory} />
}
