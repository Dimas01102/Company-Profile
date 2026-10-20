import { api } from "@/lib/api-client";

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
  isVideo: boolean;
  videoDuration: string;
};

export const galleryAlbums = ["Substations", "Manufacturing", "Projects", "Videos"];

type RawGalleryItem = {
  id: number;
  title: string;
  caption: string | null;
  image: string;
  album: string;
  tags: string;
  date: string | null;
  order: number;
  status: GalleryStatus;
  isVideo: boolean | null;
  videoDuration: string | null;
};

function normalize(raw: RawGalleryItem): AdminGalleryItem {
  return {
    id: String(raw.id),
    title: raw.title,
    caption: raw.caption ?? "",
    image: raw.image,
    album: raw.album,
    tags: raw.tags ?? "",
    date: raw.date ?? "",
    order: raw.order,
    status: raw.status,
    isVideo: !!raw.isVideo,
    videoDuration: raw.videoDuration ?? "",
  };
}

function toPayload(input: Omit<AdminGalleryItem, "id"> | Partial<AdminGalleryItem>) {
  const { image: _image, ...rest } = input;
  return rest;
}

// --- gallery service (GET/POST/PUT/DELETE /api/admin/gallery) --------------
export async function getGalleryItems(): Promise<AdminGalleryItem[]> {
  const raw = await api.get<RawGalleryItem[]>("/admin/gallery");
  return raw.map(normalize).sort((a, b) => a.order - b.order);
}

export async function createGalleryItem(
  input: Omit<AdminGalleryItem, "id">,
  imageFile?: File,
): Promise<AdminGalleryItem> {
  const payload = imageFile ? { ...toPayload(input), image: imageFile } : toPayload(input);
  const raw = await api.post<RawGalleryItem>("/admin/gallery", payload, !!imageFile);
  return normalize(raw);
}

export async function updateGalleryItem(
  id: string,
  input: Omit<AdminGalleryItem, "id">,
  imageFile?: File,
): Promise<AdminGalleryItem> {
  const payload = imageFile ? { ...toPayload(input), image: imageFile } : toPayload(input);
  const raw = await api.put<RawGalleryItem>(`/admin/gallery/${id}`, payload, !!imageFile);
  return normalize(raw);
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await api.delete(`/admin/gallery/${id}`);
}

export async function reorderGalleryItem(
  id: string,
  direction: "up" | "down",
): Promise<AdminGalleryItem[]> {
  const raw = await api.patch<RawGalleryItem[]>(`/admin/gallery/${id}/reorder`, { direction });
  return raw.map(normalize).sort((a, b) => a.order - b.order);
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
    isVideo: false,
    videoDuration: "",
  };
}
