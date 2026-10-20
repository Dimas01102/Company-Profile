// ----------------------------------------------------------------------------
// WEBSITE SETTINGS SERVICE, talks to the real Laravel API
// (/api/admin/settings). Exported names are unchanged from the old mock
// version so admin.settings.tsx doesn't need to change.
//
// Company name, logo, contact details, social links, and SEO metadata are
// owned by the Company Profile module (/admin/company-profile), this
// service only covers homepage section toggles and footer content so the
// two screens don't duplicate the same fields.
// ----------------------------------------------------------------------------

import { api } from "@/lib/api-client";

export type FooterLink = { id: string; label: string; url: string };

export type WebsiteSettings = {
  // Homepage
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaUrl: string;
  showStats: boolean;
  showWhyChooseUs: boolean;
  showFeaturedProducts: boolean;
  showLatestNews: boolean;
  showFinalCta: boolean;
  // Footer
  footerDescription: string;
  copyrightText: string;
  footerLinks: FooterLink[];
};

type RawSettings = {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroCtaText: string | null;
  heroCtaUrl: string | null;
  showStats: boolean | null;
  showWhyChooseUs: boolean | null;
  showFeaturedProducts: boolean | null;
  showLatestNews: boolean | null;
  showFinalCta: boolean | null;
  footerDescription: string | null;
  copyrightText: string;
  footerLinks: { id: number; label: string; url: string; order: number }[] | null;
};

function normalize(raw: RawSettings): WebsiteSettings {
  return {
    heroTitle: raw.heroTitle ?? "",
    heroSubtitle: raw.heroSubtitle ?? "",
    heroCtaText: raw.heroCtaText ?? "",
    heroCtaUrl: raw.heroCtaUrl ?? "",
    showStats: raw.showStats ?? true,
    showWhyChooseUs: raw.showWhyChooseUs ?? true,
    showFeaturedProducts: raw.showFeaturedProducts ?? true,
    showLatestNews: raw.showLatestNews ?? true,
    showFinalCta: raw.showFinalCta ?? true,
    footerDescription: raw.footerDescription ?? "",
    copyrightText: raw.copyrightText,
    footerLinks: (raw.footerLinks ?? [])
      .sort((a, b) => a.order - b.order)
      .map((l) => ({ id: String(l.id), label: l.label, url: l.url })),
  };
}

export async function getSettings(): Promise<WebsiteSettings> {
  const raw = await api.get<RawSettings>("/admin/settings");
  return normalize(raw);
}

export async function updateSettings(input: WebsiteSettings): Promise<WebsiteSettings> {
  const { footerLinks, ...rest } = input;
  const raw = await api.put<RawSettings>("/admin/settings", {
    ...rest,
    footerLinks: footerLinks.map((l, i) => ({
      label: l.label,
      url: l.url,
      order: i,
    })),
  });
  return normalize(raw);
}
