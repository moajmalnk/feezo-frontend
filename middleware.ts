/**
 * Serve a real HTTP 404 for unknown paths while keeping SPA routes on index.html.
 * Prerendered marketing pages are left to the filesystem.
 * Blog posts: inject bot-readable HTML + JSON-LD; dynamic sitemap merges published posts.
 */

import {
  buildBlogBotArticleHtml,
  buildBlogBotJsonLdScripts,
  buildBlogPostMeta,
  escapeHtml,
  fetchBlogPublicDetailForBot,
  fetchBlogSitemapForBot,
  BLOG_SITE_ORIGIN,
} from "./src/lib/seo/blogBotHtml.js";

const PRERENDERED = new Set([
  "/",
  "/why-feezo",
  "/who-is-feezo-for",
  "/product",
  "/features",
  "/setup",
  "/pricing",
  "/contact",
  "/support",
  "/download",
]);

const SPA_PREFIXES = [
  "/login",
  "/signup",
  "/tenant",
  "/super-admin",
  "/family",
  "/forgot-password",
  "/reset-password",
  "/impersonate",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/payment-policy",
  "/data-deletion",
  "/staff",
  "/parent",
  "/home",
  "/blog",
] as const;

const BOT_USER_AGENTS = [
  "googlebot",
  "bingbot",
  "yandex",
  "duckduckbot",
  "baiduspider",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "slackbot",
  "whatsapp",
  "telegrambot",
  "discordbot",
  "applebot",
  "pinterestbot",
  "screaming frog",
  "ahrefsbot",
  "semrushbot",
];

const STATIC_SITEMAP: { loc: string; changefreq: string; priority: string }[] = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/why-feezo", changefreq: "monthly", priority: "0.9" },
  { loc: "/who-is-feezo-for", changefreq: "monthly", priority: "0.9" },
  { loc: "/product", changefreq: "monthly", priority: "0.9" },
  { loc: "/features", changefreq: "monthly", priority: "0.9" },
  { loc: "/setup", changefreq: "monthly", priority: "0.8" },
  { loc: "/pricing", changefreq: "weekly", priority: "0.9" },
  { loc: "/download", changefreq: "monthly", priority: "0.8" },
  { loc: "/contact", changefreq: "monthly", priority: "0.7" },
  { loc: "/support", changefreq: "monthly", priority: "0.7" },
  { loc: "/blog", changefreq: "daily", priority: "0.8" },
  { loc: "/signup", changefreq: "monthly", priority: "0.6" },
];

function isSpaPath(pathname: string): boolean {
  return SPA_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function hasFileExtension(pathname: string): boolean {
  const last = pathname.split("/").pop() ?? "";
  return last.includes(".");
}

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

function normalizePathname(pathname: string): string {
  if (pathname.length <= 1) return pathname || "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function passthrough(): Response {
  return new Response(null, {
    headers: { "x-middleware-next": "1" },
  });
}

function replaceOrInsert(html: string, regex: RegExp, tag: string): string {
  return regex.test(html) ? html.replace(regex, tag) : html.replace("</head>", `${tag}\n</head>`);
}

function injectMeta(
  html: string,
  meta: {
    title: string;
    description: string;
    canonical: string;
    robots: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogUrl: string;
  },
): string {
  html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
  html = replaceOrInsert(
    html,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
  );
  html = replaceOrInsert(
    html,
    /<meta\s+name=["']robots["'][^>]*>/i,
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`,
  );
  html = replaceOrInsert(
    html,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`,
  );
  html = replaceOrInsert(
    html,
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${escapeHtml(meta.ogTitle)}" />`,
  );
  html = replaceOrInsert(
    html,
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${escapeHtml(meta.ogDescription)}" />`,
  );
  html = replaceOrInsert(
    html,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${escapeHtml(meta.ogUrl)}" />`,
  );
  html = replaceOrInsert(
    html,
    /<meta\s+property=["']og:image["'][^>]*>/i,
    `<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`,
  );
  return html;
}

function injectHeadScripts(html: string, scripts: string): string {
  if (!scripts) return html;
  return html.replace("</head>", `${scripts}\n</head>`);
}

function injectArticleIntoRoot(html: string, articleHtml: string): string {
  if (!articleHtml) return html;
  if (/<div\s+id=["']root["']\s*>\s*<\/div>/i.test(html)) {
    return html.replace(
      /<div\s+id=["']root["']\s*>\s*<\/div>/i,
      `<div id="root">${articleHtml}</div>`,
    );
  }
  return html.replace("</body>", `${articleHtml}\n</body>`);
}

async function buildSitemapXml(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const route of STATIC_SITEMAP) {
    lines.push(`  <url>
    <loc>${BLOG_SITE_ORIGIN}${route.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`);
  }
  const blogs = await fetchBlogSitemapForBot();
  for (const blog of blogs) {
    const lastmod = (blog.updatedAt || today).slice(0, 10);
    lines.push(`  <url>
    <loc>${BLOG_SITE_ORIGIN}/blog/${encodeURIComponent(blog.slug).replace(/%2F/g, "/")}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
  }
  lines.push("</urlset>");
  return lines.join("\n");
}

export const config = {
  matcher: ["/((?!assets/|og/|home/|api/|sw\\.js|workbox-|.*\\..*).*)", "/sitemap.xml"],
};

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;

  if (pathname === "/sitemap.xml") {
    const xml = await buildSitemapXml();
    return new Response(xml, {
      status: 200,
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  }

  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    const destination = new URL(request.url);
    destination.pathname = normalizePathname(url.pathname);
    return Response.redirect(destination.toString(), 301);
  }

  const normalized = normalizePathname(pathname);

  // Bot SEO for blog posts
  if (isBot(request.headers.get("user-agent")) && normalized.startsWith("/blog/")) {
    const parts = normalized.split("/").filter(Boolean);
    if (parts.length === 2) {
      const slug = parts[1]!;
      const blog = await fetchBlogPublicDetailForBot(slug);
      if (!blog) {
        const notFoundUrl = new URL("/not-found.html", url.origin);
        const page = await fetch(notFoundUrl);
        return new Response(page.body, {
          status: 404,
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "no-cache, no-store, must-revalidate",
          },
        });
      }
      const meta = buildBlogPostMeta(blog, slug);
      const articleHtml = buildBlogBotArticleHtml(blog, slug);
      const jsonLdScripts = buildBlogBotJsonLdScripts(blog, slug);
      const response = await fetch(request);
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) return response;
      let html = injectMeta(await response.text(), meta);
      html = injectHeadScripts(html, jsonLdScripts);
      html = injectArticleIntoRoot(html, articleHtml);
      const headers = new Headers(response.headers);
      headers.delete("content-encoding");
      headers.delete("content-length");
      return new Response(html, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }
  }

  if (hasFileExtension(pathname) || PRERENDERED.has(normalized) || isSpaPath(normalized)) {
    return passthrough();
  }

  const notFoundUrl = new URL("/not-found.html", url.origin);
  const page = await fetch(notFoundUrl);
  return new Response(page.body, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-cache, no-store, must-revalidate",
    },
  });
}
