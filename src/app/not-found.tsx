import Link from 'next/link';
export default function NotFound() { return <main className="section-shell flex min-h-[70dvh] flex-col items-center justify-center text-center"><p className="eyebrow">404</p><h1 className="mt-3 text-3xl">This page couldn’t be found.</h1><Link href="/products" className="editorial-button mt-6">Explore the collection</Link></main>; }
