import { useEffect, useState } from "react";

import { edgeFitImage } from "@/lib/edge-fit-image";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * School mark for avatars / dock / settings previews.
 * Shows the resolved URL immediately; edge-fit trim swaps in when ready
 * (never blocks first paint, never depends on a cancelled cross-origin race).
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
  const [shown, setShown] = useState(resolved);

  useEffect(() => {
    setShown(resolved);
    let cancelled = false;
    void edgeFitImage(resolved)
      .then((next) => {
        if (!cancelled && next?.src) setShown(next.src);
      })
      .catch(() => {
        /* keep resolved URL */
      });
    return () => {
      cancelled = true;
    };
  }, [resolved]);

  return (
    <img
      src={shown}
      alt={alt}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        // Blob trim failed — fall back to the stable media URL once.
        if (shown !== resolved) setShown(resolved);
      }}
      className={cn("h-full w-full object-contain", className)}
    />
  );
}
