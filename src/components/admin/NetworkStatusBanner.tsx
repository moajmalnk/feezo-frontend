import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

import {
  getNetworkSnapshot,
  subscribeNetwork,
  type NetworkSnapshot,
} from "@/lib/api/network";
import { cn } from "@/lib/utils";

/**
 * Compact connectivity chip for the control plane.
 * Hidden while healthy; surfaces offline / circuit-open without blocking the shell.
 */
export function NetworkStatusBanner() {
  const [snap, setSnap] = useState<NetworkSnapshot>(() => getNetworkSnapshot());

  useEffect(() => subscribeNetwork(setSnap), []);

  const offline = snap.connectivity === "offline";
  const circuit = snap.circuitOpen && !offline;
  if (!offline && !circuit) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "mb-4 flex items-start gap-2.5 rounded-2xl border px-3.5 py-2.5 sm:items-center sm:px-4",
        offline
          ? "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-100"
          : "border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-100",
      )}
    >
      {offline ? (
        <WifiOff className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" aria-hidden />
      ) : (
        <Wifi className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" aria-hidden />
      )}
      <div className="min-w-0 text-[12.5px] leading-relaxed sm:text-[13px]">
        {offline ? (
          <>
            <span className="font-semibold">You're offline.</span>{" "}
            Control-plane metrics need a live connection to api.feezo.app — they'll reload when
            you're back online.
          </>
        ) : (
          <>
            <span className="font-semibold">API unreachable.</span>{" "}
            Pausing retries briefly after repeated network drops — try again in a few seconds.
          </>
        )}
      </div>
    </div>
  );
}
