import { apiBaseUrl, apiRequest, apiRequestOrigin, getApiToken } from "@/lib/api/client";

export type BlogCategory = {
  id: number;
  name: string;
  description?: string | null;
  /** false = deactivated; stays on existing posts but cannot be newly selected */
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BlogAuthor = {
  id: number;
  fullName: string;
  username: string;
};

export type TableCell = { content: string; isHeader?: boolean };
export type TableRow = { cells: TableCell[] };
export type TableData = { rows: TableRow[]; caption?: string | null };

export type LeadFormFieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date";

export type FormFieldPayload = {
  id?: string;
  label: string;
  fieldType: LeadFormFieldType;
  placeholder?: string | null;
  required: boolean;
  order: number;
  options?: string[] | null;
};

export type ContentBlockCTAPayload = {
  id?: string;
  ctaType: "link" | "form";
  buttonText: string;
  order: number;
  url?: string | null;
  successMessage?: string | null;
  fields?: FormFieldPayload[] | null;
};

export type BlogImage = { url: string; alt?: string };

export type ContentBlockPayload = {
  order: number;
  title?: string | null;
  content?: string | null;
  highlightedText?: string | null;
  images: BlogImage[];
  videos: string[];
  table?: TableData | null;
  ctas?: ContentBlockCTAPayload[] | null;
};

export type BlogFAQPayload = {
  id?: string;
  question: string;
  answer: string;
  order: number;
};

export type LeadPopupPayload = {
  enabled: boolean;
  poster?: string | null;
  showOnLoad: boolean;
  delaySeconds: number;
  form: {
    id?: string;
    title: string;
    description?: string | null;
    submitButtonText: string;
    successMessage: string;
    fields: FormFieldPayload[];
  };
};

export type BlogAdmin = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  thumbnailAlt?: string | null;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  category: BlogCategory;
  author: BlogAuthor | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  robots: string;
  readTime?: string;
};

export type BlogAdminDetail = BlogAdmin & {
  contentBlocks: ContentBlockPayload[];
  faqs: BlogFAQPayload[];
  leadPopup?: LeadPopupPayload | null;
};

export type BlogAdminPayload = {
  title: string;
  slug: string;
  excerpt?: string | null;
  thumbnail?: string | null;
  thumbnailAlt?: string | null;
  category: number;
  published: boolean;
  featured: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  focusKeyword?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  robots?: string;
  contentBlocks: ContentBlockPayload[];
  faqs?: BlogFAQPayload[];
  leadPopup?: LeadPopupPayload | null;
};

export type PaginatedBlogAdminResponse = {
  data: BlogAdmin[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
  publishedCount: number;
  draftCount: number;
  featuredCount: number;
};

export type PaginatedBlogPublicResponse = {
  data: BlogAdmin[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
};

export type BlogSubmissionRow = {
  id: number;
  formTitle?: string | null;
  ctaId?: string;
  buttonText?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  values: { fieldId?: string; fieldLabel?: string; value?: string }[];
  submittedAt: string;
};

export function slugifyBlogTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200) || "post";
}

export async function fetchAdminBlogCategories(): Promise<BlogCategory[]> {
  const res = await apiRequest<{ categories: BlogCategory[] }>(
    "/api/super-admin/blogs.php?action=categories",
  );
  return res.categories ?? [];
}

export async function createBlogCategory(payload: {
  name: string;
  description?: string;
}): Promise<BlogCategory> {
  const res = await apiRequest<{ category: BlogCategory }>("/api/super-admin/blogs.php", {
    method: "POST",
    body: { action: "createCategory", ...payload },
  });
  return res.category;
}

export async function updateBlogCategory(
  id: number,
  payload: { name: string; description?: string },
): Promise<BlogCategory> {
  const res = await apiRequest<{ category: BlogCategory }>("/api/super-admin/blogs.php", {
    method: "POST",
    body: { action: "updateCategory", id, ...payload },
  });
  return res.category;
}

export async function deactivateBlogCategory(id: number): Promise<BlogCategory> {
  const res = await apiRequest<{ category: BlogCategory }>("/api/super-admin/blogs.php", {
    method: "POST",
    body: { action: "deactivateCategory", id },
  });
  return res.category;
}

export async function activateBlogCategory(id: number): Promise<BlogCategory> {
  const res = await apiRequest<{ category: BlogCategory }>("/api/super-admin/blogs.php", {
    method: "POST",
    body: { action: "activateCategory", id },
  });
  return res.category;
}

export async function deleteBlogCategory(id: number): Promise<void> {
  await apiRequest("/api/super-admin/blogs.php", {
    method: "POST",
    body: { action: "deleteCategory", id },
  });
}

export async function fetchAdminBlogs(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedBlogAdminResponse> {
  const q = new URLSearchParams({ action: "list" });
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.search) q.set("search", params.search);
  return apiRequest<PaginatedBlogAdminResponse>(`/api/super-admin/blogs.php?${q}`);
}

export async function fetchAdminBlogDetail(id: number): Promise<BlogAdminDetail> {
  const res = await apiRequest<{ blog: BlogAdminDetail }>(
    `/api/super-admin/blogs.php?action=detail&id=${id}`,
  );
  return res.blog;
}

export async function createAdminBlog(payload: BlogAdminPayload): Promise<BlogAdminDetail> {
  const res = await apiRequest<{ blog: BlogAdminDetail }>("/api/super-admin/blogs.php", {
    method: "POST",
    body: { action: "create", ...payload },
  });
  return res.blog;
}

export async function updateAdminBlog(
  id: number,
  payload: BlogAdminPayload,
): Promise<BlogAdminDetail> {
  const res = await apiRequest<{ blog: BlogAdminDetail }>("/api/super-admin/blogs.php", {
    method: "POST",
    body: { action: "update", id, ...payload },
  });
  return res.blog;
}

export async function deleteAdminBlog(id: number): Promise<void> {
  await apiRequest("/api/super-admin/blogs.php", {
    method: "POST",
    body: { action: "delete", id },
  });
}

export async function fetchBlogLeadSubmissions(
  id: number,
  page = 1,
): Promise<{ count: number; results: BlogSubmissionRow[] }> {
  return apiRequest(`/api/super-admin/blogs.php?action=leadSubmissions&id=${id}&page=${page}`);
}

export async function fetchBlogCtaSubmissions(
  id: number,
  page = 1,
): Promise<{ count: number; results: BlogSubmissionRow[] }> {
  return apiRequest(`/api/super-admin/blogs.php?action=ctaSubmissions&id=${id}&page=${page}`);
}

export async function uploadBlogAsset(
  file: File,
  kind: "image" | "video" | "poster" | "thumbnail" = "image",
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);
  const token = getApiToken();
  const url = `${apiRequestOrigin()}/api/super-admin/blogs/upload.php`;
  const res = await fetch(url, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
    body: form,
  });
  const raw = await res.text();
  let payload: { success?: boolean; data?: { url?: string }; error?: string } | null = null;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = null;
  }
  if (!res.ok || !payload?.success || !payload.data?.url) {
    throw new Error(payload?.error || "Upload failed");
  }
  return payload.data.url;
}

/** Public (no auth) */
export async function fetchPublicBlogs(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}): Promise<PaginatedBlogPublicResponse> {
  const q = new URLSearchParams({ action: "list" });
  if (params?.page) q.set("page", String(params.page));
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.search) q.set("search", params.search);
  if (params?.category) q.set("category", params.category);
  return apiRequest<PaginatedBlogPublicResponse>(`/api/public/blogs.php?${q}`, { auth: false });
}

export async function fetchPublicBlogCategories(): Promise<BlogCategory[]> {
  const res = await apiRequest<{ categories: BlogCategory[] }>(
    "/api/public/blogs.php?action=categories",
    { auth: false },
  );
  return res.categories ?? [];
}

export async function fetchPublicBlogDetail(slug: string): Promise<BlogAdminDetail> {
  const res = await apiRequest<{ blog: BlogAdminDetail }>(
    `/api/public/blogs.php?action=detail&slug=${encodeURIComponent(slug)}`,
    { auth: false },
  );
  return res.blog;
}

export async function fetchRelatedBlogs(slug: string): Promise<BlogAdmin[]> {
  const res = await apiRequest<{ data: BlogAdmin[] }>(
    `/api/public/blogs.php?action=related&slug=${encodeURIComponent(slug)}`,
    { auth: false },
  );
  return res.data ?? [];
}

export async function fetchBlogSitemapUrls(): Promise<{ slug: string; updatedAt: string }[]> {
  const origin = apiRequestOrigin() || apiBaseUrl();
  const res = await fetch(`${origin}/api/public/blogs.php?action=sitemap`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const payload = (await res.json()) as {
    success?: boolean;
    data?: { blogs?: { slug: string; updatedAt: string }[] };
  };
  return payload.data?.blogs ?? [];
}

export async function submitBlogLead(
  blogId: number,
  values: { fieldId?: string; fieldLabel?: string; fieldType?: string; value: string }[],
): Promise<{ successMessage: string }> {
  return apiRequest("/api/public/blogs.php", {
    method: "POST",
    auth: false,
    body: { action: "submitLead", blogId, values },
  });
}

export async function submitBlogCta(
  blogId: number,
  ctaId: string,
  values: { fieldId?: string; fieldLabel?: string; fieldType?: string; value: string }[],
): Promise<{ successMessage: string }> {
  return apiRequest("/api/public/blogs.php", {
    method: "POST",
    auth: false,
    body: { action: "submitCta", blogId, ctaId, values },
  });
}
