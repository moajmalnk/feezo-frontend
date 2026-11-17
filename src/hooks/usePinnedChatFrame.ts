import { useEffect, useRef } from "react";

type PinnedChatFrameOptions = {
  /** Defaults to the tenant mobile header. Super-admin uses `[data-super-admin-header]`. */
  headerSelector?: string;
  /** Match media for when pinning is active. Defaults to below `lg`. */
  mediaQuery?: string;
};

/**
 * Pins a chat shell between the sticky header and the tab dock, then
 * shrinks with the visual viewport so the composer stays above the keyboard.
 * Uses `left/right: 0` (not percentage width) so negative margins never expand
 * the layout viewport — a common cause of clipped mobile nav.
 */
export function usePinnedChatFrame(active: boolean, options?: PinnedChatFrameOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const headerSelector = options?.headerSelector ?? "[data-tenant-mobile-header]";
  const mediaQuery = options?.mediaQuery ?? "(max-width: 1023.98px)";

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;

    const mq = window.matchMedia(mediaQuery);

    const headerPx = () => {
      const header = document.querySelector<HTMLElement>(headerSelector);
      return header ? Math.round(header.getBoundingClientRect().height) : 64;
    };

    const dockPx = () => {
      const dock = document.querySelector<HTMLElement>("[data-mobile-tab-dock]");
      return dock ? Math.round(dock.getBoundingClientRect().height) : 84;
    };

    const clearInline = () => {
      el.style.position = "";
      el.style.top = "";
      el.style.left = "";
      el.style.right = "";
      el.style.bottom = "";
      el.style.width = "";
      el.style.height = "";
      el.style.zIndex = "";
      el.style.maxWidth = "";
    };

    const apply = () => {
      if (!mq.matches) {
        clearInline();
        document.body.style.removeProperty("overflow");
        return;
      }
      document.body.style.overflow = "hidden";
      const vv = window.visualViewport;
      const visTop = vv?.offsetTop ?? 0;
      const visH = vv?.height ?? window.innerHeight;
      const overlapHeader = Math.max(0, headerPx() - visTop);
      const keyboardOpen = window.innerHeight - visH > 80;
      const dock = keyboardOpen ? 0 : dockPx();
      el.style.position = "fixed";
      el.style.left = "0px";
      el.style.right = "0px";
      el.style.width = "100%";
      el.style.maxWidth = "100vw";
      el.style.bottom = "auto";
      el.style.zIndex = "35";
      el.style.top = `${visTop + overlapHeader}px`;
      el.style.height = `${Math.max(220, visH - overlapHeader - dock)}px`;
    };

    apply();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", apply);
    vv?.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    mq.addEventListener("change", apply);
    return () => {
      vv?.removeEventListener("resize", apply);
      vv?.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      mq.removeEventListener("change", apply);
      document.body.style.removeProperty("overflow");
      clearInline();
    };
  }, [active, headerSelector, mediaQuery]);

  return ref;
}
