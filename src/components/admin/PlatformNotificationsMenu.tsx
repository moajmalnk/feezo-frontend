import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  Clock,
  LifeBuoy,
  Loader2,
  Mail,
  School,
  type LucideIcon,
} from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchSuperAdminOverview } from "@/lib/api/super-admin";
import { fetchLeadSummary, type LeadSummary } from "@/lib/api/leads";
import { fetchSuperAdminSupport } from "@/lib/api/support";
import { getApiToken } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const EMPTY_LEAD_SUMMARY: LeadSummary = {
  unreadCount: 0,
  counts: {
    all: 0,
    open: 0,
    followup: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    demo_scheduled: 0,
    won: 0,
    lost: 0,
    spam: 0,
  },
};

type PlatformAlert = {
  id: string;
  title: string;
  detail: string;
  href: string;
  Icon: LucideIcon;
  tone: string;
};

function buildAlerts(input: {
  overdue: number;
  trial: number;
  supportUnread: number;
  leadsUnread: number;
  newThisWeek: number;
}): PlatformAlert[] {
  const alerts: PlatformAlert[] = [];

  if (input.overdue > 0) {
    alerts.push({
      id: "overdue",
      title:
        input.overdue === 1
          ? "1 school payment overdue"
          : `${input.overdue} schools payment overdue`,
      detail: "Review billing status in Tenants",
      href: "/super-admin/tenants",
      Icon: AlertTriangle,
      tone: "bg-amber-50 text-amber-700",
    });
  }

  if (input.trial > 0) {
    alerts.push({
      id: "trial",
      title: input.trial === 1 ? "1 school on trial" : `${input.trial} schools on trial`,
      detail: "Convert or follow up before trial ends",
      href: "/super-admin/tenants",
      Icon: Clock,
      tone: "bg-violet-50 text-violet-700",
    });
  }

  if (input.supportUnread > 0) {
    alerts.push({
      id: "support",
      title:
        input.supportUnread === 1
          ? "1 unread support message"
          : `${input.supportUnread} unread support messages`,
      detail: "Open Support to reply",
      href: "/super-admin/support",
      Icon: LifeBuoy,
      tone: "bg-teal-50 text-[#0F766E]",
    });
  }

  if (input.leadsUnread > 0) {
    alerts.push({
      id: "leads",
      title:
        input.leadsUnread === 1
          ? "1 unread contact lead"
          : `${input.leadsUnread} unread contact leads`,
      detail: "Open Support → Leads",
      href: "/super-admin/support/leads",
      Icon: Mail,
      tone: "bg-sky-50 text-sky-700",
    });
  }

  if (input.newThisWeek > 0) {
    alerts.push({
      id: "signups",
      title:
        input.newThisWeek === 1
          ? "1 new school this week"
          : `${input.newThisWeek} new schools this week`,
      detail: "See recent registrations on Overview",
      href: "/super-admin/overview",
      Icon: School,
      tone: "bg-emerald-50 text-emerald-700",
    });
  }

  return alerts;
}

export function PlatformNotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<PlatformAlert[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!getApiToken()) {
      setAlerts([]);
      setLoaded(true);
      return;
    }
    setLoading(true);
    try {
      const [overview, support, leads] = await Promise.all([
        fetchSuperAdminOverview().catch(() => null),
        fetchSuperAdminSupport().catch(() => ({ unreadCount: 0 })),
        fetchLeadSummary().catch(() => EMPTY_LEAD_SUMMARY),
      ]);

      const statusRows = overview?.statusBreakdown ?? [];
      const overdue =
        statusRows.find((s) => s.name === "Overdue")?.count ?? 0;
      const trial =
        overview?.trialTenants ??
        statusRows.find((s) => s.name === "Trial")?.count ??
        0;
      const newThisWeek = overview?.thisWeekSignups ?? 0;

      setAlerts(
        buildAlerts({
          overdue,
          trial,
          supportUnread: support.unreadCount ?? 0,
          leadsUnread: leads.unreadCount ?? 0,
          newThisWeek,
        }),
      );
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void load();
  }, [open, load]);

  // Light prefetch so the unread dot is accurate without opening the menu
  useEffect(() => {
    void load();
  }, [load]);

  const unread = alerts.length;
  const subtitle = useMemo(() => {
    if (loading && !loaded) return "Loading alerts…";
    if (unread === 0) return "You're all caught up";
    return unread === 1 ? "1 platform alert" : `${unread} platform alerts`;
  }, [loading, loaded, unread]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative hidden h-10 w-10 place-items-center rounded-full border border-[#E5E5E5] bg-white text-black/55 transition-colors hover:bg-black hover:text-white xl:grid"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#0F766E]" />
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="z-[250] w-[min(22rem,calc(100vw-1.5rem))] gap-0 overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white p-0 shadow-[0_20px_60px_-28px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#E5E5E5] px-4 py-3">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-black">Notifications</div>
            <div className="mt-0.5 text-[11.5px] text-black/45">{subtitle}</div>
          </div>
          {loading ? <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-black/35" /> : null}
        </div>

        <div className="max-h-[min(24rem,60vh)] overflow-y-auto">
          {alerts.length === 0 && !loading ? (
            <div className="px-4 py-8 text-center text-[13px] text-black/45">
              No platform alerts right now
            </div>
          ) : (
            <ul className="divide-y divide-[#E5E5E5]/80 py-1">
              {alerts.map((alert) => {
                const Icon = alert.Icon;
                return (
                  <li key={alert.id}>
                    <Link
                      to={alert.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[#F4F6F9]"
                    >
                      <span
                        className={cn(
                          "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full",
                          alert.tone,
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-black">
                          {alert.title}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] text-black/45">
                          {alert.detail}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-[#E5E5E5] bg-[#FAFBFC] px-4 py-2.5">
          <Link
            to="/super-admin/support"
            onClick={() => setOpen(false)}
            className="text-[12px] font-semibold text-[#0F766E] hover:underline"
          >
            Open support desk
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
