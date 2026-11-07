import { Skeleton } from '@/components/ui/skeleton';

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return <div role="status" aria-label="Loading products" className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4"><span className="sr-only">Loading products…</span>{Array.from({ length: count }, (_, i) => <Skeleton key={i} className="aspect-[3/4] w-full rounded-[22px]" />)}</div>;
}

export function SectionSkeleton() {
  return <div role="status" aria-label="Loading content" className="space-y-5 py-6"><span className="sr-only">Loading…</span><Skeleton className="h-8 w-48" /><div className="grid gap-4 sm:grid-cols-2">{[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div></div>;
}

export function LoadError({ retry }: { retry: () => void }) {
  return <div role="alert" className="rounded-2xl border bg-white p-6"><p className="font-medium">We couldn’t load this section.</p><p className="mt-2 text-sm text-muted-foreground">Check your connection and try again.</p><button type="button" onClick={retry} className="mt-4 min-h-11 rounded-xl border px-5 text-sm font-semibold">Try again</button></div>;
}
