import { api } from "@/lib/api-client";

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
  name: string;
  logoName: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  history: string;
  foundedYear: string;
  background: string;
  vision: string;
  mission: string;
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
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  mapEmbed: string;
  latitude: string;
  longitude: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImageName: string;
  profilePdfName: string;
  profilePdfSize: string;
  profilePdfUpdatedAt: string;
  coreValues: CoreValue[];
};

function blankProfile(): CompanyProfile {
  return {
    name: "",
    logoName: "",
    tagline: "",
    shortDescription: "",
    fullDescription: "",
    history: "",
    foundedYear: "",
    background: "",
    vision: "",
    mission: "",
    businessType: "",
    industry: "",
    businessScope: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
    whatsapp: "",
    email: "",
    businessHours: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    mapEmbed: "",
    latitude: "",
    longitude: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    ogImageName: "",
    profilePdfName: "",
    profilePdfSize: "",
    profilePdfUpdatedAt: "",
    coreValues: [],
  };
}

type RawCoreValue = {
  id: number;
  name: string;
  description: string | null;
  icon: string;
  order: number;
};
type RawProfile = {
  name: string;
  logo: string | null;
  tagline: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  history: string | null;
  foundedYear: string | null;
  background: string | null;
  vision: string | null;
  mission: string | null;
  businessType: string | null;
  industry: string | null;
  businessScope: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  businessHours: string | null;
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
  mapEmbed: string | null;
  latitude: string | null;
  longitude: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  ogImage: string | null;
  profilePdf: string | null;
  profilePdfSize: string | null;
  profilePdfUpdatedAt: string | null;
  coreValues?: RawCoreValue[];
};

function normalize(raw: RawProfile): CompanyProfile {
  return {
    name: raw.name,
    logoName: raw.logo ?? "",
    tagline: raw.tagline ?? "",
    shortDescription: raw.shortDescription ?? "",
    fullDescription: raw.fullDescription ?? "",
    history: raw.history ?? "",
    foundedYear: raw.foundedYear ?? "",
    background: raw.background ?? "",
    vision: raw.vision ?? "",
    mission: raw.mission ?? "",
    businessType: raw.businessType ?? "",
    industry: raw.industry ?? "",
    businessScope: raw.businessScope ?? "",
    address: raw.address ?? "",
    city: raw.city ?? "",
    province: raw.province ?? "",
    postalCode: raw.postalCode ?? "",
    phone: raw.phone ?? "",
    whatsapp: raw.whatsapp ?? "",
    email: raw.email ?? "",
    businessHours: raw.businessHours ?? "",
    facebook: raw.facebook ?? "",
    instagram: raw.instagram ?? "",
    linkedin: raw.linkedin ?? "",
    youtube: raw.youtube ?? "",
    mapEmbed: raw.mapEmbed ?? "",
    latitude: raw.latitude ?? "",
    longitude: raw.longitude ?? "",
    metaTitle: raw.metaTitle ?? "",
    metaDescription: raw.metaDescription ?? "",
    keywords: raw.keywords ?? "",
    ogImageName: raw.ogImage ?? "",
    profilePdfName: raw.profilePdf ?? "",
    profilePdfSize: raw.profilePdfSize ?? "",
    profilePdfUpdatedAt: raw.profilePdfUpdatedAt ?? "",
    coreValues: (raw.coreValues ?? []).map((c) => ({
      id: String(c.id),
      name: c.name,
      description: c.description ?? "",
      icon: c.icon,
      order: c.order,
    })),
  };
}

export async function getCompanyProfile(): Promise<CompanyProfile> {
  const raw = await api.get<RawProfile>("/admin/company-profile");
  return normalize(raw);
}

export type CompanyProfileFiles = {
  logoFile?: File;
  ogImageFile?: File;
  profilePdfFile?: File;
};

export async function updateCompanyProfile(
  patch: Partial<CompanyProfile>,
  files?: CompanyProfileFiles,
): Promise<CompanyProfile> {
  const p = { ...blankProfile(), ...patch };
  const body: Record<string, unknown> = {
    name: p.name,
    tagline: p.tagline,
    shortDescription: p.shortDescription,
    fullDescription: p.fullDescription,
    history: p.history,
    foundedYear: p.foundedYear,
    background: p.background,
    vision: p.vision,
    mission: p.mission,
    businessType: p.businessType,
    industry: p.industry,
    businessScope: p.businessScope,
    address: p.address,
    city: p.city,
    province: p.province,
    postalCode: p.postalCode,
    phone: p.phone,
    whatsapp: p.whatsapp,
    email: p.email,
    businessHours: p.businessHours,
    facebook: p.facebook,
    instagram: p.instagram,
    linkedin: p.linkedin,
    youtube: p.youtube,
    mapEmbed: p.mapEmbed,
    latitude: p.latitude,
    longitude: p.longitude,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    keywords: p.keywords,
    coreValues: p.coreValues.map((c, i) => ({
      name: c.name,
      description: c.description,
      icon: c.icon,
      order: c.order ?? i,
    })),
  };

  const hasFiles = !!(files?.logoFile || files?.ogImageFile || files?.profilePdfFile);
  if (files?.logoFile) body.logo = files.logoFile;
  if (files?.ogImageFile) body.ogImage = files.ogImageFile;
  if (files?.profilePdfFile) body.profilePdf = files.profilePdfFile;

  // A cleared file name with no replacement upload means "Remove" was pressed
  // in the form, tell the server to delete the stored file.
  if (!files?.logoFile && !p.logoName) body.removeLogo = true;
  if (!files?.ogImageFile && !p.ogImageName) body.removeOgImage = true;
  if (!files?.profilePdfFile && !p.profilePdfName) body.removeProfilePdf = true;

  const raw = await api.put<RawProfile>("/admin/company-profile", body, hasFiles);
  return normalize(raw);
}

export type ResolvedMap = { latitude: string; longitude: string; embedUrl: string };

/** Ask the server to expand a Google Maps link (short links need this). */
export async function resolveMapLink(url: string): Promise<ResolvedMap> {
  return api.post<ResolvedMap>("/admin/company-profile/resolve-map", { url });
}

export function getDefaultCompanyProfile(): CompanyProfile {
  return blankProfile();
}

// --- milestones --------------------------------------------------------
type RawMilestone = {
  id: number;
  year: string;
  title: string;
  description: string | null;
  image: string | null;
  order: number;
  active: boolean;
};

function normalizeMilestone(raw: RawMilestone): Milestone {
  return {
    id: String(raw.id),
    year: raw.year,
    title: raw.title,
    description: raw.description ?? "",
    image: raw.image ?? "",
    order: raw.order,
    active: raw.active,
  };
}

export async function getMilestones(): Promise<Milestone[]> {
  const raw = await api.get<RawMilestone[]>("/admin/milestones");
  return raw.map(normalizeMilestone).sort((a, b) => a.order - b.order);
}

// `image` holds a URL (or a just-picked file name) on the client, the API only
// accepts a real uploaded file for it, so it is never sent as text. A new
// image goes up as `imageFile`.
function milestonePayload(input: Omit<Milestone, "id"> | Partial<Milestone>) {
  const { image: _image, ...rest } = input;
  return rest;
}

export async function createMilestone(
  input: Omit<Milestone, "id">,
  imageFile?: File,
): Promise<Milestone> {
  const payload = imageFile
    ? { ...milestonePayload(input), image: imageFile }
    : milestonePayload(input);
  const raw = await api.post<RawMilestone>("/admin/milestones", payload, !!imageFile);
  return normalizeMilestone(raw);
}

/**
 * The API validates the whole milestone on every update (year and title are
 * required), so callers must pass the complete milestone, not a partial one,
 * e.g. toggling `active` sends `{ ...milestone, active: !milestone.active }`.
 */
export async function updateMilestone(
  id: string,
  milestone: Omit<Milestone, "id">,
  imageFile?: File,
): Promise<Milestone> {
  // An emptied image field without a new upload means "Remove" was pressed.
  const payload = imageFile
    ? { ...milestonePayload(milestone), image: imageFile }
    : { ...milestonePayload(milestone), ...(milestone.image ? {} : { removeImage: true }) };
  const raw = await api.put<RawMilestone>(`/admin/milestones/${id}`, payload, !!imageFile);
  return normalizeMilestone(raw);
}

export async function deleteMilestone(id: string): Promise<{ ok: true }> {
  await api.delete(`/admin/milestones/${id}`);
  return { ok: true };
}

export async function reorderMilestone(id: string, direction: "up" | "down"): Promise<Milestone[]> {
  const raw = await api.patch<RawMilestone[]>(`/admin/milestones/${id}/reorder`, { direction });
  return raw.map(normalizeMilestone).sort((a, b) => a.order - b.order);
}
