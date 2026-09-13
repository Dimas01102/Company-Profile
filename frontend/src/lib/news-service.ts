// ----------------------------------------------------------------------------
// MOCK NEWS SERVICE — news article management for the admin console.
// In-memory only. Each function maps 1:1 to a future Laravel API endpoint.
// ----------------------------------------------------------------------------

import { news as publicNews, newsCategories as publicNewsCategories } from "@/lib/mock-data";
import { slugify, lines, formatDate } from "@/lib/catalog-service";
import { logActivity } from "@/lib/activity-log-service";

export type NewsStatus = "Draft" | "Published";

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
  gallery: string[];
  tags: string;
  featured: boolean;
  status: NewsStatus;
  scheduledAt: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt: string;
  updatedAt: string;
};

export const newsCategories = publicNewsCategories.filter((c) => c !== "All") as string[];
export const newsStatuses: NewsStatus[] = ["Draft", "Published"];

function iso(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86400000).toISOString();
}

let newsStore: AdminNewsArticle[] = publicNews.map((n, i) => ({
  id: n.id,
  title: n.title,
  slug: n.slug,
  category: n.category,
  author: n.author,
  date: n.date,
  readTime: n.readTime,
  summary: n.excerpt,
  content: (n.content ?? [n.excerpt]).join("\n\n"),
  thumbnail: `${n.slug}-cover.jpg`,
  gallery: [],
  tags: (n.tags ?? []).join(", "),
  featured: !!n.featured,
  status: i === publicNews.length - 1 ? "Draft" : ("Published" as NewsStatus),
  scheduledAt: "",
  metaTitle: n.title,
  metaDescription: n.excerpt,
  metaKeywords: (n.tags ?? []).join(", "),
  createdAt: iso(60 - i * 3),
  updatedAt: iso(i),
}));

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

// --- news service (GET/POST/PUT/DELETE /api/admin/news) --------------------
export async function getNewsList(): Promise<AdminNewsArticle[]> {
  await delay(450);
  return clone(newsStore).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getNewsArticle(id: string): Promise<AdminNewsArticle | undefined> {
  await delay(300);
  return clone(newsStore.find((n) => n.id === id));
}

export async function createNewsArticle(
  input: Omit<AdminNewsArticle, "id" | "createdAt" | "updatedAt">,
): Promise<AdminNewsArticle> {
  await delay(650);
  const now = new Date().toISOString();
  const created: AdminNewsArticle = {
    ...clone(input),
    id: `n-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  newsStore = [created, ...newsStore];
  logActivity({
    action: "Create",
    module: "News",
    description: "Created a news article",
    affectedData: created.title,
  });
  return created;
}

export async function updateNewsArticle(
  id: string,
  input: Omit<AdminNewsArticle, "id" | "createdAt" | "updatedAt">,
): Promise<AdminNewsArticle> {
  await delay(650);
  const existing = newsStore.find((n) => n.id === id);
  const updated: AdminNewsArticle = {
    ...clone(input),
    id,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  newsStore = newsStore.map((n) => (n.id === id ? updated : n));
  logActivity({
    action: "Update",
    module: "News",
    description: "Updated a news article",
    affectedData: updated.title,
  });
  return updated;
}

export async function deleteNewsArticle(id: string): Promise<void> {
  await delay(500);
  const target = newsStore.find((n) => n.id === id);
  newsStore = newsStore.filter((n) => n.id !== id);
  logActivity({
    action: "Delete",
    module: "News",
    description: "Deleted a news article",
    affectedData: target?.title ?? id,
  });
}

export async function setNewsStatus(id: string, status: NewsStatus): Promise<AdminNewsArticle> {
  await delay(400);
  const existing = newsStore.find((n) => n.id === id);
  if (!existing) throw new Error("Article not found");
  const updated = { ...existing, status, updatedAt: new Date().toISOString() };
  newsStore = newsStore.map((n) => (n.id === id ? updated : n));
  logActivity({
    action: status === "Published" ? "Publish" : "Unpublish",
    module: "News",
    description: status === "Published" ? "Published a news article" : "Unpublished a news article",
    affectedData: updated.title,
  });
  return clone(updated);
}

export function relatedNews(article: AdminNewsArticle, all: AdminNewsArticle[]) {
  return all
    .filter(
      (n) => n.id !== article.id && n.category === article.category && n.status === "Published",
    )
    .slice(0, 3);
}

export function emptyNewsArticle(): Omit<AdminNewsArticle, "id" | "createdAt" | "updatedAt"> {
  return {
    title: "",
    slug: "",
    category: newsCategories[0] ?? "Company",
    author: "",
    date: new Date().toISOString().slice(0, 10),
    readTime: "3 min read",
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
