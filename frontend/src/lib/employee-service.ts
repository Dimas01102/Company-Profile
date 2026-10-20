import { api } from "@/lib/api-client";

export type EmployeeStatus = "Active" | "Inactive";

export type Employee = {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  photo: string;
  shortBio: string;
  fullBio: string;
  responsibilities: string[];
  experience: string[];
  linkedin: string;
  order: number;
  status: EmployeeStatus;
};

export const departments = [
  "Board of Directors",
  "Engineering",
  "Operations",
  "Sales & Marketing",
  "Quality & HSE",
];

type RawEmployee = {
  id: number;
  employeeCode: string;
  name: string;
  position: string;
  department: string;
  email: string | null;
  phone: string | null;
  photo: string | null;
  shortBio: string | null;
  fullBio: string | null;
  responsibilities: string[] | null;
  experience: string[] | null;
  linkedin: string | null;
  order: number;
  status: EmployeeStatus;
};

function normalize(raw: RawEmployee): Employee {
  return {
    id: String(raw.id),
    employeeId: raw.employeeCode,
    name: raw.name,
    position: raw.position,
    department: raw.department,
    email: raw.email ?? "",
    phone: raw.phone ?? "",
    photo: raw.photo ?? "",
    shortBio: raw.shortBio ?? "",
    fullBio: raw.fullBio ?? "",
    responsibilities: raw.responsibilities ?? [],
    experience: raw.experience ?? [],
    linkedin: raw.linkedin ?? "",
    order: raw.order,
    status: raw.status,
  };
}

/**
 * Lists are cleaned (blank lines dropped). An empty list is sent as null so the
 * key still reaches the API: multipart requests drop empty arrays entirely,
 * which would leave the old values in place.
 */
function cleanList(list: string[] | undefined): string[] | null | undefined {
  if (list === undefined) return undefined;
  const cleaned = list.map((x) => x.trim()).filter(Boolean);
  return cleaned.length ? cleaned : null;
}

function toPayload(input: Omit<Employee, "id"> | Partial<Employee>) {
  const { employeeId, photo: _photo, responsibilities, experience, ...rest } = input;
  return {
    ...(employeeId !== undefined ? { employeeCode: employeeId } : {}),
    ...rest,
    ...(responsibilities !== undefined ? { responsibilities: cleanList(responsibilities) } : {}),
    ...(experience !== undefined ? { experience: cleanList(experience) } : {}),
  };
}

export async function getEmployees(): Promise<Employee[]> {
  const raw = await api.get<RawEmployee[]>("/admin/employees", {
    perPage: 1000,
  });
  return raw.map(normalize).sort((a, b) => a.order - b.order);
}

export async function createEmployee(
  input: Omit<Employee, "id">,
  photoFile?: File,
): Promise<Employee> {
  const payload = photoFile ? { ...toPayload(input), photo: photoFile } : toPayload(input);
  const raw = await api.post<RawEmployee>("/admin/employees", payload, !!photoFile);
  return normalize(raw);
}

export async function updateEmployee(
  id: string,
  patch: Partial<Employee>,
  photoFile?: File,
): Promise<Employee> {
  // An emptied photo field without a new upload means "Remove photo" was pressed.
  const removePhoto = patch.photo === "" && !photoFile;
  const base = removePhoto ? { ...toPayload(patch), removePhoto: true } : toPayload(patch);
  const payload = photoFile ? { ...base, photo: photoFile } : base;
  const raw = await api.put<RawEmployee>(`/admin/employees/${id}`, payload, !!photoFile);
  return normalize(raw);
}

export async function deleteEmployee(id: string): Promise<{ ok: true }> {
  await api.delete(`/admin/employees/${id}`);
  return { ok: true };
}

export function emptyEmployee(nextOrder: number): Omit<Employee, "id"> {
  return {
    employeeId: "",
    name: "",
    position: "",
    department: departments[0] ?? "Engineering",
    email: "",
    phone: "",
    photo: "",
    shortBio: "",
    fullBio: "",
    responsibilities: [],
    experience: [],
    linkedin: "",
    order: nextOrder,
    status: "Active",
  };
}
