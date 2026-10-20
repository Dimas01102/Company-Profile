import { api } from "@/lib/api-client";
import { joinAddress, mapEmbedFor, mapsLinkFor, parseBusinessHours } from "@/lib/company-display";
import type { Product, NewsArticle, GalleryItem } from "@/lib/mock-data";

type RawSpec = { id: number; label: string; value: string };
type RawGalleryImageRef = { id: number; url: string };

type RawProduct = {
  id: number;
  slug: string;
  name: string;
  category: string;
  brand: string | null;
  availability: "Available" | "Limited Stock" | "Out of Stock";
  shortDescription: string | null;
  mainImage: string | null;
  gallery?: RawGalleryImageRef[];
  description: string | null;
  features: string | null;
  applications: string | null;
  standards: string | null;
  brochure?: string | null;
  datasheet?: string | null;
  specs?: RawSpec[];
  sku?: string | null;
  model?: string | null;
  advantages?: string | null;
  industries?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  ogImage?: string | null;
};

function splitLines(value: string | null): string[] {
  return (value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function normalizeProduct(raw: RawProduct): Product {
  return {
    id: String(raw.id),
    slug: raw.slug,
    name: raw.name,
    category: raw.category,
    brand: raw.brand ?? "",
    availability: raw.availability,
    shortDescription: raw.shortDescription ?? "",
    image: raw.mainImage ?? "",
    // The detail page shows `gallery[0]` as the large picture, so the main
    // image has to lead the list, otherwise a product that only has a main
    // image (no extra gallery photos) would render with no picture at all.
    gallery: [raw.mainImage, ...(raw.gallery ?? []).map((g) => g.url)].filter(
      (url): url is string => !!url,
    ),
    description: splitLines(raw.description),
    features: splitLines(raw.features),
    specs: (raw.specs ?? []).map((s) => ({ label: s.label, value: s.value })),
    applications: splitLines(raw.applications),
    standards: splitLines(raw.standards),
    brochure: raw.brochure ?? "",
    datasheet: raw.datasheet ?? "",
    sku: raw.sku ?? "",
    model: raw.model ?? "",
    advantages: splitLines(raw.advantages ?? null),
    industries: splitLines(raw.industries ?? null),
    metaTitle: raw.metaTitle ?? "",
    metaDescription: raw.metaDescription ?? "",
    keywords: raw.keywords ?? "",
    ogImage: raw.ogImage ?? "",
  };
}

export async function getPublicProducts(): Promise<Product[]> {
  const raw = await api.get<RawProduct[]>("/products", { perPage: 1000 });
  return raw.map(normalizeProduct);
}

export async function getPublicProduct(
  slug: string,
): Promise<(Product & { related: Product[] }) | null> {
  try {
    const raw = await api.get<RawProduct & { related: RawProduct[] }>(`/products/${slug}`);
    return {
      ...normalizeProduct(raw),
      related: raw.related.map(normalizeProduct),
    };
  } catch {
    return null;
  }
}

// --- news --------------------------------------------------------------
type RawNews = {
  id: number;
  title: string;
  slug: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  summary: string | null;
  content: string | null;
  thumbnail: string | null;
  gallery?: { id: number; url: string }[] | null;
  tags: string;
  featured: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
};

function normalizeNews(raw: RawNews): NewsArticle {
  return {
    id: String(raw.id),
    slug: raw.slug,
    title: raw.title,
    category: raw.category,
    author: raw.author,
    date: raw.date,
    readTime: raw.readTime,
    excerpt: raw.summary ?? "",
    content: raw.content ? raw.content.split(/\n\n+/) : [],
    image: raw.thumbnail ?? "",
    tags: raw.tags
      ? raw.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    featured: raw.featured,
    gallery: (raw.gallery ?? []).map((g) => g.url),
    metaTitle: raw.metaTitle ?? "",
    metaDescription: raw.metaDescription ?? "",
    metaKeywords: raw.metaKeywords ?? "",
  };
}

export async function getPublicNews(): Promise<NewsArticle[]> {
  const raw = await api.get<RawNews[]>("/news", { perPage: 1000 });
  return raw.map(normalizeNews);
}

export async function getPublicNewsArticle(
  slug: string,
): Promise<(NewsArticle & { related: NewsArticle[] }) | null> {
  try {
    const raw = await api.get<RawNews & { related: RawNews[] }>(`/news/${slug}`);
    return { ...normalizeNews(raw), related: raw.related.map(normalizeNews) };
  } catch {
    return null;
  }
}

// --- company profile / team -----------------------------------------------
export type PublicCompany = {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  founded: number;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  whatsappNumber: string;
  hours: string;
  hoursDetail: { day: string; hours: string }[];
  /** Ready-to-use <iframe src>, or "" when no map is set. */
  mapEmbed: string;
  /** "Open in Google Maps" link (exact coordinates when known). */
  mapsLink: string;
  logo: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  fullDescription: string;
  history: string;
  businessType: string;
  industry: string;
  businessScope: string;
  background: string;
  vision: string;
  mission: string;
  profilePdf: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  coreValues: { id: string; name: string; description: string; icon: string }[];
};

type RawCompanyProfile = {
  name: string;
  tagline: string | null;
  shortDescription: string | null;
  foundedYear: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  businessHours: string | null;
  mapEmbed: string | null;
  latitude: string | null;
  longitude: string | null;
  logo: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
  fullDescription: string | null;
  history: string | null;
  businessType: string | null;
  industry: string | null;
  businessScope: string | null;
  background: string | null;
  vision: string | null;
  mission: string | null;
  profilePdf: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  ogImage: string | null;
  coreValues?: { id: number; name: string; description: string | null; icon: string }[];
};

export async function getPublicCompany(): Promise<PublicCompany> {
  const raw = await api.get<RawCompanyProfile>("/company-profile");
  const fullAddress = joinAddress(raw);

  return {
    name: raw.name,
    shortName: raw.name.split(" ").pop() ?? raw.name,
    tagline: raw.tagline ?? "",
    description: raw.shortDescription ?? "",
    founded: raw.foundedYear ? parseInt(raw.foundedYear, 10) : new Date().getFullYear(),
    address: fullAddress,
    phone: raw.phone ?? "",
    email: raw.email ?? "",
    whatsapp: raw.whatsapp ?? "",
    whatsappNumber: (raw.whatsapp ?? "").replace(/\D/g, ""),
    hours: raw.businessHours ?? "",
    hoursDetail: parseBusinessHours(raw.businessHours),
    mapEmbed: mapEmbedFor(raw.mapEmbed ?? "", raw.latitude ?? "", raw.longitude ?? ""),
    mapsLink: mapsLinkFor(raw.latitude ?? "", raw.longitude ?? "", fullAddress),
    logo: raw.logo ?? "",
    facebook: raw.facebook ?? "",
    instagram: raw.instagram ?? "",
    linkedin: raw.linkedin ?? "",
    youtube: raw.youtube ?? "",
    fullDescription: raw.fullDescription ?? "",
    history: raw.history ?? "",
    businessType: raw.businessType ?? "",
    industry: raw.industry ?? "",
    businessScope: raw.businessScope ?? "",
    background: raw.background ?? "",
    vision: raw.vision ?? "",
    mission: raw.mission ?? "",
    profilePdf: raw.profilePdf ?? "",
    metaTitle: raw.metaTitle ?? "",
    metaDescription: raw.metaDescription ?? "",
    keywords: raw.keywords ?? "",
    ogImage: raw.ogImage ?? "",
    coreValues: (raw.coreValues ?? []).map((c) => ({
      id: String(c.id),
      name: c.name,
      description: c.description ?? "",
      icon: c.icon,
    })),
  };
}

export type PublicTeamMember = {
  id: string;
  name: string;
  position: string;
  bio: string;
  photo: string;
  department: string;
  fullBio: string;
  responsibilities: string[];
  experience: string[];
  linkedin: string;
};

type RawEmployee = {
  id: number;
  name: string;
  position: string;
  shortBio: string | null;
  fullBio?: string | null;
  department?: string | null;
  responsibilities?: string[] | null;
  experience?: string[] | null;
  linkedin?: string | null;
  photo: string | null;
  status: "Active" | "Inactive";
  order: number;
};

export type PublicSeo = {
  siteName: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
};

/** Site-wide SEO defaults from Admin > Company Profile > SEO (null when the API is down). */
export async function getPublicSeo(): Promise<PublicSeo | null> {
  try {
    const c = await getPublicCompany();
    return {
      siteName: c.name,
      title: c.metaTitle,
      description: c.metaDescription,
      keywords: c.keywords,
      ogImage: c.ogImage,
    };
  } catch {
    return null;
  }
}

export async function getPublicTeam(): Promise<PublicTeamMember[]> {
  const raw = await api.get<RawEmployee[]>("/employees");
  return raw
    .filter((e) => e.status === "Active")
    .sort((a, b) => a.order - b.order)
    .map((e) => ({
      id: String(e.id),
      name: e.name,
      position: e.position,
      bio: e.shortBio ?? "",
      photo: e.photo ?? "",
      department: e.department ?? "",
      fullBio: e.fullBio ?? "",
      responsibilities: e.responsibilities ?? [],
      experience: e.experience ?? [],
      linkedin: e.linkedin ?? "",
    }));
}
type RawGalleryItem = {
  id: number;
  title: string;
  caption: string | null;
  image: string;
  album: string;
  isVideo: boolean;
  videoDuration: string | null;
};

function normalizeGallery(raw: RawGalleryItem): GalleryItem {
  return {
    id: String(raw.id),
    src: raw.image,
    alt: raw.caption || raw.title,
    album: raw.album,
    span: "md",
    isVideo: raw.isVideo,
    duration: raw.videoDuration ?? undefined,
  };
}

// --- gallery -------------------------------------------------------------
export async function getPublicGallery(): Promise<GalleryItem[]> {
  const raw = await api.get<RawGalleryItem[]>("/gallery");
  return raw.map(normalizeGallery);
}

// --- homepage banners / website settings / milestones / categories ---------
export type PublicBanner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaUrl: string;
};

type RawBanner = {
  id: number;
  title: string;
  subtitle: string | null;
  image: string;
  ctaText: string;
  ctaUrl: string;
};

/** Active banners inside their date window, in the order set in the admin. */
export async function getPublicBanners(): Promise<PublicBanner[]> {
  try {
    const raw = await api.get<RawBanner[]>("/banners");
    return raw.map((b) => ({
      id: String(b.id),
      title: b.title,
      subtitle: b.subtitle ?? "",
      image: b.image,
      ctaText: b.ctaText,
      ctaUrl: b.ctaUrl,
    }));
  } catch {
    return [];
  }
}

export type PublicSettings = {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroCtaUrl: string;
  showStats: boolean;
  showWhyChooseUs: boolean;
  showFeaturedProducts: boolean;
  showLatestNews: boolean;
  showFinalCta: boolean;
  footerDescription: string;
  copyrightText: string;
  footerLinks: { id: string; label: string; url: string }[];
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
  copyrightText: string | null;
  footerLinks?: { id: number; label: string; url: string; order: number }[];
};

/** Homepage hero text, section on/off switches and footer content. `null` when the API is unreachable. */
export async function getPublicSettings(): Promise<PublicSettings | null> {
  try {
    const raw = await api.get<RawSettings>("/settings");
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
      copyrightText: raw.copyrightText ?? "",
      footerLinks: [...(raw.footerLinks ?? [])]
        .sort((a, b) => a.order - b.order)
        .map((l) => ({ id: String(l.id), label: l.label, url: l.url })),
    };
  } catch {
    return null;
  }
}

export type PublicMilestone = {
  id: string;
  year: string;
  title: string;
  description: string;
  image: string;
};

type RawMilestone = {
  id: number;
  year: string;
  title: string;
  description: string | null;
  image: string | null;
};

export async function getPublicMilestones(): Promise<PublicMilestone[]> {
  try {
    const raw = await api.get<RawMilestone[]>("/milestones");
    return raw.map((m) => ({
      id: String(m.id),
      year: m.year,
      title: m.title,
      description: m.description ?? "",
      image: m.image ?? "",
    }));
  } catch {
    return [];
  }
}

export type PublicCategory = { id: string; name: string; slug: string };

type RawCategory = { id: number; name: string; slug: string };

export async function getPublicCategories(): Promise<PublicCategory[]> {
  try {
    const raw = await api.get<RawCategory[]>("/categories");
    return raw.map((c) => ({ id: String(c.id), name: c.name, slug: c.slug }));
  } catch {
    return [];
  }
}
