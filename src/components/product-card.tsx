"use client";

import type { Product } from '@/lib/products';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [imgSrc, setImgSrc] = useState(product.imageUrl);

  const fallbackImage = "https://placehold.co/600x600/EEE/31343C?text=Image+Not+Available";

  useEffect(() => {
    setImgSrc(product.imageUrl);
  }, [product.imageUrl]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group bg-card">
      <CardHeader className="p-0 border-b">
        <div className="relative w-full aspect-square overflow-hidden">
            <img
              src={imgSrc || fallbackImage}
              alt={product.name}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              onError={() => {
                setImgSrc(fallbackImage);
              }}
            />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <Badge variant="secondary" className="w-fit mb-2 capitalize">{product.category}</Badge>
        <CardTitle className="text-lg font-semibold leading-tight mb-2 flex-grow">{product.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        {product.showPrice ? (
          <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Price available on request</p>
        )}
        <Button onClick={handleAddToCart} size="icon" className="md:w-auto md:px-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
            <ShoppingCart className="h-4 w-4 md:mr-2" />
            <span className="sr-only md:not-sr-only">Add to Cart</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
