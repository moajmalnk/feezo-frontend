import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  MoveDown,
  MoveUp,
  Plus,
  Trash2,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

import { BlogEditorSkeleton } from "@/components/admin/blogs/BlogsViewSkeleton";
import { RichTextEditor } from "@/components/admin/blogs/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resolveMediaUrl } from "@/lib/media";
import {
  createAdminBlog,
  fetchAdminBlogCategories,
  fetchAdminBlogDetail,
  fetchBlogCtaSubmissions,
  fetchBlogLeadSubmissions,
  slugifyBlogTitle,
  updateAdminBlog,
  uploadBlogAsset,
  type BlogAdminPayload,
  type BlogCategory,
  type BlogFAQPayload,
  type BlogSubmissionRow,
  type ContentBlockCTAPayload,
  type ContentBlockPayload,
  type FormFieldPayload,
  type LeadPopupPayload,
  type TableData,
} from "@/lib/api/blogs";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

function emptyBlock(order: number): ContentBlockPayload {
  return {
    order,
    title: "",
    content: "",
    highlightedText: "",
    images: [],
    videos: [],
    table: null,
    ctas: [],
  };
}

function emptyCta(order: number): ContentBlockCTAPayload {
  return {
    ctaType: "link",
    buttonText: "",
    order,
    url: "",
    successMessage: "Thank you! We will contact you soon.",
    fields: [],
  };
}

function emptyField(order: number): FormFieldPayload {
  return {
    label: "",
    fieldType: "text",
    placeholder: "",
    required: true,
    order,
    options: null,
  };
}

function emptyPopup(): LeadPopupPayload {
  return {
    enabled: false,
    poster: null,
    showOnLoad: true,
    delaySeconds: 0,
    form: {
      title: "",
      description: "",
      submitButtonText: "Submit",
      successMessage: "Thank you! We will contact you soon.",
      fields: [emptyField(0)],
    },
  };
}

function emptyTable(): TableData {
  return {
    caption: "",
    rows: [
      {
        cells: [
          { content: "", isHeader: true },
          { content: "", isHeader: true },
          { content: "", isHeader: true },
        ],
      },
      {
        cells: [
          { content: "", isHeader: false },
          { content: "", isHeader: false },
          { content: "", isHeader: false },
        ],
      },
      {
        cells: [
          { content: "", isHeader: false },
          { content: "", isHeader: false },
          { content: "", isHeader: false },
        ],
      },
    ],
  };
}

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const next = index + dir;
  if (next < 0 || next >= list.length) return list;
  const copy = [...list];
  const tmp = copy[index]!;
  copy[index] = copy[next]!;
  copy[next] = tmp;
  return copy.map((item, i) =>
    typeof item === "object" && item && "order" in item
      ? ({ ...item, order: i } as T)
      : item,
  );
}

type Props = { blogId?: string };

export function BlogEditorView({ blogId }: Props) {
  const navigate = useNavigate();
  const isNew = !blogId || blogId === "new";
  const numericId = !isNew ? Number(blogId) : null;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [slugManual, setSlugManual] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [excerpt, setExcerpt] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailAlt, setThumbnailAlt] = useState("");
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [robots, setRobots] = useState("index, follow");
  const [blocks, setBlocks] = useState<ContentBlockPayload[]>([emptyBlock(0)]);
  const [faqs, setFaqs] = useState<BlogFAQPayload[]>([]);
  const [leadPopup, setLeadPopup] = useState<LeadPopupPayload>(emptyPopup());
  const [showLeads, setShowLeads] = useState(false);
  const [leadRows, setLeadRows] = useState<BlogSubmissionRow[]>([]);
  const [ctaRows, setCtaRows] = useState<BlogSubmissionRow[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const cats = await fetchAdminBlogCategories();
        setCategories(cats);
        const firstActive = cats.find((c) => c.active);
        if (firstActive && !categoryId) setCategoryId(String(firstActive.id));
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load categories");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isNew || !numericId) return;
    void (async () => {
      setLoading(true);
      try {
        const blog = await fetchAdminBlogDetail(numericId);
        setTitle(blog.title);
        setSlug(blog.slug);
        setSlugManual(true);
        setCategoryId(String(blog.category.id));
        setExcerpt(blog.excerpt || "");
        setThumbnail(blog.thumbnail || "");
        setThumbnailAlt(blog.thumbnailAlt || "");
        setPublished(blog.published);
        setFeatured(blog.featured);
        setMetaTitle(blog.metaTitle || "");
        setMetaDescription(blog.metaDescription || "");
        setFocusKeyword(blog.focusKeyword || "");
        setCanonicalUrl(blog.canonicalUrl || "");
        setOgImageUrl(blog.ogImageUrl || "");
        setRobots(blog.robots || "index, follow");
        setBlocks(
          blog.contentBlocks?.length
            ? blog.contentBlocks.map((b, i) => ({ ...b, order: i }))
            : [emptyBlock(0)],
        );
        setFaqs(blog.faqs?.map((f, i) => ({ ...f, order: i })) || []);
        setLeadPopup(blog.leadPopup || emptyPopup());
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load blog");
        navigate({ to: "/super-admin/blogs" });
      } finally {
        setLoading(false);
      }
    })();
  }, [isNew, numericId, navigate]);

  const onTitleChange = (value: string) => {
    setTitle(value);
    if (!slugManual) setSlug(slugifyBlogTitle(value));
  };

  const updateBlock = (index: number, patch: Partial<ContentBlockPayload>) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  };

  const uploadThumb = async (file: File | null) => {
    if (!file) return;
    try {
      const url = await uploadBlogAsset(file, "thumbnail");
      setThumbnail(url);
      toast.success("Thumbnail uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const uploadBlockImage = async (blockIndex: number, file: File | null) => {
    if (!file) return;
    try {
      const url = await uploadBlogAsset(file, "image");
      setBlocks((prev) =>
        prev.map((b, i) =>
          i === blockIndex
            ? { ...b, images: [...(b.images || []), { url, alt: "" }] }
            : b,
        ),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const uploadBlockVideo = async (blockIndex: number, file: File | null) => {
    if (!file) return;
    try {
      const url = await uploadBlogAsset(file, "video");
      setBlocks((prev) =>
        prev.map((b, i) =>
          i === blockIndex ? { ...b, videos: [...(b.videos || []), url] } : b,
        ),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const uploadPoster = async (file: File | null) => {
    if (!file) return;
    try {
      const url = await uploadBlogAsset(file, "poster");
      setLeadPopup((p) => ({ ...p, poster: url }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const buildPayload = (): BlogAdminPayload => ({
    title: title.trim(),
    slug: slug.trim() || slugifyBlogTitle(title),
    excerpt: excerpt.trim() || null,
    thumbnail: thumbnail || null,
    thumbnailAlt: thumbnailAlt.trim() || null,
    category: Number(categoryId),
    published,
    featured,
    metaTitle: metaTitle.trim() || null,
    metaDescription: metaDescription.trim() || null,
    focusKeyword: focusKeyword.trim() || null,
    canonicalUrl: canonicalUrl.trim() || null,
    ogImageUrl: ogImageUrl.trim() || null,
    robots,
    contentBlocks: blocks.map((b, i) => ({ ...b, order: i })),
    faqs: faqs.map((f, i) => ({ ...f, order: i })),
    leadPopup,
  });

  const save = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!categoryId) {
      toast.error("Select a category");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isNew) {
        const created = await createAdminBlog(payload);
        toast.success("Blog created");
        navigate({
          to: "/super-admin/blogs/$blogId",
          params: { blogId: String(created.id) },
          replace: true,
        });
      } else if (numericId) {
        await updateAdminBlog(numericId, payload);
        toast.success("Changes saved");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save blog");
    } finally {
      setSaving(false);
    }
  };

  const loadSubmissions = async () => {
    if (!numericId) return;
    setLeadsLoading(true);
    try {
      const [leads, ctas] = await Promise.all([
        fetchBlogLeadSubmissions(numericId),
        fetchBlogCtaSubmissions(numericId),
      ]);
      setLeadRows(leads.results || []);
      setCtaRows(ctas.results || []);
      setShowLeads(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not load submissions");
    } finally {
      setLeadsLoading(false);
    }
  };

  const metaTitleLen = (metaTitle || title).length;
  const metaDescLen = (metaDescription || excerpt).length;

  const previewTitle = useMemo(
    () => (metaTitle.trim() || title.trim() || "Untitled") + " | Feezo",
    [metaTitle, title],
  );

  if (loading) {
    return <BlogEditorSkeleton />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/super-admin/blogs">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to Blogs
            </Link>
          </Button>
          <h1 className="text-xl font-semibold text-black sm:text-2xl">
            {isNew ? "Create Blog" : "Edit Blog"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && (
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => void loadSubmissions()}
              disabled={leadsLoading}
            >
              {leadsLoading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Inbox className="mr-1.5 h-4 w-4" />
              )}
              Submissions
            </Button>
          )}
          <Button type="button" variant="outline" className="rounded-full" asChild>
            <Link to="/super-admin/blogs">Cancel</Link>
          </Button>
          <Button
            type="button"
            className="rounded-full bg-[#0F766E] hover:bg-[#0d6560]"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E5E5] bg-[#F8FAFC] p-4 text-sm text-black/65">
        <p className="font-semibold text-black/80">Before you publish</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Every blog needs at least one content block (title, body, image, or video).</li>
          <li>Slugs auto-fill from the title — edit for a custom SEO URL.</li>
          <li>Upload media with the buttons (not manual URLs) when possible.</li>
          <li>Leave Published off to save as a draft.</li>
          <li>Fill the SEO panel for meta title, description, and focus keyword.</li>
        </ul>
      </div>

      <section className="space-y-4 rounded-3xl border border-[#E5E5E5] bg-white p-5">
        <h2 className="text-lg font-semibold text-black">Blog Details</h2>
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => onTitleChange(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Slug</Label>
          <Input
            value={slug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(slugifyBlogTitle(e.target.value));
            }}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories
                .filter((c) => c.active || String(c.id) === categoryId)
                .map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                    {!c.active ? " (deactivated)" : ""}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {categories.some((c) => String(c.id) === categoryId && !c.active) ? (
            <p className="text-xs text-amber-700">
              This category is deactivated. Existing posts keep it; pick an active category to change it.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <Switch checked={published} onCheckedChange={setPublished} id="published" />
            <Label htmlFor="published" className="font-normal">
              Published — visible to readers
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={featured} onCheckedChange={setFeatured} id="featured" />
            <Label htmlFor="featured" className="font-normal">
              Featured — highlight in featured sections
            </Label>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Excerpt</Label>
          <Textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={3}
            placeholder="Short summary for cards and meta description fallback"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Thumbnail</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => void uploadThumb(e.target.files?.[0] || null)}
          />
          {thumbnail ? (
            <img
              src={resolveMediaUrl(thumbnail)}
              alt={thumbnailAlt || title}
              className="mt-2 max-h-40 rounded-xl border border-[#E5E5E5] object-cover"
            />
          ) : null}
          <Input
            className="mt-2"
            value={thumbnailAlt}
            onChange={(e) => setThumbnailAlt(e.target.value)}
            placeholder="Thumbnail alt text (SEO)"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-[#E5E5E5] bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold text-black">SEO</h2>
          <p className="text-sm text-black/50">
            Expert controls for search snippets and social previews.
          </p>
        </div>
        <div className="rounded-xl border border-[#E5E5E5] bg-[#F8FAFC] p-3 text-sm">
          <div className="text-[#1a0dab]">{previewTitle}</div>
          <div className="text-[#006621]">
            https://www.feezo.app/blog/{slug || "your-slug"}
          </div>
          <div className="text-black/60">
            {(metaDescription || excerpt || "Meta description preview…").slice(0, 160)}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Meta title ({metaTitleLen}/60)</Label>
          <Input
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Defaults to post title"
            maxLength={70}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Meta description ({metaDescLen}/160)</Label>
          <Textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={3}
            maxLength={180}
            placeholder="Defaults to excerpt"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Focus keyword</Label>
          <Input
            value={focusKeyword}
            onChange={(e) => setFocusKeyword(e.target.value)}
            placeholder="e.g. school fee management software"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Canonical URL (optional)</Label>
          <Input
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            placeholder="https://www.feezo.app/blog/…"
          />
        </div>
        <div className="space-y-1.5">
          <Label>OG image URL (optional)</Label>
          <Input
            value={ogImageUrl}
            onChange={(e) => setOgImageUrl(e.target.value)}
            placeholder="Defaults to thumbnail"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Robots</Label>
          <Select value={robots} onValueChange={setRobots}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="index, follow">index, follow</SelectItem>
              <SelectItem value="noindex, follow">noindex, follow</SelectItem>
              <SelectItem value="noindex, nofollow">noindex, nofollow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">Content Blocks</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={() => setBlocks((prev) => [...prev, emptyBlock(prev.length)])}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Block
          </Button>
        </div>
        {blocks.map((block, bi) => (
          <div key={bi} className="space-y-3 rounded-3xl border border-[#E5E5E5] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-black/55">Block {bi + 1}</div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={bi === 0}
                  onClick={() => setBlocks((prev) => moveItem(prev, bi, -1))}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={bi === blocks.length - 1}
                  onClick={() => setBlocks((prev) => moveItem(prev, bi, 1))}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500"
                  disabled={blocks.length <= 1}
                  onClick={() =>
                    setBlocks((prev) =>
                      prev.filter((_, i) => i !== bi).map((b, i) => ({ ...b, order: i })),
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={block.title || ""}
                onChange={(e) => updateBlock(bi, { title: e.target.value })}
                placeholder="Optional block heading"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <RichTextEditor
                value={block.content || ""}
                onChange={(html) => updateBlock(bi, { content: html })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Highlighted text (optional)</Label>
              <Input
                value={block.highlightedText || ""}
                onChange={(e) => updateBlock(bi, { highlightedText: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Table</Label>
                {block.table ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500"
                    onClick={() => updateBlock(bi, { table: null })}
                  >
                    Remove Table
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateBlock(bi, { table: emptyTable() })}
                  >
                    + Add Table
                  </Button>
                )}
              </div>
              {block.table ? (
                <div className="space-y-2 rounded-xl border border-[#E5E5E5] p-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const table = block.table!;
                        const cols = table.rows[0]?.cells.length || 2;
                        updateBlock(bi, {
                          table: {
                            ...table,
                            rows: [
                              ...table.rows,
                              {
                                cells: Array.from({ length: cols }, () => ({
                                  content: "",
                                  isHeader: false,
                                })),
                              },
                            ],
                          },
                        });
                      }}
                    >
                      + Row
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const table = block.table!;
                        updateBlock(bi, {
                          table: {
                            ...table,
                            rows: table.rows.map((row) => ({
                              cells: [...row.cells, { content: "", isHeader: false }],
                            })),
                          },
                        });
                      }}
                    >
                      + Column
                    </Button>
                  </div>
                  <Input
                    value={block.table.caption || ""}
                    onChange={(e) =>
                      updateBlock(bi, {
                        table: { ...block.table!, caption: e.target.value },
                      })
                    }
                    placeholder="Optional caption"
                  />
                  <div className="space-y-2">
                    {block.table.rows.map((row, ri) => (
                      <div key={ri} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${row.cells.length}, minmax(0, 1fr))` }}>
                        {row.cells.map((cell, ci) => (
                          <div key={ci} className="space-y-1">
                            <Input
                              value={cell.content}
                              onChange={(e) => {
                                const rows = block.table!.rows.map((r, rIdx) =>
                                  rIdx !== ri
                                    ? r
                                    : {
                                        cells: r.cells.map((c, cIdx) =>
                                          cIdx === ci ? { ...c, content: e.target.value } : c,
                                        ),
                                      },
                                );
                                updateBlock(bi, { table: { ...block.table!, rows } });
                              }}
                            />
                            <label className="flex items-center gap-1.5 text-[11px] text-black/50">
                              <input
                                type="checkbox"
                                checked={Boolean(cell.isHeader)}
                                onChange={(e) => {
                                  const rows = block.table!.rows.map((r, rIdx) =>
                                    rIdx !== ri
                                      ? r
                                      : {
                                          cells: r.cells.map((c, cIdx) =>
                                            cIdx === ci
                                              ? { ...c, isHeader: e.target.checked }
                                              : c,
                                          ),
                                        },
                                  );
                                  updateBlock(bi, { table: { ...block.table!, rows } });
                                }}
                              />
                              Header
                            </label>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-black/45">
                    Tip: Check Header to make cells appear as table headers with bold styling.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-black/40">No table added yet</p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Images</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => void uploadBlockImage(bi, e.target.files?.[0] || null)}
                />
                <div className="space-y-2">
                  {(block.images || []).map((img, ii) => (
                    <div key={ii} className="rounded-lg border border-[#E5E5E5] p-2">
                      <img
                        src={resolveMediaUrl(img.url)}
                        alt={img.alt || ""}
                        className="mb-2 max-h-28 rounded object-cover"
                      />
                      <Input
                        value={img.alt || ""}
                        onChange={(e) => {
                          const images = (block.images || []).map((im, idx) =>
                            idx === ii ? { ...im, alt: e.target.value } : im,
                          );
                          updateBlock(bi, { images });
                        }}
                        placeholder="Alt text"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-1 text-red-500"
                        onClick={() =>
                          updateBlock(bi, {
                            images: (block.images || []).filter((_, idx) => idx !== ii),
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Videos</Label>
                <Input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(e) => void uploadBlockVideo(bi, e.target.files?.[0] || null)}
                />
                {(block.videos || []).map((url, vi) => (
                  <div key={vi} className="flex items-center gap-2 text-xs text-black/55">
                    <span className="truncate">{url}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() =>
                        updateBlock(bi, {
                          videos: (block.videos || []).filter((_, idx) => idx !== vi),
                        })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t border-[#F0F0F0] pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-black">Call-to-action buttons</div>
                  <p className="text-xs text-black/45">
                    Add link buttons or inline forms to this block.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const ctas = [...(block.ctas || []), emptyCta((block.ctas || []).length)];
                    updateBlock(bi, { ctas });
                  }}
                >
                  + Add CTA
                </Button>
              </div>
              {(block.ctas || []).map((cta, ci) => (
                <div key={ci} className="space-y-2 rounded-xl border border-[#E5E5E5] p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-black/45">CTA {ci + 1}</div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={ci === 0}
                        onClick={() =>
                          updateBlock(bi, {
                            ctas: moveItem(block.ctas || [], ci, -1),
                          })
                        }
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={ci === (block.ctas || []).length - 1}
                        onClick={() =>
                          updateBlock(bi, {
                            ctas: moveItem(block.ctas || [], ci, 1),
                          })
                        }
                      >
                        <MoveDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500"
                        onClick={() =>
                          updateBlock(bi, {
                            ctas: (block.ctas || [])
                              .filter((_, idx) => idx !== ci)
                              .map((c, i) => ({ ...c, order: i })),
                          })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Type</Label>
                      <Select
                        value={cta.ctaType}
                        onValueChange={(v) => {
                          const ctas = (block.ctas || []).map((c, idx) =>
                            idx === ci
                              ? {
                                  ...c,
                                  ctaType: v as "link" | "form",
                                  fields: v === "form" ? c.fields?.length ? c.fields : [emptyField(0)] : [],
                                }
                              : c,
                          );
                          updateBlock(bi, { ctas });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="link">Internal link</SelectItem>
                          <SelectItem value="form">Inline form</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Button text</Label>
                      <Input
                        value={cta.buttonText}
                        onChange={(e) => {
                          const ctas = (block.ctas || []).map((c, idx) =>
                            idx === ci ? { ...c, buttonText: e.target.value } : c,
                          );
                          updateBlock(bi, { ctas });
                        }}
                      />
                    </div>
                  </div>
                  {cta.ctaType === "link" ? (
                    <div className="space-y-1">
                      <Label>URL</Label>
                      <Input
                        value={cta.url || ""}
                        onChange={(e) => {
                          const ctas = (block.ctas || []).map((c, idx) =>
                            idx === ci ? { ...c, url: e.target.value } : c,
                          );
                          updateBlock(bi, { ctas });
                        }}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(cta.fields || []).map((field, fi) => (
                        <div key={fi} className="grid gap-2 rounded-lg bg-[#F8FAFC] p-2 sm:grid-cols-3">
                          <Input
                            value={field.label}
                            onChange={(e) => {
                              const ctas = (block.ctas || []).map((c, idx) => {
                                if (idx !== ci) return c;
                                const fields = (c.fields || []).map((f, fIdx) =>
                                  fIdx === fi ? { ...f, label: e.target.value } : f,
                                );
                                return { ...c, fields };
                              });
                              updateBlock(bi, { ctas });
                            }}
                            placeholder="Label"
                          />
                          <Select
                            value={field.fieldType}
                            onValueChange={(v) => {
                              const ctas = (block.ctas || []).map((c, idx) => {
                                if (idx !== ci) return c;
                                const fields = (c.fields || []).map((f, fIdx) =>
                                  fIdx === fi
                                    ? { ...f, fieldType: v as FormFieldPayload["fieldType"] }
                                    : f,
                                );
                                return { ...c, fields };
                              });
                              updateBlock(bi, { ctas });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["text", "email", "phone", "number", "textarea"].map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <label className="flex items-center gap-2 text-xs">
                            <Switch
                              checked={field.required}
                              onCheckedChange={(checked) => {
                                const ctas = (block.ctas || []).map((c, idx) => {
                                  if (idx !== ci) return c;
                                  const fields = (c.fields || []).map((f, fIdx) =>
                                    fIdx === fi ? { ...f, required: checked } : f,
                                  );
                                  return { ...c, fields };
                                });
                                updateBlock(bi, { ctas });
                              }}
                            />
                            Required
                          </label>
                        </div>
                      ))}
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const ctas = (block.ctas || []).map((c, idx) =>
                            idx === ci
                              ? {
                                  ...c,
                                  fields: [...(c.fields || []), emptyField((c.fields || []).length)],
                                }
                              : c,
                          );
                          updateBlock(bi, { ctas });
                        }}
                      >
                        + Add field
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-4 rounded-3xl border border-[#E5E5E5] bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-black">Popup Lead</h2>
            <p className="text-sm text-black/50">Optional lead capture on this blog.</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={leadPopup.enabled}
              onCheckedChange={(checked) =>
                setLeadPopup((p) => ({ ...p, enabled: checked }))
              }
              id="popup-enabled"
            />
            <Label htmlFor="popup-enabled" className="font-normal">
              Popup will be shown on this blog
            </Label>
          </div>
        </div>
        {leadPopup.enabled ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Poster image (optional)</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => void uploadPoster(e.target.files?.[0] || null)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={leadPopup.showOnLoad}
                onCheckedChange={(checked) =>
                  setLeadPopup((p) => ({ ...p, showOnLoad: checked }))
                }
                id="show-on-load"
              />
              <Label htmlFor="show-on-load" className="font-normal">
                Show automatically when reader opens the blog
              </Label>
            </div>
            <div className="space-y-1.5">
              <Label>Delay (seconds)</Label>
              <Input
                type="number"
                min={0}
                max={120}
                value={leadPopup.delaySeconds}
                onChange={(e) =>
                  setLeadPopup((p) => ({
                    ...p,
                    delaySeconds: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={leadPopup.form.title}
                onChange={(e) =>
                  setLeadPopup((p) => ({
                    ...p,
                    form: { ...p.form, title: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={leadPopup.form.description || ""}
                onChange={(e) =>
                  setLeadPopup((p) => ({
                    ...p,
                    form: { ...p.form, description: e.target.value },
                  }))
                }
                rows={2}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Submit button text</Label>
                <Input
                  value={leadPopup.form.submitButtonText}
                  onChange={(e) =>
                    setLeadPopup((p) => ({
                      ...p,
                      form: { ...p.form, submitButtonText: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Success message</Label>
                <Input
                  value={leadPopup.form.successMessage}
                  onChange={(e) =>
                    setLeadPopup((p) => ({
                      ...p,
                      form: { ...p.form, successMessage: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Form fields</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setLeadPopup((p) => ({
                      ...p,
                      form: {
                        ...p.form,
                        fields: [...p.form.fields, emptyField(p.form.fields.length)],
                      },
                    }))
                  }
                >
                  + Add field
                </Button>
              </div>
              {leadPopup.form.fields.map((field, fi) => (
                <div key={fi} className="space-y-2 rounded-xl border border-[#E5E5E5] p-3">
                  <div className="flex justify-between">
                    <div className="text-xs font-semibold text-black/45">Field {fi + 1}</div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500"
                      disabled={leadPopup.form.fields.length <= 1}
                      onClick={() =>
                        setLeadPopup((p) => ({
                          ...p,
                          form: {
                            ...p.form,
                            fields: p.form.fields
                              .filter((_, i) => i !== fi)
                              .map((f, i) => ({ ...f, order: i })),
                          },
                        }))
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Input
                    value={field.label}
                    onChange={(e) =>
                      setLeadPopup((p) => ({
                        ...p,
                        form: {
                          ...p.form,
                          fields: p.form.fields.map((f, i) =>
                            i === fi ? { ...f, label: e.target.value } : f,
                          ),
                        },
                      }))
                    }
                    placeholder="Label"
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Select
                      value={field.fieldType}
                      onValueChange={(v) =>
                        setLeadPopup((p) => ({
                          ...p,
                          form: {
                            ...p.form,
                            fields: p.form.fields.map((f, i) =>
                              i === fi
                                ? { ...f, fieldType: v as FormFieldPayload["fieldType"] }
                                : f,
                            ),
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["text", "email", "phone", "number", "textarea"].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={field.placeholder || ""}
                      onChange={(e) =>
                        setLeadPopup((p) => ({
                          ...p,
                          form: {
                            ...p.form,
                            fields: p.form.fields.map((f, i) =>
                              i === fi ? { ...f, placeholder: e.target.value } : f,
                            ),
                          },
                        }))
                      }
                      placeholder="Placeholder"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={field.required}
                      onCheckedChange={(checked) =>
                        setLeadPopup((p) => ({
                          ...p,
                          form: {
                            ...p.form,
                            fields: p.form.fields.map((f, i) =>
                              i === fi ? { ...f, required: checked } : f,
                            ),
                          },
                        }))
                      }
                    />
                    Required — user must fill this field
                  </label>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-3xl border border-[#E5E5E5] bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">FAQ Section</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setFaqs((prev) => [
                ...prev,
                { question: "", answer: "", order: prev.length },
              ])
            }
          >
            + Add FAQ
          </Button>
        </div>
        {faqs.length === 0 ? (
          <p className="text-sm text-black/45">
            Add FAQs to unlock FAQPage structured data for search engines.
          </p>
        ) : null}
        {faqs.map((faq, fi) => (
          <div key={fi} className="space-y-2 rounded-xl border border-[#E5E5E5] p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-black/45">FAQ #{fi + 1}</div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={fi === 0}
                  onClick={() => setFaqs((prev) => moveItem(prev, fi, -1))}
                >
                  <MoveUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={fi === faqs.length - 1}
                  onClick={() => setFaqs((prev) => moveItem(prev, fi, 1))}
                >
                  <MoveDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500"
                  onClick={() =>
                    setFaqs((prev) =>
                      prev.filter((_, i) => i !== fi).map((f, i) => ({ ...f, order: i })),
                    )
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Question</Label>
              <Input
                value={faq.question}
                onChange={(e) =>
                  setFaqs((prev) =>
                    prev.map((f, i) => (i === fi ? { ...f, question: e.target.value } : f)),
                  )
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Answer</Label>
              <Textarea
                value={faq.answer}
                onChange={(e) =>
                  setFaqs((prev) =>
                    prev.map((f, i) => (i === fi ? { ...f, answer: e.target.value } : f)),
                  )
                }
                rows={3}
              />
            </div>
          </div>
        ))}
      </section>

      {showLeads ? (
        <section className="space-y-4 rounded-3xl border border-[#E5E5E5] bg-white p-5">
          <h2 className="text-lg font-semibold text-black">Submissions</h2>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-black/70">Popup leads</h3>
            {leadRows.length === 0 ? (
              <p className="text-sm text-black/45">No popup submissions yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {leadRows.map((row) => (
                  <li key={row.id} className="rounded-lg border border-[#E5E5E5] p-3">
                    <div className="font-medium">
                      {row.name || "—"} · {row.email || "—"} · {row.phone || "—"}
                    </div>
                    <div className="text-xs text-black/45">{row.submittedAt}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-black/70">CTA form leads</h3>
            {ctaRows.length === 0 ? (
              <p className="text-sm text-black/45">No CTA submissions yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {ctaRows.map((row) => (
                  <li key={row.id} className="rounded-lg border border-[#E5E5E5] p-3">
                    <div className="font-medium">
                      {row.buttonText || row.ctaId} — {row.name || "—"} · {row.email || "—"}
                    </div>
                    <div className="text-xs text-black/45">{row.submittedAt}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" className="rounded-full" asChild>
          <Link to="/super-admin/blogs">Cancel</Link>
        </Button>
        <Button
          type="button"
          className={cn("rounded-full bg-[#0F766E] hover:bg-[#0d6560]")}
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
