// ----------------------------------------------------------------------------
// INQUIRY SERVICE, talks to the real Laravel API (/api/admin/inquiries).
// Exported names are unchanged from the old mock version so
// admin.inquiries.tsx doesn't need to change its data-layer calls.
// Activity log entries are written server-side by the controller.
// ----------------------------------------------------------------------------

import { api } from "@/lib/api-client";

export type InquiryStatus = "New" | "Contacted" | "In Progress" | "Completed" | "Cancelled";
export type InquirySource = "Product Detail" | "Contact Page" | "Request Quotation";

export type InternalNote = {
  id: string;
  author: string;
  note: string;
  date: string;
};

export type Inquiry = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: InquirySource;
  product?: string;
  date: string;
  status: InquiryStatus;
  notes: InternalNote[];
};

export const inquiryStatuses: InquiryStatus[] = [
  "New",
  "Contacted",
  "In Progress",
  "Completed",
  "Cancelled",
];

type RawNote = {
  id: number;
  author: string;
  note: string;
  date: string | null;
};

type RawInquiry = {
  id: number;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  source: InquirySource | null;
  product: string | null;
  date: string | null;
  status: InquiryStatus;
  notes: RawNote[] | null;
};

function normalize(raw: RawInquiry): Inquiry {
  return {
    id: String(raw.id),
    name: raw.name,
    company: raw.company ?? "",
    email: raw.email,
    phone: raw.phone ?? "",
    subject: raw.subject ?? "",
    message: raw.message,
    source: raw.source ?? "Contact Page",
    product: raw.product ?? undefined,
    date: raw.date ?? "",
    status: raw.status,
    notes: (raw.notes ?? []).map((n) => ({
      id: String(n.id),
      author: n.author,
      note: n.note,
      date: n.date ?? "",
    })),
  };
}

export async function getInquiries(): Promise<Inquiry[]> {
  const raw = await api.get<RawInquiry[]>("/admin/inquiries", {
    perPage: 1000,
  });
  return raw.map(normalize).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
  const raw = await api.patch<RawInquiry>(`/admin/inquiries/${id}/status`, {
    status,
  });
  return normalize(raw);
}

/** `author` is ignored by the backend, it records the authenticated admin's
 *  own name server-side, but kept in the signature so the page doesn't
 *  need to change. */
export async function addInternalNote(id: string, _author: string, note: string): Promise<Inquiry> {
  const raw = await api.post<RawInquiry>(`/admin/inquiries/${id}/notes`, {
    note,
  });
  return normalize(raw);
}

/** Soft delete the backend calls this "archive"; the record stays
 *  recoverable in the database. */
export async function deleteInquiry(id: string): Promise<void> {
  await api.delete(`/admin/inquiries/${id}`);
}
