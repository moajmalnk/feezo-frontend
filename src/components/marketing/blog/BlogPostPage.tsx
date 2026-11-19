import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, X } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchPublicBlogDetail,
  fetchRelatedBlogs,
  submitBlogCta,
  submitBlogLead,
  type BlogAdmin,
  type BlogAdminDetail,
  type ContentBlockCTAPayload,
  type FormFieldPayload,
} from "@/lib/api/blogs";
import { resolveMediaUrl } from "@/lib/media";
import {
  buildBlogBotJsonLdScripts,
  buildBlogPostMeta,
} from "@/lib/seo/blogBotHtml";
import { applyDocumentSeo } from "@/lib/seo/public-pages";
import { cn } from "@/lib/utils";

function BlogPostSkeleton() {
  return (
    <main
      id="main"
      className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-28 sm:px-6"
      aria-busy="true"
      aria-label="Loading article"
    >
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-10 bg-black/[0.05]" />
        <Skeleton className="h-3.5 w-2 bg-black/[0.04]" />
        <Skeleton className="h-3.5 w-10 bg-black/[0.05]" />
        <Skeleton className="h-3.5 w-2 bg-black/[0.04]" />
        <Skeleton className="h-3.5 w-40 bg-black/[0.05]" />
      </div>
      <Skeleton className="mt-4 h-3 w-28 rounded-full bg-black/[0.06]" />
      <Skeleton className="mt-3 h-9 w-[95%] bg-black/[0.08] sm:h-10" />
      <Skeleton className="mt-2 h-9 w-[70%] bg-black/[0.07] sm:h-10" />
      <Skeleton className="mt-4 h-4 w-full bg-black/[0.05]" />
      <Skeleton className="mt-2 h-4 w-[88%] bg-black/[0.05]" />
      <Skeleton className="mt-4 h-3.5 w-56 bg-black/[0.04]" />
      <Skeleton className="mt-8 aspect-[16/9] w-full rounded-2xl bg-black/[0.06]" />
      <div className="mt-10 space-y-3">
        <Skeleton className="h-6 w-48 bg-black/[0.07]" />
        <Skeleton className="h-3.5 w-full bg-black/[0.05]" />
        <Skeleton className="h-3.5 w-full bg-black/[0.05]" />
        <Skeleton className="h-3.5 w-[92%] bg-black/[0.05]" />
        <Skeleton className="h-3.5 w-[80%] bg-black/[0.05]" />
        <Skeleton className="mt-6 h-6 w-56 bg-black/[0.07]" />
        <Skeleton className="h-3.5 w-full bg-black/[0.05]" />
        <Skeleton className="h-3.5 w-[90%] bg-black/[0.05]" />
        <Skeleton className="h-3.5 w-[70%] bg-black/[0.05]" />
      </div>
    </main>
  );
}

function LeadFormFields({
  fields,
  values,
  onChange,
}: {
  fields: FormFieldPayload[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
}) {
  return (
    <div className="space-y-3">
      {fields.map((field, i) => {
        const id = field.id || `f-${i}`;
        const common = {
          id,
          required: field.required,
          placeholder: field.placeholder || undefined,
          value: values[id] || "",
          onChange: (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => onChange(id, e.target.value),
          className:
            "w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--mkt-green)]",
        };
        return (
          <div key={id} className="space-y-1">
            <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide text-black/50">
              {field.label}
              {field.required ? " *" : ""}
            </label>
            {field.fieldType === "textarea" ? (
              <textarea {...common} rows={3} />
            ) : (
              <input
                {...common}
                type={
                  field.fieldType === "email"
                    ? "email"
                    : field.fieldType === "phone"
                      ? "tel"
                      : field.fieldType === "number"
                        ? "number"
                        : field.fieldType === "date"
                          ? "date"
                          : "text"
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function BlogPostPage({ slug }: { slug: string }) {
  const [blog, setBlog] = useState<BlogAdminDetail | null>(null);
  const [related, setRelated] = useState<BlogAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupValues, setPopupValues] = useState<Record<string, string>>({});
  const [popupDone, setPopupDone] = useState<string | null>(null);
  const [ctaOpen, setCtaOpen] = useState<ContentBlockCTAPayload | null>(null);
  const [ctaValues, setCtaValues] = useState<Record<string, string>>({});
  const [ctaDone, setCtaDone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const detail = await fetchPublicBlogDetail(slug);
        if (cancelled) return;
        setBlog(detail);
        const meta = buildBlogPostMeta(detail, slug);
        applyDocumentSeo({
          path: `/blog/${slug}`,
          canonical: meta.canonical,
          title: meta.title,
          description: meta.description,
          ogTitle: meta.ogTitle,
          ogDescription: meta.ogDescription,
          ogUrl: meta.ogUrl,
          ogImage: meta.ogImage,
          noindex: meta.robots.toLowerCase().includes("noindex"),
          jsonLd: [],
        });
        // Inject JSON-LD for clients
        const existing = document.getElementById("feezo-blog-jsonld");
        if (existing) existing.remove();
        const holder = document.createElement("div");
        holder.id = "feezo-blog-jsonld";
        holder.innerHTML = buildBlogBotJsonLdScripts(detail, slug);
        document.head.appendChild(holder);

        const rel = await fetchRelatedBlogs(slug);
        if (!cancelled) setRelated(rel);
      } catch {
        if (!cancelled) {
          setNotFound(true);
          setBlog(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      document.getElementById("feezo-blog-jsonld")?.remove();
    };
  }, [slug]);

  useEffect(() => {
    if (!blog?.leadPopup?.enabled || !blog.leadPopup.showOnLoad) return;
    const key = `feezo-blog-popup:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      /* ignore */
    }
    const delay = Math.max(0, (blog.leadPopup.delaySeconds || 0) * 1000);
    const t = window.setTimeout(() => {
      setPopupOpen(true);
      try {
        sessionStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
    }, delay);
    return () => window.clearTimeout(t);
  }, [blog, slug]);

  const blocks = useMemo(
    () => [...(blog?.contentBlocks ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [blog],
  );
  const faqs = useMemo(
    () => [...(blog?.faqs ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [blog],
  );

  const submitPopup = async () => {
    if (!blog?.leadPopup) return;
    setSubmitting(true);
    try {
      const values = (blog.leadPopup.form.fields || []).map((f, i) => {
        const id = f.id || `f-${i}`;
        return {
          fieldId: id,
          fieldLabel: f.label,
          fieldType: f.fieldType,
          value: popupValues[id] || "",
        };
      });
      const res = await submitBlogLead(blog.id, values);
      setPopupDone(res.successMessage || "Thank you!");
    } catch (err) {
      setPopupDone(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setSubmitting(false);
    }
  };

  const submitCta = async () => {
    if (!blog || !ctaOpen?.id) return;
    setSubmitting(true);
    try {
      const values = (ctaOpen.fields || []).map((f, i) => {
        const id = f.id || `f-${i}`;
        return {
          fieldId: id,
          fieldLabel: f.label,
          fieldType: f.fieldType,
          value: ctaValues[id] || "",
        };
      });
      const res = await submitBlogCta(blog.id, ctaOpen.id, values);
      setCtaDone(res.successMessage || "Thank you!");
    } catch (err) {
      setCtaDone(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <BlogPostSkeleton />;
  }

  if (notFound || !blog) {
    return (
      <main className="mx-auto max-w-xl px-4 pb-20 pt-28 text-center">
        <h1 className="text-2xl font-bold text-[var(--mkt-ink)]">Article not found</h1>
        <p className="mt-2 text-black/55">This blog post is unavailable or unpublished.</p>
        <Link to="/blog" className="mt-6 inline-block text-[var(--mkt-green-deep)] underline">
          Back to blog
        </Link>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-28 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-black/45">
        <Link to="/" className="hover:text-black">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <Link to="/blog" className="hover:text-black">
          Blog
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-black/70">{blog.title}</span>
      </nav>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--mkt-green-deep)]">
        <Link to="/blog">{blog.category?.name}</Link>
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--mkt-ink)] sm:text-4xl">
        {blog.title}
      </h1>
      {blog.excerpt ? (
        <p className="mt-3 text-lg text-[var(--mkt-ink)]/65">{blog.excerpt}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-3 text-sm text-black/45">
        <span>By {blog.author?.fullName || "Feezo Team"}</span>
        {blog.readTime ? <span>· {blog.readTime}</span> : null}
        <span>· Updated {new Date(blog.updatedAt).toLocaleDateString("en-GB")}</span>
      </div>

      {blog.thumbnail ? (
        <img
          src={resolveMediaUrl(blog.thumbnail)}
          alt={blog.thumbnailAlt || blog.title}
          className="mt-8 w-full rounded-2xl object-cover"
        />
      ) : null}

      <article className="prose prose-neutral mt-10 max-w-none prose-headings:scroll-mt-28 prose-a:text-[var(--mkt-green-deep)]">
        {blocks.map((block, i) => (
          <section key={i} className="mb-10">
            {block.title ? <h2>{block.title}</h2> : null}
            {block.highlightedText ? (
              <p className="rounded-xl border border-[var(--mkt-green)]/20 bg-[var(--mkt-green)]/5 px-4 py-3 font-medium not-prose">
                {block.highlightedText}
              </p>
            ) : null}
            {block.content ? (
              <div dangerouslySetInnerHTML={{ __html: block.content }} />
            ) : null}
            {block.table?.rows?.length ? (
              <div className="not-prose my-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  {block.table.caption ? <caption className="mb-2 text-left text-black/55">{block.table.caption}</caption> : null}
                  <tbody>
                    {block.table.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-black/10">
                        {row.cells.map((cell, ci) => {
                          const Tag = cell.isHeader ? "th" : "td";
                          return (
                            <Tag
                              key={ci}
                              className={cn(
                                "px-3 py-2 text-left",
                                cell.isHeader && "bg-black/[0.03] font-semibold",
                              )}
                            >
                              {cell.content}
                            </Tag>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {(block.images || []).map((img, ii) => (
              <img
                key={ii}
                src={resolveMediaUrl(img.url)}
                alt={img.alt || block.title || blog.title}
                className="my-4 w-full rounded-xl"
                loading="lazy"
              />
            ))}
            {(block.videos || []).map((url, vi) => (
              <video
                key={vi}
                src={resolveMediaUrl(url)}
                controls
                className="my-4 w-full rounded-xl"
              />
            ))}
            {(block.ctas || []).length > 0 ? (
              <div className="not-prose mt-4 flex flex-wrap gap-2">
                {(block.ctas || []).map((cta, ci) =>
                  cta.ctaType === "link" && cta.url ? (
                    <a
                      key={ci}
                      href={cta.url}
                      className="inline-flex rounded-full bg-[var(--mkt-green)] px-4 py-2 text-sm font-semibold text-white"
                    >
                      {cta.buttonText}
                    </a>
                  ) : (
                    <button
                      key={ci}
                      type="button"
                      className="inline-flex rounded-full bg-[var(--mkt-green)] px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => {
                        setCtaOpen(cta);
                        setCtaValues({});
                        setCtaDone(null);
                      }}
                    >
                      {cta.buttonText}
                    </button>
                  ),
                )}
              </div>
            ) : null}
          </section>
        ))}
      </article>

      {faqs.length > 0 ? (
        <section className="mt-12 border-t border-black/10 pt-10" aria-label="FAQ">
          <h2 className="text-2xl font-bold text-[var(--mkt-ink)]">Frequently Asked Questions</h2>
          <div className="mt-6 space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-black/8 bg-white p-4">
                <h3 className="font-semibold text-[var(--mkt-ink)]">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-black/65">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-12 border-t border-black/10 pt-10">
          <h2 className="text-xl font-bold text-[var(--mkt-ink)]">Related articles</h2>
          <ul className="mt-4 space-y-3">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  to="/blog/$slug"
                  params={{ slug: r.slug }}
                  className="font-medium text-[var(--mkt-green-deep)] hover:underline"
                >
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {popupOpen && blog.leadPopup?.enabled ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <button
              type="button"
              className="absolute right-3 top-3 rounded-full p-1 text-black/40 hover:bg-black/5"
              onClick={() => setPopupOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            {blog.leadPopup.poster ? (
              <img
                src={resolveMediaUrl(blog.leadPopup.poster)}
                alt=""
                className="mb-3 max-h-36 w-full rounded-xl object-cover"
              />
            ) : null}
            <h2 className="pr-8 text-lg font-semibold">{blog.leadPopup.form.title}</h2>
            {blog.leadPopup.form.description ? (
              <p className="mt-1 text-sm text-black/60">{blog.leadPopup.form.description}</p>
            ) : null}
            {popupDone ? (
              <p className="mt-4 text-sm font-medium text-emerald-700">{popupDone}</p>
            ) : (
              <div className="mt-4 space-y-4">
                <LeadFormFields
                  fields={blog.leadPopup.form.fields}
                  values={popupValues}
                  onChange={(id, value) =>
                    setPopupValues((prev) => ({ ...prev, [id]: value }))
                  }
                />
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void submitPopup()}
                  className="w-full rounded-full bg-[var(--mkt-green)] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : blog.leadPopup.form.submitButtonText}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {ctaOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <button
              type="button"
              className="absolute right-3 top-3 rounded-full p-1 text-black/40 hover:bg-black/5"
              onClick={() => setCtaOpen(null)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="pr-8 text-lg font-semibold">{ctaOpen.buttonText}</h2>
            {ctaDone ? (
              <p className="mt-4 text-sm font-medium text-emerald-700">{ctaDone}</p>
            ) : (
              <div className="mt-4 space-y-4">
                <LeadFormFields
                  fields={ctaOpen.fields || []}
                  values={ctaValues}
                  onChange={(id, value) =>
                    setCtaValues((prev) => ({ ...prev, [id]: value }))
                  }
                />
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void submitCta()}
                  className="w-full rounded-full bg-[var(--mkt-green)] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
