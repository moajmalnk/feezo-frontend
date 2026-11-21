import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Download,
  Loader2,
  RefreshCcw,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import {
  SEO_CHECK_KEYS,
  SEO_CHECK_LABELS,
  fetchBlogSeoDashboard,
  fetchBlogSeoRun,
  rerunBlogSeoChecks,
  updateBlogSeoSettings,
  type BlogSeoDashboardRow,
  type BlogSeoRunDetail,
  type BlogSeoSettings,
} from "@/lib/api/blog-seo";
import { saveFile } from "@/lib/native-download";
import { cn } from "@/lib/utils";

function statusTone(status: string | undefined) {
  switch (status) {
    case "pass":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "warn":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "fail":
      return "border-red-200 bg-red-50 text-red-800";
    case "pending":
      return "border-black/10 bg-black/[0.04] text-black/55";
    default:
      return "border-black/10 bg-white text-black/55";
  }
}

function csvCell(value: string | number | null | undefined) {
  const raw = value == null ? "" : String(value);
  if (/[",\n\r]/.test(raw)) {
    return `"${raw.replace(/"/g, '""')}"`;
  }
  return raw;
}

function linesToList(text: string): string[] {
  return text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function BlogSeoChecksView() {
  const [rows, setRows] = useState<BlogSeoDashboardRow[]>([]);
  const [settings, setSettings] = useState<BlogSeoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [runDetail, setRunDetail] = useState<BlogSeoRunDetail | null>(null);
  const [runLoading, setRunLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [csvConfirmOpen, setCsvConfirmOpen] = useState(false);
  const [csvBusy, setCsvBusy] = useState(false);
  const [form, setForm] = useState({
    siteOrigin: "",
    stripTrailingSlash: true,
    minInternalLinks: 2,
    titleMin: 30,
    titleMax: 60,
    descriptionMin: 120,
    descriptionMax: 160,
    approvedPhones: "",
    approvedWhatsapp: "",
    alertEmails: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchBlogSeoDashboard();
      setRows(res.data);
      setSettings(res.settings);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not load SEO checks");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!settings) return;
    setForm({
      siteOrigin: settings.siteOrigin,
      stripTrailingSlash: settings.stripTrailingSlash,
      minInternalLinks: settings.minInternalLinks,
      titleMin: settings.titleMin,
      titleMax: settings.titleMax,
      descriptionMin: settings.descriptionMin,
      descriptionMax: settings.descriptionMax,
      approvedPhones: settings.approvedPhones.join("\n"),
      approvedWhatsapp: settings.approvedWhatsapp.join("\n"),
      alertEmails: settings.alertEmails.join("\n"),
    });
  }, [settings]);

  const failCount = useMemo(
    () => rows.filter((r) => r.overallStatus === "fail").length,
    [rows],
  );

  const onRerun = async (blogId: number) => {
    setBusyId(blogId);
    try {
      const res = await rerunBlogSeoChecks(blogId);
      setRows(res.data);
      toast.success("SEO checks re-run");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Re-run failed");
    } finally {
      setBusyId(null);
    }
  };

  const openRun = async (runId: number) => {
    setRunLoading(true);
    setRunDetail(null);
    try {
      const res = await fetchBlogSeoRun(runId);
      setRunDetail(res.run);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not load run");
    } finally {
      setRunLoading(false);
    }
  };

  const exportCsv = async () => {
    setCsvBusy(true);
    try {
      const header = [
        "URL",
        "Title",
        "Published",
        "Overall",
        "Last run",
        ...SEO_CHECK_KEYS.map((k) => SEO_CHECK_LABELS[k] || k),
        "Index status",
        "Google canonical",
        "Clicks",
        "Impressions",
        "CTR",
        "Position",
      ];
      const lines = [header.map(csvCell).join(",")];
      for (const row of rows) {
        lines.push(
          [
            row.url,
            row.title,
            row.publishedAt,
            row.overallStatus,
            row.lastRunAt || "",
            ...SEO_CHECK_KEYS.map((k) => row.checks[k]?.status || ""),
            row.index?.coverageState || "",
            row.index?.googleCanonical || "",
            row.performance?.clicks ?? "",
            row.performance?.impressions ?? "",
            row.performance?.ctr ?? "",
            row.performance?.position ?? "",
          ]
            .map(csvCell)
            .join(","),
        );
      }
      const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
      await saveFile(blob, `feezo-blog-seo-${new Date().toISOString().slice(0, 10)}.csv`);
      setCsvConfirmOpen(false);
      toast.success("CSV downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not download CSV");
    } finally {
      setCsvBusy(false);
    }
  };

  const saveSettings = async () => {
    setSettingsBusy(true);
    try {
      const res = await updateBlogSeoSettings({
        siteOrigin: form.siteOrigin.trim(),
        stripTrailingSlash: form.stripTrailingSlash,
        minInternalLinks: form.minInternalLinks,
        titleMin: form.titleMin,
        titleMax: form.titleMax,
        descriptionMin: form.descriptionMin,
        descriptionMax: form.descriptionMax,
        approvedPhones: linesToList(form.approvedPhones),
        approvedWhatsapp: linesToList(form.approvedWhatsapp),
        alertEmails: linesToList(form.alertEmails),
      });
      setSettings(res.settings);
      setSettingsOpen(false);
      toast.success("SEO settings saved");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save settings");
    } finally {
      setSettingsBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading SEO checks">
        <Skeleton className="h-8 w-64 bg-black/[0.07]" />
        <Skeleton className="h-4 w-96 max-w-full bg-black/[0.05]" />
        <Skeleton className="h-64 w-full rounded-2xl bg-black/[0.05]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to="/super-admin/blogs"
            className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-black/50 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blogs
          </Link>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
            <ShieldCheck className="h-3.5 w-3.5" />
            Post-publish SEO
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            SEO Checks
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-black/55">
            Automated checks after publish, IndexNow, and Search Console index monitoring.
            {failCount > 0 ? ` ${failCount} post(s) currently failing.` : ""}
          </p>
          {settings ? (
            <p className="mt-2 text-xs text-black/40">
              IndexNow: {settings.indexNowConfigured ? "configured" : "missing INDEXNOW_KEY"} · GSC:{" "}
              {settings.gscConfigured ? "configured" : "missing GSC credentials"}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings2 className="mr-1.5 h-4 w-4" />
            Settings
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={rows.length === 0}
            onClick={() => setCsvConfirmOpen(true)}
          >
            <Download className="mr-1.5 h-4 w-4" />
            CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => void load()}
          >
            <RefreshCcw className="mr-1.5 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E5E5E5] bg-white shadow-[0_12px_40px_-28px_rgba(0,0,0,0.35)]">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="border-b border-[#EFEFEF] bg-[#FAFAFA] text-[11px] uppercase tracking-wide text-black/45">
            <tr>
              <th className="px-4 py-3 font-semibold">Post</th>
              <th className="px-3 py-3 font-semibold">Overall</th>
              {SEO_CHECK_KEYS.map((k) => (
                <th key={k} className="px-2 py-3 font-semibold">
                  {SEO_CHECK_LABELS[k]}
                </th>
              ))}
              <th className="px-3 py-3 font-semibold">Index</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-4 py-12 text-center text-black/45">
                  No published posts yet. Publish a blog to enqueue SEO checks.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.blogId} className="border-b border-[#F1F1F1] align-top last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-black">{row.title}</div>
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 block max-w-[240px] truncate text-xs text-emerald-800 hover:underline"
                    >
                      {row.url}
                    </a>
                    <div className="mt-1 text-[11px] text-black/40">
                      Updated {new Date(row.publishedAt).toLocaleDateString("en-GB")}
                      {row.pendingJobs > 0 ? ` · ${row.pendingJobs} job(s) pending` : ""}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      variant="outline"
                      className={cn("rounded-full capitalize", statusTone(row.overallStatus))}
                    >
                      {row.overallStatus}
                    </Badge>
                    {row.lastRunAt ? (
                      <div className="mt-1 text-[10px] text-black/40">
                        {new Date(row.lastRunAt).toLocaleString("en-GB")}
                      </div>
                    ) : null}
                  </td>
                  {SEO_CHECK_KEYS.map((k) => {
                    const check = row.checks[k];
                    return (
                      <td key={k} className="px-2 py-3">
                        <span
                          title={check?.message || "Not run yet"}
                          className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
                            statusTone(check?.status || "pending"),
                          )}
                        >
                          {check?.status || "—"}
                        </span>
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-xs text-black/60">
                    {row.index ? (
                      <>
                        <div>
                          Day {row.index.dayOffset}:{" "}
                          {row.index.indexed == null
                            ? row.index.coverageState || "—"
                            : row.index.indexed
                              ? "Indexed"
                              : "Not indexed"}
                        </div>
                        {row.performance ? (
                          <div className="mt-1 text-[10px] text-black/40">
                            {row.performance.clicks} clicks · {row.performance.impressions} impr.
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-black/35">Scheduled</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 rounded-full"
                        disabled={busyId === row.blogId}
                        onClick={() => void onRerun(row.blogId)}
                      >
                        {busyId === row.blogId ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCcw className="mr-1 h-3.5 w-3.5" />
                        )}
                        Re-run
                      </Button>
                      {row.lastRunId ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-full"
                          onClick={() => void openRun(row.lastRunId!)}
                        >
                          Log
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!runDetail || runLoading} onOpenChange={(o) => !o && setRunDetail(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>SEO run log</DialogTitle>
          </DialogHeader>
          {runLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-black/40" />
            </div>
          ) : runDetail ? (
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold">{runDetail.title}</div>
                <a href={runDetail.url} className="text-xs text-emerald-800 hover:underline" target="_blank" rel="noreferrer">
                  {runDetail.url}
                </a>
                <div className="mt-1 text-xs text-black/45">
                  {runDetail.trigger} · {runDetail.overallStatus} ·{" "}
                  {new Date(runDetail.startedAt).toLocaleString("en-GB")}
                </div>
              </div>
              <ul className="space-y-2">
                {runDetail.results.map((r, i) => (
                  <li
                    key={`${r.checkKey}-${i}`}
                    className="rounded-xl border border-[#EFEFEF] bg-[#FAFAFA] px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {SEO_CHECK_LABELS[r.checkKey] || r.checkKey}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("rounded-full capitalize", statusTone(r.status))}
                      >
                        {r.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-black/55">{r.message}</p>
                    <p className="mt-1 text-[10px] text-black/35">
                      {new Date(r.checkedAt).toLocaleString("en-GB")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>SEO check settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="seo-origin">Site origin</Label>
              <Input
                id="seo-origin"
                value={form.siteOrigin}
                onChange={(e) => setForm((f) => ({ ...f, siteOrigin: e.target.value }))}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.stripTrailingSlash}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stripTrailingSlash: e.target.checked }))
                }
              />
              Strip trailing slash from URLs
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Min internal links</Label>
                <Input
                  type="number"
                  value={form.minInternalLinks}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, minInternalLinks: Number(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Title min–max</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={form.titleMin}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, titleMin: Number(e.target.value) || 1 }))
                    }
                  />
                  <Input
                    type="number"
                    value={form.titleMax}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, titleMax: Number(e.target.value) || 1 }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Description min–max</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={form.descriptionMin}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, descriptionMin: Number(e.target.value) || 1 }))
                    }
                  />
                  <Input
                    type="number"
                    value={form.descriptionMax}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, descriptionMax: Number(e.target.value) || 1 }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Approved phone numbers (one per line)</Label>
              <Textarea
                rows={3}
                value={form.approvedPhones}
                onChange={(e) => setForm((f) => ({ ...f, approvedPhones: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Approved WhatsApp links / numbers</Label>
              <Textarea
                rows={3}
                value={form.approvedWhatsapp}
                onChange={(e) => setForm((f) => ({ ...f, approvedWhatsapp: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Alert emails (one per line)</Label>
              <Textarea
                rows={3}
                value={form.alertEmails}
                onChange={(e) => setForm((f) => ({ ...f, alertEmails: e.target.value }))}
              />
            </div>
            <p className="text-xs text-black/45">
              Secrets stay in server env: INDEXNOW_KEY, GSC_PROPERTY, GSC_SERVICE_ACCOUNT_JSON.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={settingsBusy} onClick={() => void saveSettings()}>
              {settingsBusy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={csvConfirmOpen}
        onOpenChange={(open) => {
          if (!csvBusy) setCsvConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Download SEO CSV?</AlertDialogTitle>
            <AlertDialogDescription>
              Export {rows.length} published post{rows.length === 1 ? "" : "s"} with overall status,
              per-check results, and index/performance fields as a CSV file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={csvBusy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#0F766E] hover:bg-[#0d6560]"
              disabled={csvBusy}
              onClick={(e) => {
                e.preventDefault();
                void exportCsv();
              }}
            >
              {csvBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Download CSV
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
