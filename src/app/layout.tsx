import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';
import { CartProvider } from '@/context/cart-context';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { HostUrl } from '@/components/host-url';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'AS PRODUCTION',
  description: 'An e-commerce platform for showcasing products.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
       <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F0F4EF" />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <FirebaseClientProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </FirebaseClientProvider>
        <Toaster />
        <footer className="py-4 bg-background text-center text-sm text-muted-foreground border-t">
          <HostUrl />
        </footer>
      </body>
    </html>
  );
}
