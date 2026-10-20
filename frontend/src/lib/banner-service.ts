import { api } from "@/lib/api-client";

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

type RawBanner = {
  id: number;
  title: string;
  subtitle: string | null;
  image: string;
  ctaText: string;
  ctaUrl: string;
  order: number;
  startDate: string | null;
  endDate: string | null;
  status: BannerStatus;
};

function normalize(raw: RawBanner): Banner {
  return {
    id: String(raw.id),
    title: raw.title,
    subtitle: raw.subtitle ?? "",
    image: raw.image,
    ctaText: raw.ctaText,
    ctaUrl: raw.ctaUrl,
    order: raw.order,
    startDate: raw.startDate ?? "",
    endDate: raw.endDate ?? "",
    status: raw.status,
  };
}

function toPayload(input: Omit<Banner, "id"> | Partial<Banner>) {
  const { image: _image, ...rest } = input;
  return rest;
}

export async function getBanners(): Promise<Banner[]> {
  const raw = await api.get<RawBanner[]>("/admin/banners");
  return raw.map(normalize).sort((a, b) => a.order - b.order);
}

export async function createBanner(input: Omit<Banner, "id">, imageFile?: File): Promise<Banner> {
  const payload = imageFile ? { ...toPayload(input), image: imageFile } : toPayload(input);
  const raw = await api.post<RawBanner>("/admin/banners", payload, !!imageFile);
  return normalize(raw);
}

export async function updateBanner(
  id: string,
  input: Omit<Banner, "id">,
  imageFile?: File,
): Promise<Banner> {
  const payload = imageFile ? { ...toPayload(input), image: imageFile } : toPayload(input);
  const raw = await api.put<RawBanner>(`/admin/banners/${id}`, payload, !!imageFile);
  return normalize(raw);
}

export async function deleteBanner(id: string): Promise<void> {
  await api.delete(`/admin/banners/${id}`);
}

export async function reorderBanner(id: string, direction: "up" | "down"): Promise<Banner[]> {
  const raw = await api.patch<RawBanner[]>(`/admin/banners/${id}/reorder`, {
    direction,
  });
  return raw.map(normalize).sort((a, b) => a.order - b.order);
}

export function emptyBanner(order: number): Omit<Banner, "id"> {
  return {
    title: "",
    subtitle: "",
    image: "",
    ctaText: "",
    ctaUrl: "",
    order,
    startDate: "",
    endDate: "",
    status: "Active",
  };
}
