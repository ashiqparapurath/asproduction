import Image from 'next/image';
import type { Product } from '@/lib/products';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const image = PlaceHolderImages.find((img) => img.id === product.imageId);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const WHATSAPP_NUMBER = "15551234567"; // Replace with your WhatsApp number
  const message = `Hello, I am interested in the product: ${product.name} - Price: ${formatPrice(product.price)}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group bg-card">
      <CardHeader className="p-0 border-b">
        <div className="relative w-full aspect-square overflow-hidden">
          {image && (
            <Image
              src={image.imageUrl}
              alt={product.name}
              data-ai-hint={image.imageHint}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col">
        <Badge variant="secondary" className="w-fit mb-2 capitalize">{product.category}</Badge>
        <CardTitle className="text-lg font-semibold leading-tight mb-2 flex-grow">{product.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2">{product.description}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
        <Button asChild size="icon" className="md:w-auto md:px-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Send className="h-4 w-4 md:mr-2" />
            <span className="sr-only md:not-sr-only">Order</span>
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
