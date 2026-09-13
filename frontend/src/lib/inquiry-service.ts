// ----------------------------------------------------------------------------
// MOCK INQUIRY SERVICE — visitor inquiry management for the admin console.
// In-memory only. Each function maps 1:1 to a future Laravel API endpoint.
// Visitors submit from the product detail page, the contact page, or a
// "request quotation" call to action; all land here for the sales team.
// ----------------------------------------------------------------------------

import { logActivity } from "@/lib/activity-log-service";

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

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function iso(daysAgo: number) {
  return new Date(Date.now() - daysAgo * 86400000).toISOString();
}

let inquiryStore: Inquiry[] = [
  {
    id: "iq-001",
    name: "Budi Santoso",
    company: "PT Indojaya Manufaktur",
    email: "budi.santoso@indojaya.co.id",
    phone: "+62 812-3456-7890",
    subject: "Quotation request — 1000 kVA transformer",
    message:
      "We are expanding our production line and need a quotation for a 1000 kVA cast-resin transformer, including delivery to Cikarang.",
    source: "Product Detail",
    product: "Cast-Resin Distribution Transformer 1000 kVA",
    date: iso(1),
    status: "New",
    notes: [],
  },
  {
    id: "iq-002",
    name: "Sarah Wijaya",
    company: "Batam Offshore Services",
    email: "sarah.w@batamoffshore.com",
    phone: "+62 813-9988-1122",
    subject: "Containerized genset availability",
    message:
      "Looking for 3 units of containerized diesel gensets for an offshore support project. What's the current lead time?",
    source: "Request Quotation",
    product: "Containerized Diesel Generator Set 500 kVA",
    date: iso(2),
    status: "Contacted",
    notes: [
      { id: "nt-1", author: "Sales Team", note: "Called client, sent datasheet.", date: iso(1) },
    ],
  },
  {
    id: "iq-003",
    name: "Ahmad Fauzi",
    company: "PLN Wilayah Kepri",
    email: "a.fauzi@pln.example.id",
    phone: "+62 811-2233-4455",
    subject: "General inquiry via contact page",
    message:
      "We'd like to schedule a facility visit to discuss switchgear supply for an upcoming substation upgrade.",
    source: "Contact Page",
    date: iso(4),
    status: "In Progress",
    notes: [
      {
        id: "nt-2",
        author: "Corporate Affairs",
        note: "Facility visit tentatively set for next month.",
        date: iso(3),
      },
    ],
  },
  {
    id: "iq-004",
    name: "Lina Kartika",
    company: "PT Sumber Energi Abadi",
    email: "lina.kartika@sea.co.id",
    phone: "+62 815-6677-8899",
    subject: "Busbar trunking specification",
    message:
      "Please send full technical specifications and pricing for your 2500A busbar trunking system.",
    source: "Product Detail",
    product: "Busbar Trunking System 2500A",
    date: iso(7),
    status: "Completed",
    notes: [
      {
        id: "nt-3",
        author: "Sales Team",
        note: "Quotation sent and accepted. PO received.",
        date: iso(5),
      },
    ],
  },
  {
    id: "iq-005",
    name: "Robert Tan",
    company: "Individual — not applicable",
    email: "robert.tan90@gmail.com",
    phone: "+62 817-0011-2233",
    subject: "Job application forwarded as inquiry",
    message:
      "This message was submitted through the contact form but was actually a job application; forwarding to HR.",
    source: "Contact Page",
    date: iso(10),
    status: "Cancelled",
    notes: [
      { id: "nt-4", author: "Admin", note: "Not a sales inquiry. Forwarded to HR.", date: iso(9) },
    ],
  },
  {
    id: "iq-006",
    name: "Dewi Anggraini",
    company: "PT Konstruksi Prima",
    email: "dewi.a@konstruksiprima.co.id",
    phone: "+62 819-4455-6677",
    subject: "MV switchgear for data center project",
    message:
      "We need MV switchgear panels compliant with IEC 62271 for a data center project in Batam. Please advise availability and lead time.",
    source: "Request Quotation",
    product: "Medium Voltage Switchgear Panel",
    date: iso(0),
    status: "New",
    notes: [],
  },
];

// --- inquiry service (GET/PATCH/DELETE /api/admin/inquiries) ---------------
export async function getInquiries(): Promise<Inquiry[]> {
  await delay(450);
  return clone(inquiryStore).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function getInquiry(id: string): Promise<Inquiry | undefined> {
  await delay(250);
  return clone(inquiryStore.find((i) => i.id === id));
}

export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<Inquiry> {
  await delay(450);
  const existing = inquiryStore.find((i) => i.id === id);
  if (!existing) throw new Error("Inquiry not found");
  const updated = { ...existing, status };
  inquiryStore = inquiryStore.map((i) => (i.id === id ? updated : i));
  logActivity({
    action: "Update",
    module: "Inquiries",
    description: `Changed inquiry status to ${status}`,
    affectedData: `${updated.id} — ${updated.name}`,
  });
  return clone(updated);
}

export async function addInternalNote(id: string, author: string, note: string): Promise<Inquiry> {
  await delay(450);
  const existing = inquiryStore.find((i) => i.id === id);
  if (!existing) throw new Error("Inquiry not found");
  const newNote: InternalNote = {
    id: `nt-${Date.now()}`,
    author,
    note,
    date: new Date().toISOString(),
  };
  const updated = { ...existing, notes: [...existing.notes, newNote] };
  inquiryStore = inquiryStore.map((i) => (i.id === id ? updated : i));
  logActivity({
    action: "Update",
    module: "Inquiries",
    description: "Added an internal note to an inquiry",
    affectedData: `${updated.id} — ${updated.name}`,
  });
  return clone(updated);
}

export async function deleteInquiry(id: string): Promise<void> {
  await delay(450);
  const target = inquiryStore.find((i) => i.id === id);
  inquiryStore = inquiryStore.filter((i) => i.id !== id);
  logActivity({
    action: "Archive",
    module: "Inquiries",
    description: "Archived an inquiry",
    affectedData: target ? `${target.id} — ${target.name}` : id,
  });
}
