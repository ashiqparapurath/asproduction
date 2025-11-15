
"use client";

import type { Product } from '@/lib/products';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fallbackImage = "https://placehold.co/600x600/EEE/31343C?text=Image+Not+Available";
  
  const images = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [fallbackImage];

  const [currentSrc, setCurrentSrc] = useState(images[0]);

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

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = (currentImageIndex + 1) % images.length;
    setCurrentImageIndex(newIndex);
    setCurrentSrc(images[newIndex]);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = (currentImageIndex - 1 + images.length) % images.length;
    setCurrentImageIndex(newIndex);
    setCurrentSrc(images[newIndex]);
  };


  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group bg-card">
      <CardHeader className="p-0 border-b">
        <div className="relative w-full aspect-square overflow-hidden">
            <Image
              src={currentSrc}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setCurrentSrc(fallbackImage)}
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/30 text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, index) => (
                        <div key={index} className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`} />
                    ))}
                </div>
              </>
            )}
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
          <div className="text-sm text-muted-foreground">
            <p>Price available</p>
            <p>on request</p>
          </div>
        )}
        <Button onClick={handleAddToCart} size="icon" className="md:w-auto md:px-3 rounded-full md:rounded-md opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            <ShoppingCart className="h-4 w-4 md:mr-2" />
            <span className="sr-only md:not-sr-only">Add to Cart</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
