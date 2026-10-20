import { api } from "@/lib/api-client";
import { slugify, lines, formatDate } from "@/lib/catalog-service";

export type NewsStatus = "Draft" | "Published";

export type NewsGalleryImage = { id: string; url: string };

export type AdminNewsArticle = {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  summary: string;
  content: string;
  thumbnail: string;
  gallery: NewsGalleryImage[];
  tags: string;
  featured: boolean;
  status: NewsStatus;
  scheduledAt: string;
  /** True when the public site can show it now (Published and not waiting for its schedule). */
  isLive: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt: string;
  updatedAt: string;
};

export const newsCategories = ["Project", "Company", "Technology", "Industry", "Events"];
export const newsStatuses: NewsStatus[] = ["Draft", "Published"];

type RawNews = {
  id: number;
  title: string;
  slug: string;
  category: string;
  author: string;
  date: string | null;
  readTime: string | null;
  summary: string;
  content: string;
  thumbnail: string | null;
  gallery: { id: number; url: string }[] | null;
  tags: string;
  featured: boolean;
  status: NewsStatus;
  scheduledAt: string | null;
  isLive?: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

function normalize(raw: RawNews): AdminNewsArticle {
  return {
    id: String(raw.id),
    title: raw.title,
    slug: raw.slug,
    category: raw.category,
    author: raw.author,
    date: raw.date ?? "",
    readTime: raw.readTime ?? "",
    summary: raw.summary,
    content: raw.content,
    thumbnail: raw.thumbnail ?? "",
    gallery: (raw.gallery ?? []).map((g) => ({ id: String(g.id), url: g.url })),
    tags: raw.tags ?? "",
    featured: !!raw.featured,
    status: raw.status,
    scheduledAt: raw.scheduledAt ?? "",
    isLive: raw.isLive ?? raw.status === "Published",
    metaTitle: raw.metaTitle ?? "",
    metaDescription: raw.metaDescription ?? "",
    metaKeywords: raw.metaKeywords ?? "",
    createdAt: raw.createdAt ?? "",
    updatedAt: raw.updatedAt ?? "",
  };
}

function toPayload(input: Partial<AdminNewsArticle>) {
  const {
    thumbnail: _thumbnail,
    gallery: _gallery,
    isLive: _isLive,
    readTime: _readTime,
    ...rest
  } = input;
  return {
    ...rest,
    publishedDate: rest.date,
  };
}

export type NewsFiles = {
  thumbnailFile?: File;
  galleryFiles?: File[];
  removeGalleryIds?: string[];
};

function withFiles(
  payload: ReturnType<typeof toPayload>,
  files?: NewsFiles,
): { body: Record<string, unknown>; multipart: boolean } {
  if (!files) return { body: payload, multipart: false };
  const { thumbnailFile, galleryFiles, removeGalleryIds } = files;
  const hasFiles = !!(thumbnailFile || galleryFiles?.length || removeGalleryIds?.length);
  if (!hasFiles) return { body: payload, multipart: false };
  return {
    body: {
      ...payload,
      ...(thumbnailFile ? { thumbnail: thumbnailFile } : {}),
      ...(galleryFiles?.length ? { gallery: galleryFiles } : {}),
      ...(removeGalleryIds?.length ? { removeGalleryIds: removeGalleryIds.map(Number) } : {}),
    },
    multipart: true,
  };
}

export async function getNewsList(): Promise<AdminNewsArticle[]> {
  const raw = await api.get<RawNews[]>("/admin/news", { perPage: 1000 });
  return raw.map(normalize).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getNewsArticle(id: string): Promise<AdminNewsArticle | undefined> {
  const raw = await api.get<RawNews>(`/admin/news/${id}`);
  return normalize(raw);
}

export async function createNewsArticle(
  input: Omit<AdminNewsArticle, "id" | "createdAt" | "updatedAt" | "isLive">,
  files?: NewsFiles,
): Promise<AdminNewsArticle> {
  const { body, multipart } = withFiles(toPayload(input), files);
  const raw = await api.post<RawNews>("/admin/news", body, multipart);
  return normalize(raw);
}

export async function updateNewsArticle(
  id: string,
  input: Omit<AdminNewsArticle, "id" | "createdAt" | "updatedAt" | "isLive">,
  files?: NewsFiles,
): Promise<AdminNewsArticle> {
  // An emptied thumbnail with no replacement file means "remove the picture".
  const removeThumbnail = !input.thumbnail && !files?.thumbnailFile;
  const { body, multipart } = withFiles(
    { ...toPayload(input), ...(removeThumbnail ? { removeThumbnail: true } : {}) },
    files,
  );
  const raw = await api.put<RawNews>(`/admin/news/${id}`, body, multipart);
  return normalize(raw);
}

export async function deleteNewsArticle(id: string): Promise<void> {
  await api.delete(`/admin/news/${id}`);
}

export async function setNewsStatus(id: string, status: NewsStatus): Promise<AdminNewsArticle> {
  const raw = await api.patch<RawNews>(`/admin/news/${id}/status`, {
    status,
  });
  return normalize(raw);
}

export function relatedNews(article: AdminNewsArticle, all: AdminNewsArticle[]) {
  return all
    .filter(
      (n) => n.id !== article.id && n.category === article.category && n.status === "Published",
    )
    .slice(0, 3);
}

/** Same rule as the backend: about 200 words per minute, at least 1 minute. */
export function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export function emptyNewsArticle(): Omit<
  AdminNewsArticle,
  "id" | "createdAt" | "updatedAt" | "isLive"
> {
  return {
    title: "",
    slug: "",
    category: newsCategories[0] ?? "Company",
    author: "",
    date: new Date().toISOString().slice(0, 10),
    readTime: "1 min read",
    summary: "",
    content: "",
    thumbnail: "",
    gallery: [],
    tags: "",
    featured: false,
    status: "Draft",
    scheduledAt: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  };
}

export { slugify, lines, formatDate };
