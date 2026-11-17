import { motion } from "motion/react";

import { BRAND } from "@/lib/brand";
import { pushMarketingEvent, type MarketingCtaLocation } from "@/lib/seo/analytics";
import { cn } from "@/lib/utils";

export function StoreBadge({
  variant,
  reduce,
  className,
  onClick,
}: {
  variant: "play" | "apple";
  reduce: boolean | null;
  className?: string;
  onClick?: () => void;
}) {
  const isPlay = variant === "play";

  return (
    <motion.a
      href={isPlay ? BRAND.playStoreUrl : BRAND.appStoreUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={isPlay ? "Get Feezo on Google Play" : "Download Feezo on the App Store"}
      onClick={onClick}
      className={cn(
        "inline-flex h-[42px] min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/15 bg-black px-2.5 text-white shadow-[0_6px_18px_rgba(0,0,0,0.22)] transition-colors sm:h-[44px] sm:min-w-[148px] sm:flex-none sm:gap-2.5 sm:px-3",
        "hover:bg-[#111111]",
        className,
      )}
      whileHover={reduce ? undefined : { y: -2, scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
    >
      {isPlay ? (
        <svg className="h-[22px] w-[22px] shrink-0 sm:h-6 sm:w-6" viewBox="0 0 24 24" aria-hidden>
          {/* Exact Google brand colors from Play Store logo */}
          <path
            fill="#4285F4"
            d="M3.05 1.85C2.55 2.14 2.25 2.68 2.25 3.28v17.44c0 .6.3 1.14.8 1.43L14.1 12 3.05 1.85Z"
          />
          <path fill="#34A853" d="M17.2 8.75 14.1 12 3.05 1.85l14.15 6.9Z" />
          <path
            fill="#FBBC04"
            d="m17.2 8.75 3.55 2.05c.7.4.7 1.4 0 1.8L17.2 14.65 14.1 12l3.1-3.25Z"
          />
          <path fill="#EA4335" d="M17.2 14.65 3.05 22.15 14.1 12l3.1 2.65Z" />
        </svg>
      ) : (
        <svg className="h-[22px] w-[22px] shrink-0 fill-white sm:h-6 sm:w-6" viewBox="0 0 24 24" aria-hidden>
          <path d="M16.4 12c0-2.8 2.3-4.1 2.4-4.2-1.3-1.9-3.3-2.2-4.1-2.2-1.7-.2-3.4 1-4.3 1-.9 0-2.2-1-3.6-1-1.9 0-3.6 1.1-4.6 2.8-2.1 3.5-.5 8.8 1.4 11.6 1 1.4 2.1 2.9 3.6 2.9 1.4 0 2-.9 3.7-.9 1.7 0 2.2.9 3.7.9 1.5 0 2.5-1.4 3.4-2.8.9-1.2 1.2-2.3 1.3-2.4-.1-.1-2.9-1.1-2.9-4.7zM14 3.7c.8-.9 1.3-2.2 1.1-3.5-1.1.1-2.5.7-3.3 1.6-.7.8-1.3 2.1-1.1 3.4 1.3.1 2.5-.6 3.3-1.5z" />
        </svg>
      )}
      <div className="flex min-w-0 flex-col leading-none">
        <span className="truncate text-[9px] font-medium tracking-wide text-white/90 sm:text-[10px]">
          {isPlay ? "GET IT ON" : "Download on the"}
        </span>
        <span className="mt-0.5 truncate text-[14px] font-semibold tracking-tight text-white sm:text-[15px]">
          {isPlay ? "Google Play" : "App Store"}
        </span>
      </div>
    </motion.a>
  );
}

/** Side-by-side App Store + Google Play badges for marketing CTAs. */
export function StoreBadgeRow({
  reduce,
  ctaLocation,
  className,
}: {
  reduce: boolean | null;
  ctaLocation: MarketingCtaLocation;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full max-w-[17.5rem] items-stretch gap-2 sm:max-w-none sm:w-auto",
        className,
      )}
    >
      <StoreBadge
        variant="apple"
        reduce={reduce}
        className="min-w-0 flex-1 sm:flex-none"
        onClick={() =>
          pushMarketingEvent("app_download_click", {
            cta_location: ctaLocation,
            store: "app_store",
          })
        }
      />
      <StoreBadge
        variant="play"
        reduce={reduce}
        className="min-w-0 flex-1 sm:flex-none"
        onClick={() =>
          pushMarketingEvent("app_download_click", {
            cta_location: ctaLocation,
            store: "google_play",
          })
        }
      />
    </div>
  );
}
