import { useEffect, useState } from "react";

import { edgeFitImage, type EdgeFittedImage } from "@/lib/edge-fit-image";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * School mark for avatars / dock / settings previews.
 * Trims crop letterboxing, then always contains (never stretches or crops the crest).
 */
export function SchoolLogo({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const resolved = resolveMediaUrl(src) ?? src;
  const [fitted, setFitted] = useState<EdgeFittedImage | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFitted(null);
    void edgeFitImage(src).then((next) => {
      if (!cancelled) setFitted(next);
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  const shown = fitted?.src ?? resolved;

  return (
    <img
      src={shown}
      alt={alt}
      className={cn("h-full w-full object-contain", className)}
    />
  );
}
