import { useNavigate } from "@tanstack/react-router";
import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from "react";

import { HomeLeadSection } from "@/components/marketing/HomeLeadSection";
import { navigateToMarketingPath } from "@/components/marketing/MarketingNavLink";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Hero } from "@/components/marketing/sections/Hero";
import { HomeSummaries } from "@/components/marketing/sections/HomeSummaries";
import { markLandingReady } from "@/lib/boot-shell";
import { importWithRetry } from "@/lib/lazy-with-retry";
import { LEGACY_HASH_REDIRECTS } from "@/lib/seo/marketing-pages-content";
import { applyDocumentSeo, PUBLIC_PAGE_SEO } from "@/lib/seo/public-pages";

const HowItWorks = lazy(() =>
  importWithRetry(() =>
    import("@/components/marketing/sections/HowItWorks").then((m) => ({ default: m.HowItWorks })),
  ),
);
const Features = lazy(() =>
  importWithRetry(() =>
    import("@/components/marketing/sections/Features").then((m) => ({ default: m.Features })),
  ),
);
const Testimonials = lazy(() =>
  importWithRetry(() =>
    import("@/components/marketing/sections/Testimonials").then((m) => ({
      default: m.Testimonials,
    })),
  ),
);

class QuietSection extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function SectionFallback({ height }: { height: number }) {
  return <div style={{ minHeight: height }} aria-hidden />;
}

function VisualSections({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <>
      <QuietSection>
        <Suspense fallback={<SectionFallback height={980} />}>
          <HowItWorks />
        </Suspense>
      </QuietSection>
      <QuietSection>
        <Suspense fallback={<SectionFallback height={520} />}>
          <Features />
        </Suspense>
      </QuietSection>
      <QuietSection>
        <Suspense fallback={<SectionFallback height={560} />}>
          <Testimonials />
        </Suspense>
      </QuietSection>
    </>
  );
}

export function MarketingLanding() {
  const navigate = useNavigate();
  const [showFooter, setShowFooter] = useState(false);
  const [showVisuals, setShowVisuals] = useState(false);

  useEffect(() => {
    applyDocumentSeo(PUBLIC_PAGE_SEO.home);
    let cancelled = false;
    let timer = 0;
    // Landing chunk is mounted — clear the HTML shell after a short paint beat
    // so LCP poster and SPA hero don't fight. Always mark ready so 3G timers
    // cannot blank the page while Suspense is still pending.
    const reveal = () => {
      if (cancelled) return;
      markLandingReady();
      window.dispatchEvent(new Event("feezo:hydrated"));
      setShowVisuals(true);
    };
    const arm = () => {
      timer = window.setTimeout(reveal, 700);
    };
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => window.requestAnimationFrame(arm));
    } else {
      arm();
    }
    const safety = window.setTimeout(reveal, 2500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(safety);
      markLandingReady();
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    const target = LEGACY_HASH_REDIRECTS[hash];
    if (!target) return;
    navigateToMarketingPath(navigate, target, { replace: true });
  }, [navigate]);

  return (
    <MarketingShell showFooter={showFooter}>
      <Hero />
      {showVisuals ? (
        <VisualSections onReady={() => setShowFooter(true)} />
      ) : (
        <SectionFallback height={400} />
      )}
      <HomeSummaries />
      <HomeLeadSection />
    </MarketingShell>
  );
}
