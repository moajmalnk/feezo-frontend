import { Link } from "@tanstack/react-router";
import { Facebook, Github, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { MouseEvent, ReactNode } from "react";

import { FeezoMark } from "@/components/brand/FeezoBrand";
import { LocaleSelectBar } from "@/components/locale/LocaleSelectBar";
import { StoreBadge } from "@/components/marketing/StoreBadge";
import { TrialSignupLink } from "@/components/marketing/TrialSignupLink";
import { easeOutExpo, staggerContainer } from "@/components/marketing/motion";
import { useMarketingActiveSection } from "@/hooks/useMarketingActiveSection";
import { BRAND } from "@/lib/brand";
import { LEGAL_PAGES } from "@/lib/legal-pages";
import { MARKETING_NAV } from "@/lib/seo/marketing-pages-content";
import { pushMarketingEvent } from "@/lib/seo/analytics";
import { cn } from "@/lib/utils";

const SOCIAL_LINKS = [
  { label: "Facebook", href: "#", icon: Facebook },
  { label: "Twitter", href: "#", icon: Twitter },
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "Github", href: "#", icon: Github },
  { label: "LinkedIn", href: "#", icon: Linkedin },
] as const;

const columnReveal = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOutExpo },
  },
};

function FooterHeading({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--mkt-muted)]">
      {children}
    </p>
  );
}

function FooterNavLink({
  href,
  children,
  onClick,
  className,
}: {
  href: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "group relative inline-flex w-fit items-center py-0.5 text-[14px] font-medium text-[var(--mkt-ink)]/80 transition-colors hover:text-[var(--mkt-green-deep)]",
        className,
      )}
    >
      <span className="relative">
        {children}
        <span
          className="absolute -bottom-0.5 left-0 h-px w-0 bg-[var(--mkt-green)] transition-all duration-300 ease-out group-hover:w-full"
          aria-hidden
        />
      </span>
    </a>
  );
}

export function MarketingFooter() {
  const reduce = useReducedMotion();
  const activeSection = useMarketingActiveSection();

  return (
    <footer
      className="relative overflow-hidden text-[var(--mkt-ink)]"
      style={{
        background: "linear-gradient(180deg, #f8fff4 0%, #ffffff 38%, #f4fbf0 100%)",
      }}
    >
      <motion.div
        className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-[var(--mkt-green)]/10 blur-3xl"
        animate={reduce ? undefined : { x: [0, 18, 0], y: [0, -12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[var(--mkt-green)]/8 blur-3xl"
        animate={reduce ? undefined : { x: [0, -14, 0], y: [0, 10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="relative mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <motion.div
          className="grid grid-cols-2 gap-x-8 gap-y-10 sm:gap-x-10 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0"
          variants={staggerContainer}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, margin: "-8% 0px", amount: 0.12 }}
        >
          {/* Brand + contact */}
          <motion.div className="col-span-2 lg:col-span-4" variants={columnReveal}>
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-xl outline-offset-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <FeezoMark className="h-11 w-11" />
              <div className="leading-tight">
                <div className="text-[20px] font-bold tracking-tight">
                  Fee<span className="text-[var(--mkt-green)]">zo</span>
                </div>
                <div className="text-[11px] font-semibold tracking-[0.14em] text-[var(--mkt-muted)] uppercase">
                  {BRAND.tagline}
                </div>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-[var(--mkt-muted)]">
              School accounts simplified — fees, receipts, and reports in one clear platform.
            </p>
            <ul className="mt-4 space-y-2 text-[13.5px] text-[var(--mkt-ink)]/80">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[var(--mkt-green-deep)]" aria-hidden />
                <a
                  href={`mailto:${BRAND.contact.email}`}
                  className="hover:text-[var(--mkt-green-deep)]"
                >
                  {BRAND.contact.email}
                </a>
              </li>
              <li className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Phone className="h-4 w-4 shrink-0 text-[var(--mkt-green-deep)]" aria-hidden />
                <a
                  href={`tel:${BRAND.contact.phoneE164}`}
                  className="hover:text-[var(--mkt-green-deep)]"
                  onClick={() => pushMarketingEvent("call_click", { cta_location: "footer" })}
                >
                  {BRAND.contact.phoneDisplay}
                </a>
                <span aria-hidden className="text-[var(--mkt-muted)]">
                  ·
                </span>
                <a
                  href={`https://wa.me/${BRAND.contact.whatsappNumber}?text=${encodeURIComponent("Hi Feezo team, I'd like to know more about Feezo for my school.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-emerald-700 hover:underline"
                  onClick={() => pushMarketingEvent("whatsapp_click", { cta_location: "footer" })}
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--mkt-green-deep)]" aria-hidden />
                {BRAND.contact.location}
              </li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <TrialSignupLink
                ctaLocation="footer"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--mkt-ink)] px-5 text-[13px] font-semibold text-white transition hover:bg-[var(--mkt-ink)]/90"
              >
                Start 14-day trial
              </TrialSignupLink>
              <a
                href="/contact"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--mkt-line)] bg-white px-5 text-[13px] font-semibold text-[var(--mkt-ink)] transition hover:border-[var(--mkt-green)]/40"
                onClick={() => pushMarketingEvent("demo_request", { cta_location: "footer" })}
              >
                Book a demo
              </a>
            </div>
          </motion.div>

          {/* Explore */}
          <motion.div className="col-span-1 lg:col-span-2" variants={columnReveal}>
            <FooterHeading>Explore</FooterHeading>
            <nav className="mt-3.5 flex flex-col gap-2" aria-label="Footer navigation">
              {MARKETING_NAV.map((item) => (
                <FooterNavLink
                  key={item.path}
                  href={item.path}
                  className={
                    item.path === activeSection
                      ? "text-[var(--mkt-green)] hover:text-[var(--mkt-green-deep)]"
                      : undefined
                  }
                >
                  {item.label}
                </FooterNavLink>
              ))}
              <FooterNavLink href={BRAND.contactPath}>Contact</FooterNavLink>
            </nav>
          </motion.div>

          {/* Legal */}
          <motion.div className="col-span-1 lg:col-span-2" variants={columnReveal}>
            <FooterHeading>Legal</FooterHeading>
            <nav className="mt-3.5 flex flex-col gap-2" aria-label="Legal">
              {LEGAL_PAGES.map((item) => (
                <FooterNavLink key={item.path} href={item.path}>
                  {item.label}
                </FooterNavLink>
              ))}
              <FooterNavLink href={BRAND.supportPath}>Support</FooterNavLink>
            </nav>
          </motion.div>

          {/* App downloads — hug content width so badges don’t stretch */}
          <motion.div
            className="col-span-2 w-fit max-w-full justify-self-start lg:col-span-4"
            variants={columnReveal}
          >
            <FooterHeading>Get the app</FooterHeading>
            <p className="mt-3.5 max-w-[18rem] text-[13px] leading-relaxed text-[var(--mkt-muted)]">
              Manage fees and accounts on the go — same workspace, mobile-ready.
            </p>
            <ul className="mt-3 max-w-[18rem] space-y-1.5 text-[12.5px] leading-snug text-[var(--mkt-ink)]/70">
              <li className="flex gap-2">
                <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-[var(--mkt-green)]" aria-hidden />
                Check dues and share receipts from your phone
              </li>
              <li className="flex gap-2">
                <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-[var(--mkt-green)]" aria-hidden />
                Stay updated on pending fee follow-ups
              </li>
              <li className="flex gap-2">
                <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-[var(--mkt-green)]" aria-hidden />
                Free on Google Play and the App Store
              </li>
            </ul>
            <div className="mt-4 flex w-fit max-w-full flex-wrap items-center gap-2.5 sm:gap-3">
              <StoreBadge
                variant="play"
                reduce={reduce}
                className="w-fit min-w-[148px] flex-none"
                onClick={() =>
                  pushMarketingEvent("app_download_click", {
                    cta_location: "footer",
                    store: "google_play",
                  })
                }
              />
              <StoreBadge
                variant="apple"
                reduce={reduce}
                className="w-fit min-w-[148px] flex-none"
                onClick={() =>
                  pushMarketingEvent("app_download_click", {
                    cta_location: "footer",
                    store: "app_store",
                  })
                }
              />
            </div>
            <p className="mt-3 max-w-[18rem] text-[11.5px] leading-relaxed text-[var(--mkt-muted)]">
              Prefer the web? Open{" "}
              <a
                href={BRAND.downloadPath}
                className="font-medium text-[var(--mkt-green-deep)] underline-offset-2 hover:underline"
              >
                feezo.app/download
              </a>{" "}
              on any phone.
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          className="mt-10 flex flex-col items-center justify-between gap-5 border-t border-[var(--mkt-line)]/70 pt-6 sm:mt-12 sm:flex-row sm:items-center sm:gap-4 sm:pt-7"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-5% 0px" }}
          transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.08 }}
        >
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <p className="text-center text-[12px] font-medium text-[var(--mkt-muted)] sm:text-left">
              © {new Date().getFullYear()} {BRAND.legal.operator}. All rights reserved.
            </p>
            <LocaleSelectBar placement="top" density="compact" />
          </div>

          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/80 text-[var(--mkt-muted)] shadow-[0_4px_16px_rgba(26,28,44,0.08)] transition-colors hover:text-[var(--mkt-green-deep)]"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 + index * 0.03, duration: 0.35, ease: easeOutExpo }}
                  whileHover={reduce ? undefined : { y: -2, scale: 1.06 }}
                  whileTap={reduce ? undefined : { scale: 0.95 }}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
