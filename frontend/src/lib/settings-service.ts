// ----------------------------------------------------------------------------
// MOCK WEBSITE SETTINGS SERVICE — homepage and footer configuration.
// In-memory only. Each function maps 1:1 to a future Laravel API endpoint.
//
// Company name, logo, contact details, social links, and SEO metadata are
// owned by the Company Profile module (/admin/company-profile) — this
// service only covers homepage section toggles and footer content so the
// two screens don't duplicate the same fields.
// ----------------------------------------------------------------------------

import { logActivity } from "@/lib/activity-log-service";

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

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

let settingsStore: WebsiteSettings = {
  heroTitle: "Powering Indonesia's Industrial Growth",
  heroSubtitle:
    "PT Batam Konektra Jaya designs, manufactures, and integrates electrical power equipment for utilities, industrial plants, and infrastructure projects across Indonesia.",
  heroCtaText: "Explore Products",
  heroCtaUrl: "/products",
  showStats: true,
  showWhyChooseUs: true,
  showFeaturedProducts: true,
  showLatestNews: true,
  showFinalCta: true,
  footerDescription:
    "PT Batam Konektra Jaya is an industrial engineering company manufacturing transformers, switchgear, generators, and power distribution equipment in Batam, Indonesia.",
  copyrightText: `© ${new Date().getFullYear()} PT Batam Konektra Jaya. All rights reserved.`,
  footerLinks: [
    { id: "fl-1", label: "About Us", url: "/about" },
    { id: "fl-2", label: "Products", url: "/products" },
    { id: "fl-3", label: "News", url: "/news" },
    { id: "fl-4", label: "Contact", url: "/contact" },
  ],
};

// --- settings service (GET/PUT /api/admin/settings) -------------------------
export async function getSettings(): Promise<WebsiteSettings> {
  await delay(400);
  return clone(settingsStore);
}

export async function updateSettings(input: WebsiteSettings): Promise<WebsiteSettings> {
  await delay(650);
  settingsStore = clone(input);
  logActivity({
    action: "Update",
    module: "Settings",
    description: "Updated homepage and footer settings",
    affectedData: "Website Settings",
  });
  return clone(settingsStore);
}
