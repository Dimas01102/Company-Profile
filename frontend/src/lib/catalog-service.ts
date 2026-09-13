// ----------------------------------------------------------------------------
// MOCK CATALOG SERVICE — categories + products for the admin console.
// In-memory only. Each function maps 1:1 to a future Laravel API endpoint.
// ----------------------------------------------------------------------------

import { products as publicProducts, productBrands } from "@/lib/mock-data";
import { logActivity } from "@/lib/activity-log-service";

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
  "Batamindo Main Warehouse",
  "Batu Ampar Depot",
  "Jakarta Distribution Hub",
  "Supplier Direct Shipment",
] as const;

export const brands = [...productBrands] as string[];
export const productStatuses: ProductStatus[] = ["Draft", "Published", "Archived"];

// --- availability business rule -------------------------------------------
export function computeAvailability(stock: number, minStock: number): Availability {
  if (stock <= 0) return "Out of Stock";
  if (stock <= minStock) return "Limited Stock";
  return "Available";
}

export const availabilities: Availability[] = ["Available", "Limited Stock", "Out of Stock"];

// --- seed data -------------------------------------------------------------
let categoryStore: Category[] = [
  {
    id: "c-001",
    name: "Transformers",
    slug: "transformers",
    description: "Oil-immersed and cast-resin distribution and power transformers up to 36 kV.",
    icon: "Zap",
    image: "transformers-category.jpg",
    order: 1,
    status: "Active",
  },
  {
    id: "c-002",
    name: "Switchgear",
    slug: "switchgear",
    description: "Low-voltage and medium-voltage switchgear, RMU, and protection panels.",
    icon: "PlugZap",
    image: "switchgear-category.jpg",
    order: 2,
    status: "Active",
  },
  {
    id: "c-003",
    name: "Generators",
    slug: "generators",
    description: "Prime and standby diesel generator sets with AMF/ATS control systems.",
    icon: "Gauge",
    image: "generators-category.jpg",
    order: 3,
    status: "Active",
  },
  {
    id: "c-004",
    name: "Power Distribution",
    slug: "power-distribution",
    description: "Busbar trunking, distribution boards, capacitor banks, and control panels.",
    icon: "Factory",
    image: "distribution-category.jpg",
    order: 4,
    status: "Active",
  },
  {
    id: "c-005",
    name: "Automation & Control",
    slug: "automation-control",
    description: "PLC panels, SCADA integration, and industrial instrumentation.",
    icon: "Cpu",
    image: "automation-category.jpg",
    order: 5,
    status: "Inactive",
  },
];

const seedSpecs: Record<string, Spec[]> = {
  Transformers: [
    { label: "Rated Voltage", value: "20 kV / 400 V" },
    { label: "Frequency", value: "50 Hz" },
    { label: "Phase", value: "3 Phase" },
    { label: "Cooling", value: "ONAN" },
    { label: "Protection Rating", value: "IP54" },
    { label: "Country of Origin", value: "Indonesia" },
    { label: "Warranty", value: "24 months" },
  ],
  Switchgear: [
    { label: "Rated Current", value: "up to 6300 A" },
    { label: "Rated Voltage", value: "690 V" },
    { label: "Short-Circuit Withstand", value: "100 kA / 1 s" },
    { label: "Form of Separation", value: "Form 4b" },
    { label: "Protection Rating", value: "IP42" },
    { label: "Warranty", value: "12 months" },
  ],
  Generators: [
    { label: "Prime Power", value: "500 kVA" },
    { label: "Voltage", value: "400 V / 230 V" },
    { label: "Frequency", value: "50 Hz" },
    { label: "Engine", value: "Perkins 2506A-E15TAG2" },
    { label: "Operating Temperature", value: "-10 °C to 50 °C" },
    { label: "Warranty", value: "12 months / 1000 hours" },
  ],
  "Power Distribution": [
    { label: "Rated Current", value: "2500 A" },
    { label: "Conductor Material", value: "Electrolytic Copper" },
    { label: "Protection Rating", value: "IP55" },
    { label: "Standards", value: "IEC 61439-6" },
    { label: "Warranty", value: "12 months" },
  ],
};

const models: Record<string, string> = {
  Transformers: "KTX-Series",
  Switchgear: "MNS-Series",
  Generators: "PGS-Series",
  "Power Distribution": "KBT-Series",
};

function iso(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86400000).toISOString();
}

let productStore: AdminProduct[] = publicProducts.map((p, i) => {
  const stock = [12, 6, 24, 0, 3, 18, 9, 0, 5, 14, 7, 2][i % 12] ?? 8;
  const minStock = [5, 8, 10, 5, 5, 6, 4, 3, 6, 5, 5, 4][i % 12] ?? 5;
  return {
    id: p.id,
    name: p.name,
    sku: `BKJ-${String(i + 1).padStart(4, "0")}`,
    productCode: `PRD-${p.category.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
    slug: p.slug,
    category: p.category,
    brand: p.brand,
    model: models[p.category] ?? "Standard",
    shortDescription: p.shortDescription,
    stock,
    minStock,
    warehouse: warehouses[i % warehouses.length]!,
    status: (i === 4 ? "Draft" : i === 9 ? "Archived" : "Published") as ProductStatus,
    specs: seedSpecs[p.category] ?? [{ label: "Country of Origin", value: "Indonesia" }],
    description:
      "Engineered and manufactured to international quality standards for demanding industrial and utility environments where reliability, safety, and long service life are non-negotiable.\n\nEach unit is fully tested at our Batam facility and delivered with complete factory test reports.",
    features:
      "Type-tested design compliant with international standards\nRobust construction for tropical and industrial environments\nLow maintenance with long operational service life\nFactory acceptance testing on every unit",
    applications:
      "Utility distribution networks\nIndustrial plants and manufacturing facilities\nCommercial buildings and data centers\nOil, gas, and offshore installations",
    advantages:
      "Local engineering support in Batam\nShort lead time for standard configurations\nSpare parts availability for 10 years",
    industries:
      "Power Utility\nOil & Gas\nShipyard & Marine\nElectronics Manufacturing\nData Center",
    standards: "IEC 60076\nSPLN D3.002\nSNI IEC 61439",
    mainImage: p.image,
    gallery: p.gallery ?? [],
    brochure: `brochure-${p.slug}.pdf`,
    datasheet: `datasheet-${p.slug}.pdf`,
    metaTitle: `${p.name} — PT Batam Konektra Jaya`,
    metaDescription: p.shortDescription,
    keywords: `${p.category.toLowerCase()}, ${p.brand.toLowerCase()}, industrial electrical, batam`,
    ogImage: p.image,
    relatedIds: publicProducts
      .filter((o) => o.id !== p.id && o.category === p.category)
      .slice(0, 3)
      .map((o) => o.id),
    createdAt: iso(200 - i * 7),
    updatedAt: iso(i * 3),
  } satisfies AdminProduct;
});

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// --- category service (GET/POST/PUT/DELETE /api/admin/categories) ----------
export async function getCategories(): Promise<Category[]> {
  await delay(450);
  return clone(categoryStore).sort((a, b) => a.order - b.order);
}

export async function createCategory(input: Omit<Category, "id">): Promise<Category> {
  await delay(600);
  const created: Category = { ...clone(input), id: `c-${Date.now()}` };
  categoryStore = [...categoryStore, created];
  logActivity({
    action: "Create",
    module: "Categories",
    description: "Created a product category",
    affectedData: created.name,
  });
  return created;
}

export async function updateCategory(id: string, input: Omit<Category, "id">): Promise<Category> {
  await delay(600);
  const updated: Category = { ...clone(input), id };
  categoryStore = categoryStore.map((c) => (c.id === id ? updated : c));
  logActivity({
    action: "Update",
    module: "Categories",
    description: "Updated a product category",
    affectedData: updated.name,
  });
  return updated;
}

export async function deleteCategory(id: string): Promise<void> {
  await delay(500);
  const target = categoryStore.find((c) => c.id === id);
  categoryStore = categoryStore.filter((c) => c.id !== id);
  logActivity({
    action: "Delete",
    module: "Categories",
    description: "Deleted a product category",
    affectedData: target?.name ?? id,
  });
}

export async function reorderCategory(id: string, direction: "up" | "down"): Promise<Category[]> {
  await delay(280);
  const sorted = [...categoryStore].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((c) => c.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= sorted.length) return clone(sorted);
  const a = sorted[index]!;
  const b = sorted[target]!;
  const swap = a.order;
  a.order = b.order;
  b.order = swap;
  categoryStore = sorted;
  return clone(sorted).sort((x, y) => x.order - y.order);
}

export function categoryProductCount(name: string) {
  return productStore.filter((p) => p.category === name).length;
}

export function emptyCategory(order: number): Omit<Category, "id"> {
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
  await delay(500);
  return clone(productStore);
}

export async function getProduct(id: string): Promise<AdminProduct | undefined> {
  await delay(300);
  return clone(productStore.find((p) => p.id === id));
}

export async function createProduct(input: Omit<AdminProduct, "id">): Promise<AdminProduct> {
  await delay(700);
  const now = new Date().toISOString();
  const created: AdminProduct = {
    ...clone(input),
    id: `p-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  productStore = [created, ...productStore];
  logActivity({
    action: "Create",
    module: "Products",
    description: "Created a product",
    affectedData: `${created.sku} — ${created.name}`,
  });
  return created;
}

export async function updateProduct(
  id: string,
  input: Omit<AdminProduct, "id">,
): Promise<AdminProduct> {
  await delay(700);
  const updated: AdminProduct = { ...clone(input), id, updatedAt: new Date().toISOString() };
  productStore = productStore.map((p) => (p.id === id ? updated : p));
  logActivity({
    action: "Update",
    module: "Products",
    description: "Updated a product",
    affectedData: `${updated.sku} — ${updated.name}`,
  });
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  await delay(550);
  const target = productStore.find((p) => p.id === id);
  productStore = productStore.filter((p) => p.id !== id);
  productStore = productStore.map((p) => ({
    ...p,
    relatedIds: p.relatedIds.filter((r) => r !== id),
  }));
  logActivity({
    action: "Delete",
    module: "Products",
    description: "Deleted a product",
    affectedData: target ? `${target.sku} — ${target.name}` : id,
  });
}

export async function getRelatedProducts(id: string): Promise<AdminProduct[]> {
  await delay(300);
  const product = productStore.find((p) => p.id === id);
  if (!product) return [];
  const manual = productStore.filter((p) => product.relatedIds.includes(p.id));
  if (manual.length) return clone(manual);
  return clone(
    productStore
      .filter((p) => p.id !== id && (p.category === product.category || p.brand === product.brand))
      .slice(0, 3),
  );
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

export function emptyProduct(defaultCategory: string): Omit<AdminProduct, "id"> {
  const now = new Date().toISOString();
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
    brochure: "",
    datasheet: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    ogImage: "",
    relatedIds: [],
    createdAt: now,
    updatedAt: now,
  };
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
