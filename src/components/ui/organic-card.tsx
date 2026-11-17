import { ArrowUpRight } from "lucide-react";
import * as React from "react";

import { cn, cornerClasses, toneClasses, type CornerSide, type Tone } from "@/lib/utils";

type OrganicCardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: Tone;
  cornerSide?: CornerSide;
  arrow?: boolean;
  onArrowClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  arrowAriaLabel?: string;
  padded?: boolean;
};

const SHADOW = "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_60px_-32px_rgba(0,0,0,0.18)]";

/** Room for the absolute arrow control — tighter on narrow screens. */
const contentPadByCorner: Record<CornerSide, string> = {
  tr: "pr-11 sm:pr-12",
  tl: "pl-11 sm:pl-12",
  br: "pr-11 pb-11 sm:pr-12 sm:pb-12",
  bl: "pl-11 pb-11 sm:pl-12 sm:pb-12",
};

export function OrganicCard({
  tone = "white",
  cornerSide = "tr",
  arrow = false,
  onArrowClick,
  arrowAriaLabel = "Open detail",
  padded = false,
  className,
  children,
  ...rest
}: OrganicCardProps) {
  return (
    <div
      {...rest}
      className={cn(
        // overflow-x-clip keeps wide children (charts, long mono IPs) from expanding the page.
        "organic-card relative min-w-0 max-w-full overflow-x-clip",
        toneClasses[tone],
        cornerClasses[cornerSide],
        SHADOW,
        padded ? "p-3.5 sm:p-6" : "",
        className,
      )}
    >
      {arrow ? (
        <div className={cn("relative min-w-0 max-w-full", contentPadByCorner[cornerSide])}>
          {children}
        </div>
      ) : (
        children
      )}
      {arrow && (
        <ArrowGlyph
          tone={tone}
          cornerSide={cornerSide}
          onClick={onArrowClick}
          aria-label={arrowAriaLabel}
        />
      )}
    </div>
  );
}

type ArrowGlyphProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  cornerSide?: CornerSide;
};

export function ArrowGlyph({
  tone = "white",
  cornerSide = "tr",
  className,
  onClick,
  ...rest
}: ArrowGlyphProps) {
  const isOnHighlight = tone === "lime";
  const isOnBlack = tone === "black";

  // Position floats opposite the cut corner on the same edge for a balanced silhouette.
  const positionByCorner: Record<CornerSide, string> = {
    tr: "absolute right-3 top-3 sm:right-4 sm:top-4",
    tl: "absolute left-3 top-3 sm:left-4 sm:top-4",
    bl: "absolute left-3 bottom-3 sm:left-4 sm:bottom-4",
    br: "absolute right-3 bottom-3 sm:right-4 sm:bottom-4",
  };

  const inkClass = isOnHighlight
    ? "bg-white text-[#0F766E] hover:bg-white/90"
    : isOnBlack
      ? "bg-white text-[#0F172A] hover:bg-white/90"
      : "bg-white text-[#0F172A] border border-[#0F172A] hover:bg-[#0F172A] hover:text-white";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={cn(
        positionByCorner[cornerSide],
        "z-10 grid h-9 w-9 place-items-center rounded-full transition-colors sm:h-10 sm:w-10",
        "shadow-[0_2px_8px_rgba(0,0,0,0.08)]",
        inkClass,
        className,
      )}
      {...rest}
    >
      <ArrowUpRight className="h-4 w-4" strokeWidth={2.25} />
    </button>
  );
}
