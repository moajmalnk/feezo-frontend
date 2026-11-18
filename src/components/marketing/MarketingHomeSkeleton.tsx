import { HOME_PAGE } from "@/lib/seo/marketing-pages-content";

/**
 * React fallback while the marketing homepage chunk is still downloading.
 * Mirrors the HTML #boot-shell so slow 3G never flashes a blank white page
 * after an early shell dismiss.
 */
export function MarketingHomeSkeleton() {
  return (
    <div
      className="min-h-dvh bg-white text-[#1a1c2c]"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading Feezo homepage"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-[rgba(15,118,110,0.08)]">
        <span className="block h-full w-1/3 animate-[workspace-boot-bar_1.1s_ease-in-out_infinite] rounded-full bg-[#0F766E]" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex items-center gap-2.5">
          <span className="block h-9 w-9 animate-pulse rounded-xl bg-black/[0.07]" />
          <span className="block h-3.5 w-20 animate-pulse rounded-md bg-black/[0.07]" />
        </div>
        <div className="hidden items-center gap-3 md:flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="block h-3 w-14 animate-pulse rounded-md bg-black/[0.06]" />
          ))}
        </div>
        <span className="block h-9 w-28 animate-pulse rounded-full bg-black/[0.07]" />
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-16 pt-6 text-center sm:px-8 sm:pt-8 lg:px-10">
        <p className="text-[14px] font-semibold tracking-[0.08em] text-slate-500 uppercase">
          {HOME_PAGE.eyebrow}
        </p>
        <h1 className="mt-3 text-[clamp(1.85rem,5.5vw,3.25rem)] font-extrabold leading-[1.12] tracking-tight text-[#1a1c2c]">
          {HOME_PAGE.h1}
        </h1>
        <p className="mt-3 text-[clamp(1.05rem,2.4vw,1.35rem)] font-semibold text-[#3f7a1f]">
          {HOME_PAGE.tagline}
        </p>

        <div className="skeleton-shimmer relative mx-auto mt-8 aspect-[16/9] w-full max-w-[1040px] overflow-hidden rounded-2xl bg-black/[0.05] sm:mt-10" />

        <div className="mx-auto mt-10 flex max-w-lg flex-col items-center gap-3 sm:mt-12">
          <span className="block h-3.5 w-full animate-pulse rounded-md bg-black/[0.06]" />
          <span className="block h-3.5 w-[88%] animate-pulse rounded-md bg-black/[0.06]" />
          <span className="block h-3.5 w-[72%] animate-pulse rounded-md bg-black/[0.06]" />
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="block h-11 w-44 animate-pulse rounded-lg bg-[#8FCA4A]/35" />
          <span className="block h-11 w-36 animate-pulse rounded-lg bg-black/[0.06]" />
        </div>
      </main>
    </div>
  );
}
