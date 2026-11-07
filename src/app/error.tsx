"use client";
import Link from 'next/link';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="section-shell flex min-h-[70dvh] flex-col items-center justify-center text-center"><h1 className="text-3xl font-medium">Something interrupted your visit.</h1><p className="mt-3 text-muted-foreground">Please try again. Your saved bag will still be here.</p><button onClick={reset} className="editorial-button mt-6">Try again</button><Link href="/" className="mt-5 underline">Back to shop</Link></main>;
}
