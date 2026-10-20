import { api } from "@/lib/api-client";

export type Status = "Active" | "Inactive";
export type ProductStatus = "Draft" | "Published" | "Archived";
export type Availability = "Available" | "Limited Stock" | "Out of Stock";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image: string;
  order: number;
  status: Status;
  productCount: number;
};

export type Spec = { label: string; value: string };

export type AdminProduct = {
  id: string;
  name: string;
  sku: string;
  productCode: string;
  slug: string;
  category: string;
  brand: string;
  model: string;
  shortDescription: string;
  stock: number;
  minStock: number;
  warehouse: string;
  status: ProductStatus;
  specs: Spec[];
  description: string;
  features: string;
  applications: string;
  advantages: string;
  industries: string;
  standards: string;
  mainImage: string;
  gallery: string[];
  /** Database ids of the saved gallery images, in the same order as `gallery`. */
  galleryIds: string[];
  brochure: string;
  datasheet: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  relatedIds: string[];
  createdAt: string;
  updatedAt: string;
};

export const categoryIcons = ["Zap", "Package", "Cpu", "Factory", "Gauge", "PlugZap"] as const;

export const warehouses = [
  "Batam Main Plant",
  "Batam Warehouse B",
  "Jakarta Distribution Center",
  "Supplier Direct Shipment",
] as const;

// Matches the brands used across ProductSeeder, no dedicated endpoint for
// this yet, so it stays a static list rather than a derived query.
export const brands = ["Konektra", "Siemens", "ABB", "Schneider Electric", "Perkins", "Cummins"];
export const productStatuses: ProductStatus[] = ["Draft", "Published", "Archived"];
export const availabilities: Availability[] = ["Available", "Limited Stock", "Out of Stock"];

// --- availability business rule (mirrors Product::getAvailabilityAttribute on
// the backend, used for optimistic UI before a save round-trip returns) ----
export function computeAvailability(stock: number, minStock: number): Availability {
  if (stock <= 0) return "Out of Stock";
  if (stock <= minStock) return "Limited Stock";
  return "Available";
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function lines(value: string) {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// --- API <-> frontend type mapping -----------------------------------------
type RawCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  image: string | null;
  order: number;
  status: Status;
  productCount?: number;
};

type RawSpec = { id: number; label: string; value: string };
type RawGalleryImage = { id: number; url: string };

type RawProduct = {
  id: number;
  name: string;
  sku: string;
  productCode: string | null;
  slug: string;
  categoryId: number;
  category: string;
  brand: string | null;
  model: string | null;
  shortDescription: string | null;
  stock: number;
  minStock: number;
  warehouse: string | null;
  status: ProductStatus;
  availability: Availability;
  specs?: RawSpec[];
  description: string | null;
  features: string | null;
  applications: string | null;
  advantages: string | null;
  industries: string | null;
  standards: string | null;
  mainImage: string | null;
  gallery?: RawGalleryImage[];
  brochure: string | null;
  datasheet: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  ogImage: string | null;
  relatedIds?: number[];
  createdAt: string;
  updatedAt: string;
};

function normalizeCategory(raw: RawCategory): Category {
  return {
    id: String(raw.id),
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? "",
    icon: raw.icon,
    image: raw.image ?? "",
    order: raw.order,
    status: raw.status,
    productCount: raw.productCount ?? 0,
  };
}

function normalizeProduct(raw: RawProduct): AdminProduct {
  return {
    id: String(raw.id),
    name: raw.name,
    sku: raw.sku,
    productCode: raw.productCode ?? "",
    slug: raw.slug,
    category: raw.category,
    brand: raw.brand ?? "",
    model: raw.model ?? "",
    shortDescription: raw.shortDescription ?? "",
    stock: raw.stock,
    minStock: raw.minStock,
    warehouse: raw.warehouse ?? "",
    status: raw.status,
    specs: (raw.specs ?? []).map((s) => ({ label: s.label, value: s.value })),
    description: raw.description ?? "",
    features: raw.features ?? "",
    applications: raw.applications ?? "",
    advantages: raw.advantages ?? "",
    industries: raw.industries ?? "",
    standards: raw.standards ?? "",
    mainImage: raw.mainImage ?? "",
    gallery: (raw.gallery ?? []).map((g) => g.url),
    galleryIds: (raw.gallery ?? []).map((g) => String(g.id)),
    brochure: raw.brochure ?? "",
    datasheet: raw.datasheet ?? "",
    metaTitle: raw.metaTitle ?? "",
    metaDescription: raw.metaDescription ?? "",
    keywords: raw.keywords ?? "",
    ogImage: raw.ogImage ?? "",
    relatedIds: (raw.relatedIds ?? []).map(String),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

// Populated by getCategories(); createProduct/updateProduct resolve a
// category *name* (what the product form uses) back to the categoryId the
// API needs.
let categoryCache: Category[] = [];

async function resolveCategoryId(name: string): Promise<number> {
  if (!categoryCache.length) await getCategories();
  const match = categoryCache.find((c) => c.name === name);
  if (!match) throw new Error(`Unknown category: ${name}`);
  return Number(match.id);
}

// --- category service (GET/POST/PUT/DELETE /api/admin/categories) ----------
export async function getCategories(): Promise<Category[]> {
  const raw = await api.get<RawCategory[]>("/admin/categories");
  const list = raw.map(normalizeCategory).sort((a, b) => a.order - b.order);
  categoryCache = list;
  return list;
}

export async function createCategory(
  input: Omit<Category, "id" | "productCount">,
  imageFile?: File,
): Promise<Category> {
  const { image: _image, ...rest } = input;
  const payload = imageFile ? { ...rest, image: imageFile } : rest;
  const raw = await api.post<RawCategory>("/admin/categories", payload, !!imageFile);
  const created = normalizeCategory(raw);
  categoryCache = [...categoryCache, created];
  return created;
}

export async function updateCategory(
  id: string,
  input: Omit<Category, "id" | "productCount">,
  imageFile?: File,
): Promise<Category> {
  const { image: _image, ...rest } = input;
  // An emptied image with no replacement file means "remove the picture".
  const payload = imageFile
    ? { ...rest, image: imageFile }
    : { ...rest, ...(input.image ? {} : { removeImage: true }) };
  const raw = await api.put<RawCategory>(`/admin/categories/${id}`, payload, !!imageFile);
  const updated = normalizeCategory(raw);
  categoryCache = categoryCache.map((c) => (c.id === id ? updated : c));
  return updated;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/admin/categories/${id}`);
  categoryCache = categoryCache.filter((c) => c.id !== id);
}

export async function reorderCategory(id: string, direction: "up" | "down"): Promise<Category[]> {
  const raw = await api.patch<RawCategory[]>(`/admin/categories/${id}/reorder`, { direction });
  const list = raw.map(normalizeCategory).sort((a, b) => a.order - b.order);
  categoryCache = list;
  return list;
}

export function categoryProductCount(name: string): number {
  return categoryCache.find((c) => c.name === name)?.productCount ?? 0;
}

export function emptyCategory(order: number): Omit<Category, "id" | "productCount"> {
  return {
    name: "",
    slug: "",
    description: "",
    icon: "Package",
    image: "",
    order,
    status: "Active",
  };
}

// --- product service (GET/POST/PUT/DELETE /api/admin/products) -------------
export async function getProducts(): Promise<AdminProduct[]> {
  // The admin UI filters/sorts/paginates client-side over the full catalog,
  // so ask the API for everything in one call rather than one page at a time.
  const raw = await api.get<RawProduct[]>("/admin/products", { perPage: 1000 });
  return raw.map(normalizeProduct);
}

export async function getProduct(id: string): Promise<AdminProduct | undefined> {
  try {
    const raw = await api.get<RawProduct>(`/admin/products/${id}`);
    return normalizeProduct(raw);
  } catch {
    return undefined;
  }
}

function toProductPayload(
  input: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">,
  categoryId: number,
) {
  return {
    name: input.name,
    sku: input.sku,
    productCode: input.productCode,
    slug: input.slug,
    categoryId,
    brand: input.brand,
    model: input.model,
    shortDescription: input.shortDescription,
    stock: input.stock,
    minStock: input.minStock,
    warehouse: input.warehouse,
    status: input.status,
    // Blank rows are dropped; an empty list is sent as null so the API still
    // sees the key (multipart drops empty arrays) and clears the saved specs.
    specs: input.specs.some((s) => s.label.trim())
      ? input.specs.filter((s) => s.label.trim())
      : null,
    description: input.description,
    features: input.features,
    applications: input.applications,
    advantages: input.advantages,
    industries: input.industries,
    standards: input.standards,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    keywords: input.keywords,
    relatedIds: input.relatedIds.map(Number),
  };
}

export type ProductFiles = {
  mainImageFile?: File;
  ogImageFile?: File;
  brochureFile?: File;
  datasheetFile?: File;
  galleryFiles?: File[];
  removeGalleryIds?: string[];
};

function withFiles(
  payload: ReturnType<typeof toProductPayload>,
  files?: ProductFiles,
): { body: Record<string, unknown>; multipart: boolean } {
  if (!files) return { body: payload, multipart: false };
  const { mainImageFile, ogImageFile, brochureFile, datasheetFile, galleryFiles } = files;
  const removal = files.removeGalleryIds?.length
    ? { removeGalleryIds: files.removeGalleryIds.map(Number) }
    : {};
  const hasFiles = !!(
    mainImageFile ||
    ogImageFile ||
    brochureFile ||
    datasheetFile ||
    galleryFiles?.length
  );
  if (!hasFiles) return { body: { ...payload, ...removal }, multipart: false };
  return {
    body: {
      ...payload,
      ...removal,
      ...(mainImageFile ? { mainImage: mainImageFile } : {}),
      ...(ogImageFile ? { ogImage: ogImageFile } : {}),
      ...(brochureFile ? { brochure: brochureFile } : {}),
      ...(datasheetFile ? { datasheet: datasheetFile } : {}),
      ...(galleryFiles?.length ? { gallery: galleryFiles } : {}),
    },
    multipart: true,
  };
}

export async function createProduct(
  input: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">,
  files?: ProductFiles,
): Promise<AdminProduct> {
  const categoryId = await resolveCategoryId(input.category);
  const { body, multipart } = withFiles(toProductPayload(input, categoryId), files);
  const raw = await api.post<RawProduct>("/admin/products", body, multipart);
  return normalizeProduct(raw);
}

export async function updateProduct(
  id: string,
  input: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">,
  files?: ProductFiles,
): Promise<AdminProduct> {
  const categoryId = await resolveCategoryId(input.category);
  const { body, multipart } = withFiles(toProductPayload(input, categoryId), files);
  const raw = await api.put<RawProduct>(`/admin/products/${id}`, body, multipart);
  return normalizeProduct(raw);
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/admin/products/${id}`);
}

export async function getRelatedProducts(id: string): Promise<AdminProduct[]> {
  const raw = await api.get<RawProduct[]>(`/admin/products/${id}/related`);
  return raw.map(normalizeProduct);
}

export function relatedFor(product: AdminProduct, all: AdminProduct[]): AdminProduct[] {
  const manual = all.filter((p) => product.relatedIds.includes(p.id));
  if (manual.length) return manual;
  return all
    .filter(
      (p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand),
    )
    .slice(0, 3);
}

export function emptyProduct(
  defaultCategory: string,
): Omit<AdminProduct, "id" | "createdAt" | "updatedAt"> {
  return {
    name: "",
    sku: "",
    productCode: "",
    slug: "",
    category: defaultCategory,
    brand: brands[0] ?? "Konektra",
    model: "",
    shortDescription: "",
    stock: 0,
    minStock: 5,
    warehouse: warehouses[0]!,
    status: "Draft",
    specs: [
      { label: "Rated Voltage", value: "" },
      { label: "Frequency", value: "" },
    ],
    description: "",
    features: "",
    applications: "",
    advantages: "",
    industries: "",
    standards: "",
    mainImage: "",
    gallery: [],
    galleryIds: [],
    brochure: "",
    datasheet: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    ogImage: "",
    relatedIds: [],
  };
}
