import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Loader2,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCcw,
  Trash2,
  Eye,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BlogsViewSkeleton } from "@/components/admin/blogs/BlogsViewSkeleton";
import {
  activateBlogCategory,
  createBlogCategory,
  deactivateBlogCategory,
  deleteAdminBlog,
  deleteBlogCategory,
  fetchAdminBlogCategories,
  fetchAdminBlogs,
  updateBlogCategory,
  type BlogAdmin,
  type BlogCategory,
} from "@/lib/api/blogs";
import { ApiError } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString("en-GB");
  } catch {
    return value;
  }
}

export function BlogsView() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [blogs, setBlogs] = useState<BlogAdmin[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [draftCount, setDraftCount] = useState(0);
  const [featuredCount, setFeaturedCount] = useState(0);
  const hasLoadedOnceRef = useRef(false);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");
  const [categoryBusy, setCategoryBusy] = useState(false);

  const [deleting, setDeleting] = useState<BlogAdmin | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [categoryPending, setCategoryPending] = useState<{
    cat: BlogCategory;
    mode: "deactivate" | "activate" | "delete";
  } | null>(null);
  const [categoryActionBusy, setCategoryActionBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    if (hasLoadedOnceRef.current) {
      setListLoading(true);
    } else {
      setInitialLoading(true);
    }
    try {
      const [cats, list] = await Promise.all([
        fetchAdminBlogCategories(),
        fetchAdminBlogs({ page, limit: 20, search: debounced || undefined }),
      ]);
      setCategories(cats);
      setBlogs(list.data);
      setTotalPages(list.totalPages);
      setTotalCount(list.totalCount);
      setPublishedCount(list.publishedCount);
      setDraftCount(list.draftCount);
      setFeaturedCount(list.featuredCount);
      hasLoadedOnceRef.current = true;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to load blogs");
    } finally {
      setInitialLoading(false);
      setListLoading(false);
    }
  }, [page, debounced]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDesc("");
    setCategoryOpen(true);
  };

  const openEditCategory = (cat: BlogCategory) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
    setCategoryDesc(cat.description || "");
    setCategoryOpen(true);
  };

  const saveCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    setCategoryBusy(true);
    try {
      if (editingCategory) {
        await updateBlogCategory(editingCategory.id, {
          name: categoryName.trim(),
          description: categoryDesc.trim() || undefined,
        });
        toast.success("Category updated");
      } else {
        await createBlogCategory({
          name: categoryName.trim(),
          description: categoryDesc.trim() || undefined,
        });
        toast.success("Category created");
      }
      setCategoryOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save category");
    } finally {
      setCategoryBusy(false);
    }
  };

  const confirmCategoryAction = async () => {
    if (!categoryPending) return;
    const { cat, mode } = categoryPending;
    setCategoryActionBusy(true);
    try {
      if (mode === "deactivate") {
        await deactivateBlogCategory(cat.id);
        toast.success(
          `“${cat.name}” deactivated — existing blogs keep it, new posts cannot use it`,
        );
      } else if (mode === "activate") {
        await activateBlogCategory(cat.id);
        toast.success(`“${cat.name}” activated`);
      } else {
        await deleteBlogCategory(cat.id);
        toast.success("Category deleted");
      }
      setCategoryPending(null);
      await load();
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : mode === "delete"
            ? "Could not delete category"
            : "Could not update category",
      );
    } finally {
      setCategoryActionBusy(false);
    }
  };

  const confirmDeleteBlog = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteAdminBlog(deleting.id);
      toast.success("Blog deleted");
      setDeleting(null);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete blog");
    } finally {
      setDeleteBusy(false);
    }
  };

  const stats = [
    { label: "Total Blogs", value: totalCount },
    { label: "Published", value: publishedCount },
    { label: "Drafts", value: draftCount },
    { label: "Featured", value: featuredCount },
  ];

  const busy = initialLoading || listLoading;

  if (initialLoading) {
    return <BlogsViewSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
            <BookOpen className="h-3.5 w-3.5" />
            Blog Management
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            Categories & Posts
          </h1>
          <p className="mt-1 max-w-xl text-sm text-black/55">
            Create SEO-ready blog posts for feezo.app — categories, drafts, and publishing in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={openCreateCategory}
          >
            <Tag className="mr-1.5 h-4 w-4" />
            Add Category
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => void load()}
            disabled={busy}
          >
            <RefreshCcw className={cn("mr-1.5 h-4 w-4", busy && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[#E5E5E5] bg-white px-4 py-3 shadow-[0_12px_40px_-28px_rgba(0,0,0,0.35)]"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wide text-black/45">
              {s.label}
            </div>
            {listLoading ? (
              <Skeleton className="mt-2 h-8 w-12 bg-black/[0.07]" />
            ) : (
              <div className="mt-1 text-2xl font-semibold tabular-nums text-black">{s.value}</div>
            )}
          </div>
        ))}
      </div>

      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border py-1 pl-3 pr-1 text-sm",
                cat.active
                  ? "border-[#E5E5E5] bg-white"
                  : "border-amber-200 bg-amber-50/70",
              )}
            >
              <span
                className={cn(
                  "font-medium",
                  cat.active ? "text-black/80" : "text-amber-900/70 line-through decoration-amber-400/80",
                )}
              >
                {cat.name}
              </span>
              {!cat.active ? (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                  Off
                </span>
              ) : null}
              <button
                type="button"
                className="rounded-full p-1 text-black/40 hover:bg-black/5 hover:text-black"
                onClick={() => openEditCategory(cat)}
                aria-label={`Edit ${cat.name}`}
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className={cn(
                  "rounded-full p-1 hover:bg-black/5",
                  cat.active
                    ? "text-amber-600 hover:text-amber-700"
                    : "text-emerald-600 hover:text-emerald-700",
                )}
                onClick={() =>
                  setCategoryPending({
                    cat,
                    mode: cat.active ? "deactivate" : "activate",
                  })
                }
                aria-label={cat.active ? `Deactivate ${cat.name}` : `Activate ${cat.name}`}
                title={
                  cat.active
                    ? "Deactivate — keep on existing blogs, block new use"
                    : "Activate — allow on new blogs again"
                }
              >
                {cat.active ? (
                  <PowerOff className="h-3.5 w-3.5" />
                ) : (
                  <Power className="h-3.5 w-3.5" />
                )}
              </button>
              <button
                type="button"
                className="rounded-full p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                onClick={() => setCategoryPending({ cat, mode: "delete" })}
                aria-label={`Delete ${cat.name}`}
                title="Delete only if unused"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="rounded-3xl border border-[#E5E5E5] bg-white p-4 shadow-[0_16px_48px_-32px_rgba(0,0,0,0.4)] sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-black">Blogs</h2>
            <p className="text-sm text-black/50">Manage posts, publish status, and SEO fields.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild className="rounded-full bg-[#0F766E] hover:bg-[#0d6560]">
              <Link to="/super-admin/blogs/new">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Blog
              </Link>
            </Button>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, slug, category…"
              className="h-10 w-full rounded-full sm:w-72"
            />
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between text-sm text-black/50">
          {listLoading ? (
            <Skeleton className="h-4 w-20 bg-black/[0.05]" />
          ) : (
            <span>
              {totalCount} result{totalCount === 1 ? "" : "s"}
            </span>
          )}
          {listLoading ? <Loader2 className="h-4 w-4 animate-spin text-black/35" /> : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-[11px] uppercase tracking-wide text-black/45">
                <th className="pb-2 pr-3 font-semibold">Title</th>
                <th className="pb-2 pr-3 font-semibold">Category</th>
                <th className="pb-2 pr-3 font-semibold">Author</th>
                <th className="pb-2 pr-3 font-semibold">Published</th>
                <th className="pb-2 pr-3 font-semibold">Featured</th>
                <th className="pb-2 pr-3 font-semibold">Updated</th>
                <th className="pb-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-[#F0F0F0] last:border-0">
                    <td className="py-3 pr-3">
                      <Skeleton className="h-4 w-[85%] bg-black/[0.07]" />
                      <Skeleton className="mt-1.5 h-3 w-[45%] bg-black/[0.05]" />
                    </td>
                    <td className="py-3 pr-3">
                      <Skeleton className="h-6 w-24 rounded-full bg-black/[0.06]" />
                    </td>
                    <td className="py-3 pr-3">
                      <Skeleton className="h-4 w-20 bg-black/[0.05]" />
                    </td>
                    <td className="py-3 pr-3">
                      <Skeleton className="h-4 w-16 bg-black/[0.05]" />
                    </td>
                    <td className="py-3 pr-3">
                      <Skeleton className="h-4 w-10 bg-black/[0.05]" />
                    </td>
                    <td className="py-3 pr-3">
                      <Skeleton className="h-4 w-16 bg-black/[0.05]" />
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        <Skeleton className="h-8 w-8 rounded-full bg-black/[0.06]" />
                        <Skeleton className="h-8 w-8 rounded-full bg-black/[0.06]" />
                        <Skeleton className="h-8 w-8 rounded-full bg-black/[0.06]" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-black/45">
                    No blogs yet. Create your first SEO post.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id} className="border-b border-[#F0F0F0] last:border-0">
                    <td className="max-w-[280px] py-3 pr-3 font-medium text-black/85">
                      <div className="line-clamp-2">{blog.title}</div>
                      <div className="mt-0.5 truncate text-xs text-black/40">{blog.slug}</div>
                    </td>
                    <td className="py-3 pr-3">
                      <Badge variant="secondary" className="rounded-full bg-teal-50 text-teal-800">
                        {blog.category?.name || "—"}
                      </Badge>
                    </td>
                    <td className="py-3 pr-3 text-black/60">
                      {blog.author?.fullName || "—"}
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={cn(
                          "text-xs font-semibold",
                          blog.published ? "text-emerald-600" : "text-amber-600",
                        )}
                      >
                        {blog.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-black/60">{blog.featured ? "Yes" : "No"}</td>
                    <td className="py-3 pr-3 tabular-nums text-black/55">
                      {formatDate(blog.updatedAt)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="View live">
                          <a
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="Edit">
                          <Link
                            to="/super-admin/blogs/$blogId"
                            params={{ blogId: String(blog.id) }}
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600"
                          onClick={() => setDeleting(blog)}
                          aria-label="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && !listLoading ? (
          <div className="mt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-black/50">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>

      <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Fee Collection"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description (optional)</Label>
              <Textarea
                id="cat-desc"
                value={categoryDesc}
                onChange={(e) => setCategoryDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCategoryOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-[#0F766E] hover:bg-[#0d6560]"
              disabled={categoryBusy}
              onClick={() => void saveCategory()}
            >
              {categoryBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.title}” will be permanently removed from the control plane and public site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteBusy}
              onClick={(e) => {
                e.preventDefault();
                void confirmDeleteBlog();
              }}
            >
              {deleteBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(categoryPending)}
        onOpenChange={(o) => !o && !categoryActionBusy && setCategoryPending(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {categoryPending?.mode === "delete"
                ? "Delete category?"
                : categoryPending?.mode === "deactivate"
                  ? "Deactivate category?"
                  : "Activate category?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {categoryPending?.mode === "delete" ? (
                <>
                  Permanently delete “{categoryPending.cat.name}”? Only unused categories can be
                  deleted. If blogs still use it, deactivate instead — existing posts keep the
                  category, but new posts cannot select it.
                </>
              ) : categoryPending?.mode === "deactivate" ? (
                <>
                  Deactivate “{categoryPending.cat.name}”? Existing blogs keep this category; it
                  will no longer appear for new posts until you activate it again.
                </>
              ) : (
                <>
                  Activate “{categoryPending?.cat.name}”? It will be available again when creating
                  or editing blogs.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={categoryActionBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                categoryPending?.mode === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : categoryPending?.mode === "deactivate"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-[#0F766E] hover:bg-[#0d6560]"
              }
              disabled={categoryActionBusy}
              onClick={(e) => {
                e.preventDefault();
                void confirmCategoryAction();
              }}
            >
              {categoryActionBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {categoryPending?.mode === "delete"
                ? "Delete"
                : categoryPending?.mode === "deactivate"
                  ? "Deactivate"
                  : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
