import {
  Baby,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Languages,
  LineChart,
  MapPin,
  MessageCircle,
  Music,
  Receipt,
  School,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import {
  MarketingCtaBand,
  MarketingIconCard,
  MarketingPageBody,
  MarketingPageChrome,
  MarketingPageCtas,
  MarketingPageHero,
  MarketingPageH2,
  MarketingPageSection,
  MarketingRelatedLinks,
  SectionReveal,
  StaggerReveal,
} from "@/components/marketing/MarketingPageChrome";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WHO_ITS_FOR_PAGE } from "@/lib/seo/marketing-pages-content";
import { PUBLIC_PAGE_SEO } from "@/lib/seo/public-pages";
import "@/file-routes";

const AUDIENCE_ICONS: LucideIcon[] = [
  BookOpen,
  Target,
  ClipboardList,
  Languages,
  Building2,
  Music,
  Baby,
  School,
];

const SOLVE_ICONS: LucideIcon[] = [
  Wallet,
  MessageCircle,
  Receipt,
  ClipboardList,
  Users,
  LineChart,
  GraduationCap,
];

export function WhoItsForPage() {
  const p = WHO_ITS_FOR_PAGE;

  return (
    <MarketingPageChrome seo={PUBLIC_PAGE_SEO.whoItsFor}>
      <MarketingPageHero eyebrow="Who It's For" title={p.h1} lead={p.intro}>
        <MarketingPageCtas location="who_its_for" />
      </MarketingPageHero>

      <MarketingPageSection soft>
        <SectionReveal>
          <MarketingPageH2>{p.familiar.h2}</MarketingPageH2>
          <ul className="mt-6 space-y-3">
            {p.familiar.items.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-[15px] leading-relaxed text-[var(--mkt-muted)] sm:text-[16px]"
              >
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-[var(--mkt-green)]"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <MarketingPageBody className="font-medium text-[var(--mkt-ink)]">
            {p.familiar.closing}
          </MarketingPageBody>
        </SectionReveal>
      </MarketingPageSection>

      <MarketingPageSection>
        <SectionReveal>
          <div className="mx-auto max-w-2xl text-center">
            <MarketingPageH2>{p.audience.h2}</MarketingPageH2>
            <MarketingPageBody className="mx-auto">{p.audience.intro}</MarketingPageBody>
          </div>
        </SectionReveal>
        <StaggerReveal className="mt-8 grid gap-4 sm:grid-cols-2">
          {p.audience.types.map((type, index) => {
            const Icon = AUDIENCE_ICONS[index] ?? Users;
            return (
              <Link
                key={type.name}
                to="/features"
                aria-label={type.alt}
                className="group block rounded-2xl outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mkt-green)]"
              >
                <MarketingIconCard
                  icon={Icon}
                  title={type.name}
                  body={type.pitch}
                  index={index}
                />
              </Link>
            );
          })}
        </StaggerReveal>
      </MarketingPageSection>

      <MarketingPageSection soft>
        <SectionReveal>
          <MarketingPageH2 className="text-center sm:text-left">{p.solves.h2}</MarketingPageH2>
        </SectionReveal>
        <StaggerReveal className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.solves.items.map((item, index) => (
            <MarketingIconCard
              key={item.title}
              icon={SOLVE_ICONS[index] ?? CheckCircle2}
              title={item.title}
              body={item.body}
              index={index}
            />
          ))}
        </StaggerReveal>
        <SectionReveal>
          <div className="mt-8 flex justify-center">
            <Link
              to="/features"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--mkt-green-deep)] underline-offset-2 hover:underline"
            >
              {p.solves.ctaLabel}
            </Link>
          </div>
        </SectionReveal>
      </MarketingPageSection>

      <MarketingPageSection>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <SectionReveal>
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--mkt-soft)] text-[var(--mkt-green-deep)]">
              <MapPin className="h-5 w-5" aria-hidden />
            </span>
            <MarketingPageH2 className="mt-4">{p.region.h2}</MarketingPageH2>
            <MarketingPageBody>{p.region.body}</MarketingPageBody>
          </SectionReveal>
          <SectionReveal delay={0.08}>
            <ul className="space-y-4">
              {p.region.items.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-[var(--mkt-line)] bg-white p-5 shadow-[0_12px_36px_-28px_rgba(26,28,44,0.4)]"
                >
                  <h3 className="text-[15px] font-semibold text-[var(--mkt-ink)]">{item.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--mkt-muted)]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </SectionReveal>
        </div>
      </MarketingPageSection>

      <MarketingPageSection soft>
        <SectionReveal>
          <MarketingPageH2 className="text-center">{p.whyChoose.h2}</MarketingPageH2>
        </SectionReveal>
        <StaggerReveal className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.whyChoose.items.map((item, index) => (
            <MarketingIconCard
              key={item.title}
              icon={CheckCircle2}
              title={item.title}
              body={item.body}
              index={index}
            />
          ))}
        </StaggerReveal>
      </MarketingPageSection>

      <MarketingPageSection>
        <SectionReveal>
          <div className="mx-auto max-w-2xl">
            <MarketingPageH2 className="text-center">{p.faq.h2}</MarketingPageH2>
            <Accordion type="single" collapsible className="mt-6 w-full">
              {p.faq.items.map((item, index) => (
                <AccordionItem key={item.q} value={`faq-${index}`} className="border-[var(--mkt-line)]">
                  <AccordionTrigger className="text-left text-[15px] font-semibold text-[var(--mkt-ink)] hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-[var(--mkt-muted)]">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </SectionReveal>
      </MarketingPageSection>

      <MarketingPageSection soft>
        <MarketingCtaBand
          title={p.finalCta.h2}
          body={p.finalCta.body}
          location="who_its_for"
        />
        <MarketingRelatedLinks
          links={[
            { to: "/why-feezo", label: "Why Feezo" },
            { to: "/product", label: "Product" },
            { to: "/features", label: "Features" },
            { to: "/pricing", label: "Pricing" },
          ]}
        />
      </MarketingPageSection>
    </MarketingPageChrome>
  );
}
