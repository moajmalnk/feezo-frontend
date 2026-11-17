/** Product identity — used in chrome, PWA, and auth. */
export const BRAND = {
  name: "Feezo",
  tagline: "Edu Books",
  mark: "/icons/feezo-mark.webp",
  /** Tenant workspace host suffix (subdomain.feezo.app). */
  tenantHostSuffix: "feezo.app",
  /** Google Play listing — used by marketing store badges. */
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.bzole.feezo",
  appStoreUrl: "https://apps.apple.com/in/app/feezo/id6811416005",
  /** Smart download landing — QR codes encode this; store buttons live on /download. */
  downloadPath: "/download",
  downloadUrl: "https://www.feezo.app/download",
  contactPath: "/contact",
  contact: {
    email: "info@feezo.app",
    phoneDisplay: "+91 94473 39048",
    phoneE164: "+919447339048",
    whatsappDisplay: "+91 94473 39048",
    /** wa.me expects digits only, no + */
    whatsappNumber: "919447339048",
    location: "Malappuram, Kerala",
    registeredAddress:
      "Building No. 15-566/G, Kuzhimanna, Melekeezhisseri, Malappuram, Kerala - 673641",
    country: "India",
    hours: "Mon – Sat · 9:30 AM – 6:30 PM IST",
    responseTime: "Replies within 1 business day",
    mapQuery:
      "Building No. 15-566/G, Kuzhimanna, Melekeezhisseri, Malappuram, Kerala 673641",
  },
  legal: {
    termsPath: "/terms",
    privacyPath: "/privacy",
    refundPolicyPath: "/refund-policy",
    dataDeletionPath: "/data-deletion",
    termsUrl: "https://www.feezo.app/terms",
    privacyUrl: "https://www.feezo.app/privacy",
    refundPolicyUrl: "https://www.feezo.app/refund-policy",
    dataDeletionUrl: "https://www.feezo.app/data-deletion",
    supportEmail: "support@feezo.app",
    operator: "MAC ADZ",
    operatorNotice:
      "Feezo (feezo.app) is a proprietary software platform owned and operated by MAC ADZ. All payment processing, merchant billing, and settlements are managed under MAC ADZ.",
  },
} as const;

/** Canonical school workspace host, e.g. nice.feezo.app */
export function formatTenantHost(subdomain: string): string {
  const slug = subdomain.trim().toLowerCase();
  return slug ? `${slug}.${BRAND.tenantHostSuffix}` : BRAND.tenantHostSuffix;
}
