import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";

import { HeroShowcase } from "@/components/marketing/HeroShowcase";
import { StoreBadgeRow } from "@/components/marketing/StoreBadge";
import { TrialSignupLink } from "@/components/marketing/TrialSignupLink";
import { easeOutExpo } from "@/components/marketing/motion";
import { HOME_PAGE } from "@/lib/seo/marketing-pages-content";
import { pushMarketingEvent } from "@/lib/seo/analytics";

export function Hero({ noDelay = false }: { noDelay?: boolean }) {
  const reduce = useReducedMotion();
  const baseDelay = noDelay ? 0 : 0.12;

  return (
    <section className="relative overflow-hidden bg-white pt-4 pb-14 sm:pt-8 sm:pb-20 lg:pb-24">
      <div className="mx-auto flex max-w-6xl flex-col px-5 sm:px-8 lg:px-10">
        <p className="text-center text-[14px] font-semibold tracking-[0.08em] text-[var(--mkt-muted)] uppercase sm:text-[15px]">
          {HOME_PAGE.eyebrow}
        </p>
        <h1
          id="hero-heading"
          className="mt-3 text-center text-[clamp(1.85rem,5.5vw,3.25rem)] font-extrabold leading-[1.12] tracking-tight text-[var(--mkt-ink)]"
        >
          {HOME_PAGE.h1}
        </h1>
        <p className="mt-3 text-center text-[clamp(1.05rem,2.4vw,1.35rem)] font-semibold text-[var(--mkt-green-deep)]">
          {HOME_PAGE.tagline}
        </p>

        <div className="relative mt-8 w-full sm:mt-10 lg:mt-12">
          <HeroShowcase alt={HOME_PAGE.heroImageAlt} startDelayMs={noDelay ? 0 : 900} />
        </div>

        <motion.div
          className="mt-10 flex flex-col items-center gap-7 sm:mt-14 sm:flex-row sm:items-end sm:justify-between sm:gap-10"
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: easeOutExpo, delay: baseDelay + 0.22 }}
        >
          <p className="max-w-lg px-1 text-center text-[clamp(0.95rem,2.4vw,1.25rem)] font-medium leading-relaxed text-[var(--mkt-ink)] sm:px-0 sm:text-left sm:leading-snug">
            {HOME_PAGE.intro}
          </p>

          <div className="flex w-full flex-col items-center gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-end sm:gap-3">
            <TrialSignupLink
              ctaLocation="hero"
              className="inline-flex h-11 w-full max-w-[17.5rem] items-center justify-center whitespace-nowrap rounded-lg bg-[var(--mkt-green)] px-5 text-[14px] font-semibold text-white transition hover:bg-[var(--mkt-green-deep)] sm:w-auto sm:max-w-none"
            >
              {HOME_PAGE.primaryCta}
            </TrialSignupLink>
            <Link
              to="/contact"
              onClick={() => pushMarketingEvent("demo_request", { cta_location: "hero" })}
              className="inline-flex h-11 w-full max-w-[17.5rem] items-center justify-center whitespace-nowrap rounded-lg border border-[var(--mkt-line)] bg-white px-5 text-[14px] font-semibold text-[var(--mkt-ink)] transition hover:border-[var(--mkt-green)]/40 sm:w-auto sm:max-w-none"
            >
              {HOME_PAGE.secondaryCta}
            </Link>
            <StoreBadgeRow reduce={reduce} ctaLocation="hero" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
