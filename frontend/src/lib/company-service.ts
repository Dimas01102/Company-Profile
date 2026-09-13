// ----------------------------------------------------------------------------
// MOCK COMPANY PROFILE SERVICE
// Frontend-only in-memory store. Replace each function body with a Laravel API
// call later — keep the signatures identical.
// ----------------------------------------------------------------------------

import { company } from "@/lib/mock-data";

export type CoreValue = {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
};

export type Milestone = {
  id: string;
  year: string;
  title: string;
  description: string;
  image: string;
  order: number;
  active: boolean;
};

export type CompanyProfile = {
  // General
  name: string;
  logoName: string;
  faviconName: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  // Story
  history: string;
  foundedYear: string;
  background: string;
  // Vision & mission
  vision: string;
  mission: string;
  // Business
  businessType: string;
  industry: string;
  businessScope: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  whatsapp: string;
  email: string;
  businessHours: string;
  // Social
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  otherSocial: string;
  // Location
  mapEmbed: string;
  latitude: string;
  longitude: string;
  // SEO
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageName: string;
  // Document
  profilePdfName: string;
  profilePdfSize: string;
  profilePdfUpdatedAt: string;
  // Collections
  coreValues: CoreValue[];
};

const defaultProfile: CompanyProfile = {
  name: company.name,
  logoName: "konektra-logo-primary.svg",
  faviconName: "favicon-konektra.png",
  tagline: company.tagline,
  shortDescription: company.description,
  fullDescription:
    "PT Batam Konektra Jaya designs, manufactures, and integrates electrical power equipment for utilities, industrial plants, and infrastructure projects across Indonesia. Our Batam facility produces distribution transformers, low- and medium-voltage switchgear, busbar trunking, and control panels, all type-tested to IEC, SPLN, and SNI standards. Alongside equipment supply we deliver turnkey substation packages including engineering design, installation supervision, commissioning, and long-term maintenance.",
  history:
    "Founded in 2004 as a panel assembly workshop in Batam, the company grew into a full electrical equipment manufacturer serving PLN contractors, industrial estates, and offshore operators. Investment in a dedicated transformer line in 2013 and an in-house testing laboratory in 2018 established Konektra as a trusted local alternative to imported equipment.",
  foundedYear: String(company.founded),
  background:
    "Konektra was established to reduce Indonesia's dependency on imported power equipment by combining local manufacturing capability with international engineering standards.",
  vision:
    "To be Indonesia's most trusted partner for industrial power equipment and substation engineering.",
  mission:
    "Deliver reliable, standard-compliant electrical equipment; support every project with responsive engineering and after-sales service; develop local engineering talent; and operate safely and sustainably at every site.",
  businessType: "Limited Liability Company (Perseroan Terbatas)",
  industry: "Electrical Equipment Manufacturing & Power Engineering",
  businessScope:
    "Transformer manufacturing, switchgear assembly, generator packaging, substation EPC, testing and commissioning, preventive maintenance.",
  address: "Kawasan Industri Batamindo, Lot 312",
  city: "Batam",
  province: "Kepulauan Riau",
  postalCode: "29433",
  phone: company.phone,
  whatsapp: company.whatsapp,
  email: company.email,
  businessHours: company.hours,
  facebook: "https://facebook.com/batamkonektrajaya",
  instagram: "https://instagram.com/batamkonektrajaya",
  linkedin: "https://linkedin.com/company/batam-konektra-jaya",
  youtube: "https://youtube.com/@batamkonektrajaya",
  otherSocial: "https://x.com/konektrajaya",
  mapEmbed: company.mapEmbed,
  latitude: "1.0451",
  longitude: "104.0305",
  metaTitle: "PT Batam Konektra Jaya — Industrial Engineering & Power Solutions",
  metaDescription:
    "Transformers, switchgear, generator sets, and turnkey substation engineering for utilities and industry across Indonesia.",
  keywords:
    "transformer batam, switchgear indonesia, genset industri, substation epc, panel listrik batam",
  ogImageName: "og-konektra-facility.jpg",
  profilePdfName: "Company-Profile-Konektra-2026.pdf",
  profilePdfSize: "4.8 MB",
  profilePdfUpdatedAt: "12 Jun 2026",
  coreValues: [
    {
      id: "cv-1",
      name: "Integrity",
      description: "We keep our commitments to customers, partners, and colleagues.",
      icon: "ShieldCheck",
      order: 1,
    },
    {
      id: "cv-2",
      name: "Quality",
      description: "Every unit is type-tested and documented before it leaves our facility.",
      icon: "BadgeCheck",
      order: 2,
    },
    {
      id: "cv-3",
      name: "Innovation",
      description: "We continuously improve designs, tooling, and monitoring technology.",
      icon: "Lightbulb",
      order: 3,
    },
    {
      id: "cv-4",
      name: "Partnership",
      description: "We work as an extension of our customers' engineering teams.",
      icon: "Handshake",
      order: 4,
    },
  ],
};

const defaultMilestones: Milestone[] = [
  {
    id: "m-1",
    year: "2004",
    title: "Company founded in Batam",
    description: "Started as a control panel assembly workshop serving local industrial estates.",
    image: "milestone-2004.jpg",
    order: 1,
    active: true,
  },
  {
    id: "m-2",
    year: "2009",
    title: "First PLN vendor certification",
    description: "Approved as a registered supplier for distribution equipment.",
    image: "milestone-2009.jpg",
    order: 2,
    active: true,
  },
  {
    id: "m-3",
    year: "2013",
    title: "Transformer production line",
    description: "Opened a dedicated oil-immersed transformer line with 2,500 kVA capability.",
    image: "milestone-2013.jpg",
    order: 3,
    active: true,
  },
  {
    id: "m-4",
    year: "2018",
    title: "In-house testing laboratory",
    description: "Commissioned a high-voltage test bay for factory acceptance testing.",
    image: "milestone-2018.jpg",
    order: 4,
    active: true,
  },
  {
    id: "m-5",
    year: "2022",
    title: "Regional export expansion",
    description: "Began regular deliveries to Malaysia, Singapore, and Vietnam.",
    image: "milestone-2022.jpg",
    order: 5,
    active: true,
  },
  {
    id: "m-6",
    year: "2026",
    title: "Data center substation program",
    description: "Delivered the first 20 MVA substation for a Tier-III data center.",
    image: "milestone-2026.jpg",
    order: 6,
    active: false,
  },
];

let profileStore: CompanyProfile = structuredClone(defaultProfile);
let milestoneStore: Milestone[] = structuredClone(defaultMilestones);

const delay = (ms = 550) => new Promise((r) => setTimeout(r, ms));

/** TODO: GET /api/admin/company-profile */
export async function getCompanyProfile(): Promise<CompanyProfile> {
  await delay();
  return structuredClone(profileStore);
}

/** TODO: PUT /api/admin/company-profile */
export async function updateCompanyProfile(
  patch: Partial<CompanyProfile>,
): Promise<CompanyProfile> {
  await delay(700);
  profileStore = { ...profileStore, ...structuredClone(patch) };
  return structuredClone(profileStore);
}

export function getDefaultCompanyProfile(): CompanyProfile {
  return structuredClone(defaultProfile);
}

/** TODO: GET /api/admin/milestones */
export async function getMilestones(): Promise<Milestone[]> {
  await delay(400);
  return structuredClone(milestoneStore).sort((a, b) => a.order - b.order);
}

/** TODO: POST /api/admin/milestones */
export async function createMilestone(input: Omit<Milestone, "id">): Promise<Milestone> {
  await delay(500);
  const created: Milestone = { ...input, id: `m-${Date.now()}` };
  milestoneStore = [...milestoneStore, created];
  return structuredClone(created);
}

/** TODO: PUT /api/admin/milestones/:id */
export async function updateMilestone(id: string, patch: Partial<Milestone>): Promise<Milestone> {
  await delay(500);
  milestoneStore = milestoneStore.map((m) => (m.id === id ? { ...m, ...patch } : m));
  const updated = milestoneStore.find((m) => m.id === id);
  if (!updated) throw new Error("Milestone not found");
  return structuredClone(updated);
}

/** TODO: DELETE /api/admin/milestones/:id */
export async function deleteMilestone(id: string): Promise<{ ok: true }> {
  await delay(400);
  milestoneStore = milestoneStore.filter((m) => m.id !== id);
  return { ok: true };
}

/** TODO: PATCH /api/admin/milestones/reorder */
export async function reorderMilestone(id: string, direction: "up" | "down"): Promise<Milestone[]> {
  await delay(250);
  const sorted = [...milestoneStore].sort((a, b) => a.order - b.order);
  const index = sorted.findIndex((m) => m.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swapWith < 0 || swapWith >= sorted.length) return getMilestonesSync();
  const a = sorted[index]!;
  const b = sorted[swapWith]!;
  const tmp = a.order;
  a.order = b.order;
  b.order = tmp;
  milestoneStore = sorted;
  return getMilestonesSync();
}

function getMilestonesSync(): Milestone[] {
  return structuredClone(milestoneStore).sort((a, b) => a.order - b.order);
}
