export default function Loading() {
  return (
    <main role="status" aria-label="Loading TreatStory" className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f3] px-6 text-[#211d19] dark:bg-[#171411] dark:text-[#faf8f3]">
      <div className="flex h-32 w-32 items-center justify-center rounded-[30px] bg-white shadow-[0_18px_60px_rgba(0,0,0,0.06)] dark:bg-black">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcSet="/ts%20logo%20white.png" />
          <img src="/ts%20logo%20black.png" alt="TreatStory" className="h-24 w-24 object-contain" />
        </picture>
      </div>
      <p className="brand-wordmark mt-7 text-3xl tracking-tight">TreatStory</p>
      <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-[#98826b]">Little finds, lovely stories</p>
      <div className="mt-8 h-[2px] w-14 overflow-hidden rounded-full bg-[#e5ddd2] dark:bg-[#40382f]"><div className="h-full w-1/2 animate-pulse rounded-full bg-[#a68a64]" /></div>
    </main>
  );
}
