import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Clock,
  KeyRound,
  LifeBuoy,
  Mail,
  MessageCircle,
  Phone,
  Shield,
  Trash2,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";

import { TrialSignupLink } from "@/components/marketing/TrialSignupLink";
import { easeOutExpo } from "@/components/marketing/motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { BRAND } from "@/lib/brand";
import { pushMarketingEvent } from "@/lib/seo/analytics";
import { SUPPORT_PAGE_SEO } from "@/lib/seo/marketing-pages-content";
import { applyDocumentSeo, PUBLIC_PAGE_SEO, whatsappChatUrl } from "@/lib/seo/public-pages";
import { cn } from "@/lib/utils";

const C = BRAND.contact;
const SUPPORT_EMAIL = BRAND.legal.supportEmail;

const CHANNELS = [
  {
    id: "email",
    label: "Email support",
    value: SUPPORT_EMAIL,
    hint: "Account, billing, and product help",
    href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Feezo support request")}`,
    cta: "Email us",
    icon: Mail,
    tone: "bg-sky-50 text-sky-700",
    external: false,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    value: C.whatsappDisplay,
    hint: "Fastest reply during working hours",
    href: whatsappChatUrl("Hi Feezo support, I need help with my school workspace."),
    cta: "Chat on WhatsApp",
    icon: WhatsAppIcon,
    tone: "bg-emerald-50 text-emerald-700",
    external: true,
  },
  {
    id: "phone",
    label: "Phone",
    value: C.phoneDisplay,
    hint: C.hours,
    href: `tel:${C.phoneE164}`,
    cta: "Call now",
    icon: Phone,
    tone: "bg-amber-50 text-amber-700",
    external: false,
  },
] as const;

const TOPICS = [
  {
    title: "Sign-in & passwords",
    body: "Reset school admin or staff passwords, unlock accounts, and fix Google sign-in.",
    href: "/forgot-password",
    icon: KeyRound,
  },
  {
    title: "Billing & trials",
    body: "Questions about plans, invoices, renewals, or extending a trial.",
    href: "/pricing",
    icon: BookOpen,
  },
  {
    title: "Account & data deletion",
    body: "Request removal of your login and personal data for App Store / Play compliance.",
    href: BRAND.legal.dataDeletionPath,
    icon: Trash2,
  },
  {
    title: "Privacy & security",
    body: "How Feezo handles school data, access control, and privacy commitments.",
    href: BRAND.legal.privacyPath,
    icon: Shield,
  },
] as const;

function Pill({ children, icon }: { children: ReactNode; icon: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--mkt-line)] bg-white/80 px-3 py-1.5 shadow-sm">
      <span className="text-[var(--mkt-green-deep)]">{icon}</span>
      {children}
    </span>
  );
}

export function SupportPage() {
  const reduce = useReducedMotion();

  useEffect(() => {
    applyDocumentSeo(PUBLIC_PAGE_SEO.support);
  }, []);

  const fadeUp = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: { duration: 0.55, ease: easeOutExpo, delay },
        };

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
        style={{
          background:
            "radial-gradient(60% 55% at 50% 0%, rgba(143,202,74,0.16) 0%, rgba(143,202,74,0.05) 48%, transparent 75%)",
        }}
      />

      <section className="relative mx-auto max-w-6xl px-5 pb-8 pt-10 text-center sm:px-8 sm:pt-14 lg:px-10">
        <motion.div
          {...fadeUp()}
          className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--mkt-green)]/15 text-[var(--mkt-green-deep)]"
        >
          <LifeBuoy className="h-7 w-7" aria-hidden />
        </motion.div>
        <motion.h1
          {...fadeUp(0.04)}
          className="mx-auto max-w-3xl text-[2.1rem] font-bold leading-[1.1] tracking-tight text-[var(--mkt-ink)] sm:text-[3rem]"
        >
          {SUPPORT_PAGE_SEO.h1}
        </motion.h1>
        <motion.p
          {...fadeUp(0.08)}
          className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--mkt-muted)] sm:text-[17px]"
        >
          {SUPPORT_PAGE_SEO.intro}
        </motion.p>
        <motion.div
          {...fadeUp(0.12)}
          className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[12.5px] font-medium text-[var(--mkt-ink)]/70"
        >
          <Pill icon={<Clock className="h-3.5 w-3.5" aria-hidden />}>{C.responseTime}</Pill>
          <Pill icon={<Phone className="h-3.5 w-3.5" aria-hidden />}>{C.hours}</Pill>
          <Pill icon={<MessageCircle className="h-3.5 w-3.5" aria-hidden />}>
            In-app tickets for signed-in schools
          </Pill>
        </motion.div>
      </section>

      <section
        className="relative mx-auto max-w-6xl px-5 sm:px-8 lg:px-10"
        aria-labelledby="support-channels-heading"
      >
        <h2
          id="support-channels-heading"
          className="mb-5 text-center text-[1.25rem] font-bold tracking-tight text-[var(--mkt-ink)] sm:text-[1.4rem]"
        >
          {SUPPORT_PAGE_SEO.channels.h2}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {CHANNELS.map((ch, i) => {
            const Icon = ch.icon;
            return (
              <motion.a
                key={ch.id}
                {...fadeUp(0.05 * i)}
                href={ch.href}
                target={ch.external ? "_blank" : undefined}
                rel={ch.external ? "noopener noreferrer" : undefined}
                onClick={() => {
                  if (ch.id === "whatsapp") {
                    pushMarketingEvent("whatsapp_click", { cta_location: "support" });
                  } else if (ch.id === "phone") {
                    pushMarketingEvent("call_click", { cta_location: "support" });
                  }
                }}
                className="group flex flex-col rounded-2xl border border-[var(--mkt-line)] bg-white p-5 text-left shadow-[0_10px_30px_-18px_rgba(26,28,44,0.28)] transition hover:-translate-y-0.5 hover:border-[var(--mkt-green)]/35"
              >
                <span className={cn("grid h-11 w-11 place-items-center rounded-xl", ch.tone)}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="mt-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--mkt-muted)]">
                  {ch.label}
                </span>
                <span className="mt-1 text-[16px] font-semibold tracking-tight text-[var(--mkt-ink)]">
                  {ch.value}
                </span>
                <span className="mt-1 text-[13px] leading-relaxed text-[var(--mkt-muted)]">
                  {ch.hint}
                </span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--mkt-green-deep)]">
                  {ch.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </motion.a>
            );
          })}
        </div>
      </section>

      <section
        className="relative mx-auto mt-14 max-w-6xl px-5 sm:mt-16 sm:px-8 lg:px-10"
        aria-labelledby="support-topics-heading"
      >
        <h2
          id="support-topics-heading"
          className="text-center text-[1.25rem] font-bold tracking-tight text-[var(--mkt-ink)] sm:text-[1.4rem]"
        >
          {SUPPORT_PAGE_SEO.topics.h2}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-[14px] text-[var(--mkt-muted)]">
          {SUPPORT_PAGE_SEO.topics.body}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {TOPICS.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <motion.div key={topic.title} {...fadeUp(0.04 * i)}>
                <a
                  href={topic.href}
                  className="flex h-full gap-4 rounded-2xl border border-[var(--mkt-line)] bg-white/90 p-4 transition hover:border-[var(--mkt-green)]/40 hover:bg-white"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--mkt-soft)] text-[var(--mkt-green-deep)]">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-[var(--mkt-ink)]">
                      {topic.title}
                    </span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-[var(--mkt-muted)]">
                      {topic.body}
                    </span>
                  </span>
                </a>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section
        className="relative mx-auto mt-14 max-w-3xl px-5 pb-4 sm:mt-16 sm:px-8 lg:px-10"
        aria-labelledby="support-faq-heading"
      >
        <h2
          id="support-faq-heading"
          className="text-center text-[1.25rem] font-bold tracking-tight text-[var(--mkt-ink)] sm:text-[1.4rem]"
        >
          {SUPPORT_PAGE_SEO.faq.h2}
        </h2>
        <Accordion type="single" collapsible className="mt-6 rounded-2xl border border-[var(--mkt-line)] bg-white px-4 sm:px-5">
          {SUPPORT_PAGE_SEO.faq.items.map((item, index) => (
            <AccordionItem key={item.q} value={`faq-${index}`} className="border-[var(--mkt-line)]">
              <AccordionTrigger className="py-4 text-left text-[14.5px] font-semibold text-[var(--mkt-ink)] hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-[14px] leading-relaxed text-[var(--mkt-muted)]">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16 lg:px-10">
        <motion.div
          {...fadeUp()}
          className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-[var(--mkt-line)] bg-[linear-gradient(135deg,#0B1B33_0%,#0F766E_100%)] p-6 text-white sm:flex-row sm:items-center sm:p-8"
        >
          <div className="max-w-xl">
            <h2 className="text-[1.25rem] font-bold tracking-tight sm:text-[1.4rem]">
              Already using Feezo?
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-white/75">
              Sign in and open Settings → Support to raise a ticket from your school workspace. For
              demos and sales, use Contact instead.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/login"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-[13.5px] font-semibold text-[#0B1B33] transition hover:bg-white/90"
            >
              Sign in
            </Link>
            <Link
              to="/contact"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-5 text-[13.5px] font-semibold text-white transition hover:bg-white/15"
            >
              Contact sales
            </Link>
            <TrialSignupLink
              ctaLocation="support"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/30 bg-transparent px-5 text-[13.5px] font-semibold text-white transition hover:bg-white/10"
            >
              Start free trial
            </TrialSignupLink>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
