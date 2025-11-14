import { Header } from '@/components/header';
import { ProductGrid } from '@/components/product-grid';
import { products } from '@/lib/products';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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

export default function Home() {
  const bannerImages = PlaceHolderImages.filter(img => img.id.startsWith('banner_'));

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
           <Carousel
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              <CarouselItem>
                <Card className="border-0 rounded-lg overflow-hidden">
                  <CardContent className="relative flex items-center justify-center p-0 h-64 md:h-80 lg:h-96">
                    <Image
                      src={PlaceHolderImages.find(img => img.id === 'banner_img_1')?.imageUrl || ''}
                      alt="Special Offer 1"
                      data-ai-hint="sale fashion"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative text-center text-white p-4">
                      <h2 className="text-3xl md:text-4xl font-bold">Mid-Season Sale</h2>
                      <p className="mt-2 text-lg md:text-xl">Up to 30% off on selected Apparel.</p>
                      <Button asChild className="mt-4">
                        <Link href="#">Shop Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem>
                <Card className="border-0 rounded-lg overflow-hidden">
                  <CardContent className="relative flex items-center justify-center p-0 h-64 md:h-80 lg:h-96">
                    <Image
                      src={PlaceHolderImages.find(img => img.id === 'banner_img_2')?.imageUrl || ''}
                      alt="Special Offer 2"
                      data-ai-hint="new arrivals electronics"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative text-center text-white p-4">
                      <h2 className="text-3xl md:text-4xl font-bold">New Electronics</h2>
                      <p className="mt-2 text-lg md:text-xl">Discover the latest in tech.</p>
                       <Button asChild className="mt-4">
                        <Link href="#">Explore</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
              <CarouselItem>
                <Card className="border-0 rounded-lg overflow-hidden">
                  <CardContent className="relative flex items-center justify-center p-0 h-64 md:h-80 lg:h-96">
                     <Image
                      src={PlaceHolderImages.find(img => img.id === 'banner_img_3')?.imageUrl || ''}
                      alt="Special Offer 3"
                      data-ai-hint="bestselling books"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="relative text-center text-white p-4">
                      <h2 className="text-3xl md:text-4xl font-bold">Bestselling Books</h2>
                      <p className="mt-2 text-lg md:text-xl">Expand your library with top titles.</p>
                       <Button asChild className="mt-4">
                        <Link href="#">Discover Books</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex" />
          </Carousel>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductGrid products={products} />
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
