// ----------------------------------------------------------------------------
// MOCK BANNER SERVICE — homepage banner/slider management for the admin console.
// In-memory only. Each function maps 1:1 to a future Laravel API endpoint.
// ----------------------------------------------------------------------------

import { logActivity } from "@/lib/activity-log-service";

export type BannerStatus = "Active" | "Inactive";

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaUrl: string;
  order: number;
  startDate: string;
  endDate: string;
  status: BannerStatus;
};

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function iso(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);
}
function isoFuture(daysAhead: number) {
  return new Date(Date.now() + daysAhead * 86400000).toISOString().slice(0, 10);
}

let bannerStore: Banner[] = [
  {
    id: "b-001",
    title: "Powering Indonesia's Industrial Growth",
    subtitle: "Transformers, switchgear, and generators engineered for the harshest environments.",
    image: "hero-transformer.jpg",
    ctaText: "Explore Products",
    ctaUrl: "/products",
    order: 1,
    startDate: iso(30),
    endDate: isoFuture(60),
    status: "Active",
  },
  {
    id: "b-002",
    title: "ISO 45001 Certified Manufacturing",
    subtitle: "Our Batam facility meets international safety and quality standards.",
    image: "about-facility.jpg",
    ctaText: "About Us",
    ctaUrl: "/about",
    order: 2,
    startDate: iso(10),
    endDate: isoFuture(90),
    status: "Active",
  },
  {
    id: "b-003",
    title: "Electra Expo 2025 Recap",
    subtitle: "See highlights from our latest industry showcase.",
    image: "news-2.jpg",
    ctaText: "Read More",
    ctaUrl: "/news",
    order: 3,
    startDate: iso(120),
    endDate: iso(30),
    status: "Inactive",
  },
];

// --- banner service (GET/POST/PUT/DELETE /api/admin/banners) ---------------
export async function getBanners(): Promise<Banner[]> {
  await delay(400);
  return clone(bannerStore).sort((a, b) => a.order - b.order);
}

export async function createBanner(input: Omit<Banner, "id">): Promise<Banner> {
  await delay(600);
  const created: Banner = { ...clone(input), id: `b-${Date.now()}` };
  bannerStore = [...bannerStore, created];
  logActivity({
    action: "Create",
    module: "Banners",
    description: "Created a homepage banner",
    affectedData: created.title,
  });
  return created;
}

export async function updateBanner(id: string, input: Omit<Banner, "id">): Promise<Banner> {
  await delay(600);
  const updated: Banner = { ...clone(input), id };
  bannerStore = bannerStore.map((b) => (b.id === id ? updated : b));
  logActivity({
    action: "Update",
    module: "Banners",
    description: "Updated a homepage banner",
    affectedData: updated.title,
  });
  return updated;
}

export async function deleteBanner(id: string): Promise<void> {
  await delay(500);
  const target = bannerStore.find((b) => b.id === id);
  bannerStore = bannerStore.filter((b) => b.id !== id);
  logActivity({
    action: "Delete",
    module: "Banners",
    description: "Deleted a homepage banner",
    affectedData: target?.title ?? id,
  });
}

export async function reorderBanner(id: string, direction: "up" | "down"): Promise<Banner[]> {
  await delay(280);
  const sorted = [...bannerStore].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((b) => b.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= sorted.length) return clone(sorted);
  const a = sorted[index]!;
  const b = sorted[target]!;
  const swap = a.order;
  a.order = b.order;
  b.order = swap;
  bannerStore = sorted;
  return clone(sorted).sort((x, y) => x.order - y.order);
}

export function emptyBanner(order: number): Omit<Banner, "id"> {
  return {
    title: "",
    subtitle: "",
    image: "",
    ctaText: "Learn More",
    ctaUrl: "/",
    order,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    status: "Active",
  };
}
