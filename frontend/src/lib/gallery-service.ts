// ----------------------------------------------------------------------------
// MOCK GALLERY SERVICE — gallery album/image management for the admin console.
// In-memory only. Each function maps 1:1 to a future Laravel API endpoint.
// ----------------------------------------------------------------------------

import { galleryImages, galleryAlbums as publicAlbums } from "@/lib/mock-data";
import { logActivity } from "@/lib/activity-log-service";

export type GalleryStatus = "Active" | "Inactive";

export type AdminGalleryItem = {
  id: string;
  title: string;
  caption: string;
  image: string;
  album: string;
  tags: string;
  date: string;
  order: number;
  status: GalleryStatus;
};

export const galleryAlbums = publicAlbums.filter((a) => a !== "All") as string[];

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function iso(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10);
}

let galleryStore: AdminGalleryItem[] = galleryImages.map((g, i) => ({
  id: g.id,
  title: g.alt,
  caption: g.alt,
  image: `${g.id}.jpg`,
  album: g.album,
  tags: g.isVideo ? "video" : "",
  date: iso(i * 4),
  order: i + 1,
  status: "Active" as GalleryStatus,
}));

// --- gallery service (GET/POST/PUT/DELETE /api/admin/gallery) --------------
export async function getGalleryItems(): Promise<AdminGalleryItem[]> {
  await delay(450);
  return clone(galleryStore).sort((a, b) => a.order - b.order);
}

export async function createGalleryItem(
  input: Omit<AdminGalleryItem, "id">,
): Promise<AdminGalleryItem> {
  await delay(600);
  const created: AdminGalleryItem = { ...clone(input), id: `g-${Date.now()}` };
  galleryStore = [...galleryStore, created];
  logActivity({
    action: "Create",
    module: "Gallery",
    description: "Added a gallery image",
    affectedData: created.title,
  });
  return created;
}

export async function updateGalleryItem(
  id: string,
  input: Omit<AdminGalleryItem, "id">,
): Promise<AdminGalleryItem> {
  await delay(600);
  const updated: AdminGalleryItem = { ...clone(input), id };
  galleryStore = galleryStore.map((g) => (g.id === id ? updated : g));
  logActivity({
    action: "Update",
    module: "Gallery",
    description: "Updated a gallery image",
    affectedData: updated.title,
  });
  return updated;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await delay(500);
  const target = galleryStore.find((g) => g.id === id);
  galleryStore = galleryStore.filter((g) => g.id !== id);
  logActivity({
    action: "Delete",
    module: "Gallery",
    description: "Deleted a gallery image",
    affectedData: target?.title ?? id,
  });
}

export async function reorderGalleryItem(
  id: string,
  direction: "up" | "down",
): Promise<AdminGalleryItem[]> {
  await delay(280);
  const sorted = [...galleryStore].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((g) => g.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= sorted.length) return clone(sorted);
  const a = sorted[index]!;
  const b = sorted[target]!;
  const swap = a.order;
  a.order = b.order;
  b.order = swap;
  galleryStore = sorted;
  return clone(sorted).sort((x, y) => x.order - y.order);
}

export function emptyGalleryItem(order: number): Omit<AdminGalleryItem, "id"> {
  return {
    title: "",
    caption: "",
    image: "",
    album: galleryAlbums[0] ?? "Projects",
    tags: "",
    date: new Date().toISOString().slice(0, 10),
    order,
    status: "Active",
  };
}
