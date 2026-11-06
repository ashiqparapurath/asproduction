"use client";

import type { Product } from '@/lib/products';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Image from 'next/image';

interface ProductCardProps { product: Product; }

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const fallbackImage = "https://placehold.co/600x600/f1eee8/756b60?text=TreatStory";
  const images = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [fallbackImage];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(images[0]);

  const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  const handleAddToCart = () => {
    addToCart(product);
    toast({ title: "Added to your bag", description: `${product.name} is waiting in your TreatStory bag.` });
  };

  const changeImage = (direction: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = (currentImageIndex + direction + images.length) % images.length;
    setCurrentImageIndex(newIndex);
    setCurrentSrc(images[newIndex]);
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[18px] border-0 bg-transparent shadow-none">
      <CardHeader className="relative mb-3 overflow-hidden rounded-[18px] bg-[#eee9e0] p-0">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          <Image
            src={currentSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 23vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045]"
            onError={() => setCurrentSrc(fallbackImage)}
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/15 to-transparent" />
          {images.length > 1 && (
            <>
              <Button variant="ghost" size="icon" aria-label="Previous image" className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white/85 text-foreground opacity-100 shadow-sm hover:bg-white sm:opacity-0 sm:group-hover:opacity-100" onClick={(e) => changeImage(-1, e)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Next image" className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white/85 text-foreground opacity-100 shadow-sm hover:bg-white sm:opacity-0 sm:group-hover:opacity-100" onClick={(e) => changeImage(1, e)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${index === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`} />)}
              </div>
            </>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-[#faf8f3]/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#51463a] backdrop-blur-sm">{product.category}</span>
          <Button onClick={handleAddToCart} size="icon" aria-label={`Add ${product.name} to bag`} className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-white text-foreground shadow-md transition-transform hover:scale-105 hover:bg-[#f4eee5]">
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow flex-col px-0 py-0">
        <CardTitle className="line-clamp-2 text-[13px] font-medium leading-snug tracking-tight text-foreground sm:text-[15px]">{product.name}</CardTitle>
        <CardDescription className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="mt-3 flex items-center justify-between gap-2 px-0 py-0">
        {product.showPrice ? <p className="text-sm font-semibold tracking-tight text-foreground sm:text-base">{formatPrice(product.price)}</p> : <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Price on request</p>}
        <span className="text-[9px] uppercase tracking-[0.12em] text-[#a48a67]">Discover</span>
      </CardFooter>
    </Card>
  );
}
