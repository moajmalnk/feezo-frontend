/// <reference lib="webworker" />
/**
 * Feezo service worker (injectManifest).
 *
 * Why this exists: generateSW's navigateFallback served /index.html for every
 * SPA navigation. When the edge redirected /index.html → / (or the precache
 * entry was itself a redirected Response), Chrome rejected it for navigations
 * (redirect mode "manual") → ERR_FAILED. Offline still needs a shell, so we:
 *   1) network-first the real navigation URL (Vercel rewrite → 200 HTML)
 *   2) pass through opaqueredirect so intentional 30x still work
 *   3) fall back to a navigation-safe precached /index.html
 */
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import {
  cleanupOutdatedCaches,
  matchPrecache,
  precacheAndRoute,
  type PrecacheEntry,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst, NetworkOnly } from "workbox-strategies";

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: (string | PrecacheEntry)[];
};

const SPA_SHELL = "/index.html";

/** Paths the SW must never claim (let the network / edge handle them). */
const NAVIGATION_DENYLIST: RegExp[] = [
  /^\/api\//,
  /^\/assets\//,
  /^\/og\//,
  /^\/home\//,
  /^\/manifest\.webmanifest$/,
  /^\/family\.webmanifest$/,
  /^\/version\.json$/,
  /^\/sw\.js$/,
  /^\/workbox-.*\.js$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/llms\.txt$/,
  /^\/llm\.txt$/,
  /^\/not-found\.html$/,
  /\.(?:js|mjs|css|map|png|jpe?g|gif|webp|svg|ico|woff2?|mp4|webmanifest|txt|xml|json|pdf)$/i,
];

/**
 * Navigations use redirect:"manual". A Response with redirected===true is
 * turned into a network error (Chrome ERR_FAILED). Rebuild a clean copy.
 */
async function toNavigationSafeResponse(response: Response): Promise<Response> {
  if (!response.redirected) return response;
  const body = await response.arrayBuffer();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

async function handleNavigation({ request }: { request: Request }): Promise<Response> {
  try {
    // Keep the original Request so redirect mode stays "manual". Real HTTP
    // redirects surface as opaqueredirect and the browser follows them.
    const networkResponse = await fetch(request);

    if (networkResponse.type === "opaqueredirect") {
      return networkResponse;
    }

    if (networkResponse.ok) {
      return toNavigationSafeResponse(networkResponse);
    }
  } catch {
    // Offline or transient failure — use precached shell below.
  }

  const cached = await matchPrecache(SPA_SHELL);
  if (cached) {
    return toNavigationSafeResponse(cached);
  }

  try {
    const shell = await fetch(SPA_SHELL, {
      credentials: "same-origin",
      redirect: "follow",
      cache: "reload",
    });
    if (shell.ok) return toNavigationSafeResponse(shell);
  } catch {
    /* ignore */
  }

  return Response.error();
}

// Precache build assets; drop previous Workbox precache names on activate.
precacheAndRoute(self.__WB_MANIFEST, {
  // Hard-refresh + analytics params must not miss the precache key.
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^_refresh$/],
});
cleanupOutdatedCaches();

// Prompt-mode updates: vite-plugin-pwa posts SKIP_WAITING from the page.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});

// Workbox helper registers its own activate listener (returns void, not a Promise).
clientsClaim();

registerRoute(
  new NavigationRoute(handleNavigation, {
    denylist: NAVIGATION_DENYLIST,
  }),
);

registerRoute(
  ({ sameOrigin, url }) => sameOrigin && url.pathname === "/version.json",
  new NetworkOnly(),
);

registerRoute(
  ({ sameOrigin, url }) => sameOrigin && url.pathname.startsWith("/api/"),
  new NetworkOnly(),
);

registerRoute(
  /^https:\/\/fonts\.googleapis\.com\/.*/i,
  new CacheFirst({
    cacheName: "google-fonts-stylesheets",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  }),
);

registerRoute(
  /^https:\/\/fonts\.gstatic\.com\/.*/i,
  new CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  }),
);
