import { apiRequest } from "@/lib/api/client";

export type SeoCheckStatus = "pass" | "warn" | "fail" | "pending" | "skipped";

export type BlogSeoCheckResult = {
  status: SeoCheckStatus | string;
  message: string;
  checkedAt?: string;
};

export type BlogSeoDashboardRow = {
  blogId: number;
  title: string;
  slug: string;
  url: string;
  publishedAt: string;
  overallStatus: SeoCheckStatus | string;
  lastRunAt: string | null;
  lastRunId: number | null;
  checks: Record<string, BlogSeoCheckResult>;
  index: {
    dayOffset: number;
    coverageState: string | null;
    indexed: boolean | null;
    googleCanonical: string | null;
    ourCanonical: string | null;
    checkedAt: string;
  } | null;
  performance: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    checkedAt: string;
  } | null;
  pendingJobs: number;
};

export type BlogSeoSettings = {
  siteOrigin: string;
  stripTrailingSlash: boolean;
  minInternalLinks: number;
  titleMin: number;
  titleMax: number;
  descriptionMin: number;
  descriptionMax: number;
  approvedPhones: string[];
  approvedWhatsapp: string[];
  alertEmails: string[];
  indexNowConfigured: boolean;
  gscConfigured: boolean;
};

export type BlogSeoRunDetail = {
  id: number;
  blogId: number;
  title: string;
  slug: string;
  url: string;
  trigger: string;
  overallStatus: string;
  startedAt: string;
  finishedAt: string | null;
  results: Array<{
    checkKey: string;
    status: string;
    message: string;
    details: unknown;
    checkedAt: string;
  }>;
};

export const SEO_CHECK_KEYS = [
  "http_status",
  "indexable",
  "canonical",
  "title_description",
  "h1",
  "links",
  "sitemap",
  "sitemap_health",
  "indexnow",
] as const;

export const SEO_CHECK_LABELS: Record<string, string> = {
  http_status: "HTTP",
  indexable: "Indexable",
  canonical: "Canonical",
  title_description: "Title/Desc",
  h1: "H1",
  links: "Links",
  sitemap: "Sitemap",
  sitemap_health: "Sitemap health",
  indexnow: "IndexNow",
  gsc_index: "GSC index",
  gsc_canonical: "GSC canonical",
};

export async function fetchBlogSeoDashboard() {
  return apiRequest<{ data: BlogSeoDashboardRow[]; settings: BlogSeoSettings }>(
    "/api/super-admin/blog-seo.php?action=list",
  );
}

export async function fetchBlogSeoRun(runId: number) {
  return apiRequest<{ run: BlogSeoRunDetail }>(
    `/api/super-admin/blog-seo.php?action=run&runId=${runId}`,
  );
}

export async function rerunBlogSeoChecks(blogId: number) {
  return apiRequest<{ ok: boolean; data: BlogSeoDashboardRow[] }>(
    "/api/super-admin/blog-seo.php",
    {
      method: "POST",
      body: { action: "rerun", blogId },
    },
  );
}

export async function updateBlogSeoSettings(settings: Partial<BlogSeoSettings>) {
  return apiRequest<{ settings: BlogSeoSettings }>("/api/super-admin/blog-seo.php", {
    method: "POST",
    body: { action: "updateSettings", settings },
  });
}
