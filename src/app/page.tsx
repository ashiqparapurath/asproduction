'use client';
import { Header } from '@/components/header';
import { ProductGrid } from '@/components/product-grid';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import type { Product, Banner } from '@/lib/products';
import { Skeleton } from '@/components/ui/skeleton';


function HomePageContent() {
  const firestore = useFirestore();
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'products'), limit(8));
  }, [firestore]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <Skeleton className="w-full h-64" />
            </CardContent>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardContent className="p-4 pt-0 flex justify-between items-center">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return <ProductGrid products={products || []} />;
}

function BannerCarousel() {
  const firestore = useFirestore();
  const bannersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'banners'), where('isActive', '==', true));
  }, [firestore]);

  const { data: banners, isLoading } = useCollection<Banner>(bannersQuery);

  if (isLoading) {
    return <Skeleton className="w-full h-64 md:h-80 lg:h-96 rounded-lg" />;
  }
  
  if (!banners || banners.length === 0) {
    return null; // Don't show the carousel if there are no active banners
  }

  return (
    <Carousel
      className="w-full"
      opts={{
        align: "start",
        loop: true,
      }}
    >
      <CarouselContent>
        {banners.map((banner) => (
          <CarouselItem key={banner.id}>
            <Card className="border-0 rounded-lg overflow-hidden">
              <CardContent className="relative flex items-center justify-center p-0 h-64 md:h-80 lg:h-96">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative text-center text-white p-4">
                  <h2 className="text-3xl md:text-4xl font-bold">{banner.title}</h2>
                  <p className="mt-2 text-lg md:text-xl">{banner.subtitle}</p>
                  <Button asChild className="mt-4">
                    <Link href={banner.buttonLink}>{banner.buttonText}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex" />
    </Carousel>
  );
}


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-secondary/40">
      <Header />
      <main className="flex-1">
        <section className="bg-background py-12 md:py-20 lg:py-24">
          <div className="container text-center">
            <Badge variant="outline" className="mb-4">Now available</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4">
              The AS Production Collection
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl mb-8">
              Discover our curated selection of high-quality products. Built to last, designed to inspire.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <BannerCarousel />
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <HomePageContent />
        </div>
      </main>
      <footer className="py-8 bg-background text-center text-sm text-muted-foreground border-t">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} AS PRODUCTION. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
