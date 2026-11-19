import type { BlogAdminDetail, ContentBlockPayload, TableData } from "@/lib/api/blogs";

/** Keep edge middleware free of browser-only API client imports. */
export const BLOG_SITE_ORIGIN = "https://www.feezo.app";
const BLOG_API_ORIGIN = "https://api.feezo.app";
const BLOG_BRAND_NAME = "Feezo";
const BLOG_BRAND_MARK = "/og/feezo-share.jpg";

const DEFAULT_ROBOTS =
  "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1";

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function sanitizeContentHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*(['"])[\s\S]*?\1/gi, "");
}

function getAuthorName(blog: BlogAdminDetail): string {
  return blog.author?.fullName || blog.author?.username || "Feezo Team";
}

export function resolveBlogMediaUrl(url?: string | null): string | null {
  const thumb = url?.trim();
  if (!thumb) return null;
  if (thumb.startsWith("http://") || thumb.startsWith("https://")) return thumb;
  if (thumb.startsWith("/")) return `${BLOG_API_ORIGIN}${thumb}`;
  return thumb;
}

function renderTableHtml(table: TableData | null | undefined): string {
  if (!table?.rows?.length) return "";
  const caption = table.caption
    ? `<caption>${escapeHtml(table.caption)}</caption>`
    : "";
  const rows = table.rows
    .map((row) => {
      const cells = row.cells
        .map((cell) => {
          const tag = cell.isHeader ? "th" : "td";
          return `<${tag}>${escapeHtml(cell.content || "")}</${tag}>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table>${caption}<tbody>${rows}</tbody></table>`;
}

function renderBlockHtml(block: ContentBlockPayload): string {
  const parts: string[] = [];
  if (block.title?.trim()) {
    parts.push(`<h2>${escapeHtml(block.title.trim())}</h2>`);
  }
  if (block.highlightedText?.trim()) {
    parts.push(`<p><strong>${escapeHtml(block.highlightedText.trim())}</strong></p>`);
  }
  if (block.content?.trim()) {
    parts.push(sanitizeContentHtml(block.content));
  }
  const tableHtml = renderTableHtml(block.table);
  if (tableHtml) parts.push(tableHtml);
  for (const img of block.images || []) {
    const src = resolveBlogMediaUrl(img.url);
    if (src) {
      parts.push(
        `<img src="${escapeHtml(src)}" alt="${escapeHtml(img.alt || block.title || "")}" />`,
      );
    }
  }
  return parts.join("\n");
}

export function buildBlogDescription(blog: BlogAdminDetail): string {
  const meta = blog.metaDescription?.trim();
  if (meta) return meta.length > 160 ? `${meta.slice(0, 157)}...` : meta;
  const excerpt = blog.excerpt?.trim();
  if (excerpt) return excerpt.length > 160 ? `${excerpt.slice(0, 157)}...` : excerpt;
  const blocksText = (blog.contentBlocks ?? [])
    .map((block) => `${block.title ?? ""} ${stripHtml(block.content ?? "")}`)
    .join(" ")
    .trim();
  if (blocksText) {
    return blocksText.length > 160 ? `${blocksText.slice(0, 157)}...` : blocksText;
  }
  return `Read ${blog.title} on the Feezo blog.`;
}

export type BlogRouteMeta = {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
};

export function buildBlogPostMeta(blog: BlogAdminDetail, slug: string): BlogRouteMeta {
  const titleBase = blog.metaTitle?.trim() || blog.title;
  const title = titleBase ? `${titleBase} | Feezo` : "Feezo Blog";
  const description = buildBlogDescription(blog);
  const canonical =
    blog.canonicalUrl?.trim() || `${BLOG_SITE_ORIGIN}/blog/${slug}`;
  const ogImage =
    resolveBlogMediaUrl(blog.ogImageUrl) ||
    resolveBlogMediaUrl(blog.thumbnail) ||
    `${BLOG_SITE_ORIGIN}/og/feezo-share.jpg`;
  return {
    title,
    description,
    canonical,
    robots: blog.robots?.trim() || DEFAULT_ROBOTS,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogUrl: canonical,
  };
}

export function buildBlogBotArticleHtml(blog: BlogAdminDetail, slug: string): string {
  const categoryName = blog.category?.name ?? "General";
  const author = getAuthorName(blog);
  const excerpt = blog.excerpt?.trim();
  const thumbnail = resolveBlogMediaUrl(blog.thumbnail);
  const blocks = [...(blog.contentBlocks ?? [])].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const faqs = [...(blog.faqs ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const blockHtml = blocks.map(renderBlockHtml).filter(Boolean).join("\n");
  const faqHtml =
    faqs.length > 0
      ? `<section aria-label="FAQ"><h2>Frequently Asked Questions</h2>${faqs
          .map(
            (faq) =>
              `<div><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></div>`,
          )
          .join("\n")}</section>`
      : "";

  return `<article>
<nav aria-label="Breadcrumb">
<ol>
<li><a href="${BLOG_SITE_ORIGIN}/">Home</a></li>
<li><a href="${BLOG_SITE_ORIGIN}/blog">Blog</a></li>
<li>${escapeHtml(blog.title)}</li>
</ol>
</nav>
<p><a href="${BLOG_SITE_ORIGIN}/blog?category=${encodeURIComponent(categoryName)}">${escapeHtml(categoryName)}</a></p>
<h1>${escapeHtml(blog.title)}</h1>
${excerpt ? `<p>${escapeHtml(excerpt)}</p>` : ""}
<p>By ${escapeHtml(author)}</p>
${thumbnail ? `<img src="${escapeHtml(thumbnail)}" alt="${escapeHtml(blog.thumbnailAlt || blog.title)}" />` : ""}
${blockHtml}
${faqHtml}
<p><a href="${BLOG_SITE_ORIGIN}/blog/${escapeHtml(slug)}">Read this article on Feezo</a></p>
</article>`;
}

export function buildBlogBotJsonLdScripts(blog: BlogAdminDetail, slug: string): string {
  const meta = buildBlogPostMeta(blog, slug);
  const thumbnail = resolveBlogMediaUrl(blog.ogImageUrl) || resolveBlogMediaUrl(blog.thumbnail);
  const author = getAuthorName(blog);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: meta.description,
    image: thumbnail ? [thumbnail] : [],
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    author: [{ "@type": "Person", name: author }],
    publisher: {
      "@type": "Organization",
      name: BLOG_BRAND_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${BLOG_SITE_ORIGIN}${BLOG_BRAND_MARK}`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": meta.canonical,
    },
    keywords: blog.focusKeyword || undefined,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BLOG_SITE_ORIGIN}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BLOG_SITE_ORIGIN}/blog` },
      { "@type": "ListItem", position: 3, name: blog.title, item: meta.canonical },
    ],
  };

  const faqs = [...(blog.faqs ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const faqLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        }
      : null;

  const scripts = [
    `<script type="application/ld+json">${safeJsonLd(articleLd)}</script>`,
    `<script type="application/ld+json">${safeJsonLd(breadcrumbLd)}</script>`,
  ];
  if (faqLd) {
    scripts.push(`<script type="application/ld+json">${safeJsonLd(faqLd)}</script>`);
  }
  return scripts.join("\n");
}

export async function fetchBlogPublicDetailForBot(
  slug: string,
  apiOrigin = BLOG_API_ORIGIN,
): Promise<BlogAdminDetail | null> {
  try {
    const response = await fetch(
      `${apiOrigin}/api/public/blogs.php?action=detail&slug=${encodeURIComponent(slug)}`,
      { headers: { Accept: "application/json" } },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      success?: boolean;
      data?: { blog?: BlogAdminDetail };
    };
    return payload.data?.blog ?? null;
  } catch {
    return null;
  }
}

export async function fetchBlogSitemapForBot(
  apiOrigin = BLOG_API_ORIGIN,
): Promise<{ slug: string; updatedAt: string }[]> {
  try {
    const response = await fetch(`${apiOrigin}/api/public/blogs.php?action=sitemap`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as {
      success?: boolean;
      data?: { blogs?: { slug: string; updatedAt: string }[] };
    };
    return payload.data?.blogs ?? [];
  } catch {
    return [];
  }
}
