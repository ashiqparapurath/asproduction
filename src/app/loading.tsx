export default function Loading() {
  return <main role="status" aria-label="Loading TreatStory" className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#faf8f3] px-6 py-12 text-[#211d19]">
    <img src="/icons/app-192.png" alt="TreatStory" width={112} height={112} loading="eager" className="h-28 w-28 object-contain" />
    <p className="brand-wordmark mt-4 text-3xl">TreatStory</p>
    <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-[#98826b]">Little finds, lovely stories</p>
    <span className="mt-8 h-1 w-12 animate-pulse rounded-full bg-[#b49a78]" aria-hidden="true" />
    <span className="sr-only">Loading…</span>
  </main>;
}
