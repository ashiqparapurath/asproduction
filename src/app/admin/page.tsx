import { Header } from '@/components/header';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-12 md:py-20 lg:py-24">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
              Admin Panel
            </h1>
            <p className="text-lg text-muted-foreground">
              Welcome to the admin panel. Here you will be able to add, edit, and delete products.
            </p>
            <p className="text-lg text-red-500 font-bold">
              Note: This page is not yet secure. We will add authentication in the next step.
            </p>
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
