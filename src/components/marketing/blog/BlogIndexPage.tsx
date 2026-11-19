import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Search } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchPublicBlogCategories,
  fetchPublicBlogs,
  type BlogAdmin,
  type BlogCategory,
} from "@/lib/api/blogs";
import { resolveMediaUrl } from "@/lib/media";
import { applyDocumentSeo, SITE_ORIGIN } from "@/lib/seo/public-pages";
import { cn } from "@/lib/utils";

const ALL_CATEGORIES = "__all__";

const categoryTriggerClass =
  "h-11 w-full rounded-full border border-black/10 bg-white px-4 text-sm text-[var(--mkt-ink)] shadow-none focus:border-[var(--mkt-green)] focus:ring-2 focus:ring-[var(--mkt-green)] focus:ring-offset-0 sm:w-56 data-[placeholder]:text-black/35";

const categoryContentClass =
  "z-[130] rounded-2xl border border-black/10 bg-white p-1.5 text-[var(--mkt-ink)] shadow-[0_18px_48px_-18px_rgba(26,28,44,0.45)]";

const categoryItemClass =
  "cursor-pointer rounded-xl py-2.5 pl-3 pr-8 text-sm focus:bg-[var(--mkt-soft)] focus:text-[var(--mkt-ink)] data-[state=checked]:bg-[var(--mkt-soft)] data-[state=checked]:font-semibold";

export function BlogIndexPage() {
  const [blogs, setBlogs] = useState<BlogAdmin[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applyDocumentSeo({
      path: "/blog",
      canonical: `${SITE_ORIGIN}/blog`,
      title: "Feezo Blog | School Fee Management Insights",
      description:
        "Guides and insights on school fee collection, receipts, reminders, and accounts from the Feezo team.",
      ogTitle: "Feezo Blog",
      ogDescription:
        "Guides and insights on school fee collection, receipts, reminders, and accounts.",
      ogUrl: `${SITE_ORIGIN}/blog`,
      ogImage: `${SITE_ORIGIN}/og/feezo-share.jpg`,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Feezo Blog",
          url: `${SITE_ORIGIN}/blog`,
          publisher: { "@type": "Organization", name: "Feezo" },
        },
      ],
    });
  }, []);

  useEffect(() => {
    void fetchPublicBlogCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void (async () => {
        setLoading(true);
        try {
          const res = await fetchPublicBlogs({
            page,
            limit: 12,
            search: search.trim() || undefined,
            category: category || undefined,
          });
          setBlogs(res.data);
          setTotalPages(res.totalPages);
        } catch {
          setBlogs([]);
        } finally {
          setLoading(false);
        }
      })();
    }, 250);
    return () => clearTimeout(t);
  }, [page, search, category]);

  return (
    <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--mkt-green-deep)]">
          Blog
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--mkt-ink)] sm:text-4xl">
          School fee management insights
        </h1>
        <p className="mt-3 text-[var(--mkt-ink)]/65">
          Practical guides for schools and academies collecting fees, issuing receipts, and
          running accounts with Feezo.
        </p>
      </header>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search articles…"
            className="h-11 w-full rounded-full border border-black/10 bg-white pl-10 pr-4 text-sm outline-none ring-[var(--mkt-green)] focus:ring-2"
          />
        </div>
        <Select
          value={category || ALL_CATEGORIES}
          onValueChange={(value) => {
            setCategory(value === ALL_CATEGORIES ? "" : value);
            setPage(1);
          }}
        >
          <SelectTrigger
            aria-label="Filter by category"
            className={categoryTriggerClass}
          >
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent className={categoryContentClass} position="popper" align="end">
            <SelectItem value={ALL_CATEGORIES} className={categoryItemClass}>
              All categories
            </SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.name} className={categoryItemClass}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center text-black/45">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : blogs.length === 0 ? (
        <p className="mt-16 text-center text-black/45">No published articles yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <article
              key={blog.id}
              className={cn(
                "flex flex-col overflow-hidden rounded-2xl border border-black/8 bg-white",
                "shadow-[0_18px_50px_-36px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5",
              )}
            >
              <Link to="/blog/$slug" params={{ slug: blog.slug }} className="block">
                {blog.thumbnail ? (
                  <img
                    src={resolveMediaUrl(blog.thumbnail)}
                    alt={blog.thumbnailAlt || blog.title}
                    className="aspect-[16/10] w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center bg-[var(--mkt-green)]/10 text-sm font-semibold text-[var(--mkt-green-deep)]">
                    Feezo Blog
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-[var(--mkt-green-deep)]">
                  {blog.category?.name}
                </div>
                <h2 className="mt-1 text-lg font-semibold leading-snug text-[var(--mkt-ink)]">
                  <Link to="/blog/$slug" params={{ slug: blog.slug }}>
                    {blog.title}
                  </Link>
                </h2>
                {blog.excerpt ? (
                  <p className="mt-2 line-clamp-3 text-sm text-[var(--mkt-ink)]/60">
                    {blog.excerpt}
                  </p>
                ) : null}
                <div className="mt-auto pt-4 text-xs text-black/40">
                  {blog.readTime || ""}
                  {blog.featured ? " · Featured" : ""}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="text-sm text-black/50">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="rounded-full border border-black/10 px-4 py-2 text-sm disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      ) : null}
    </main>
  );
}
