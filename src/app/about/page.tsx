import { Header } from '@/components/header';
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-12 md:py-20 lg:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                About AS PRODUCTION
              </h1>
              <p className="text-lg text-muted-foreground">
                Founded in 2024, AS PRODUCTION was born from a passion for creating high-quality, durable, and inspiring products. We believe that good design is about more than just aesthetics; it's about creating something that lasts and brings joy to your everyday life.
              </p>
              <p className="text-lg text-muted-foreground">
                Our mission is to curate a collection that reflects our commitment to craftsmanship and innovation. From the latest electronics to timeless apparel and captivating books, every item in our store is selected with care.
              </p>
            </div>
            <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
               <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwd29ya2luZ3xlbnwwfHx8fDE3NjM0MzkzOTF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Our Team"
                data-ai-hint="team working"
                fill
                className="object-cover"
              />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
               <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-bold text-xl">Our Commitment to Excellence</p>
               </div>
            </div>
          </div>
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
