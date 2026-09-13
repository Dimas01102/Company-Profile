// ----------------------------------------------------------------------------
// MOCK ACTIVITY LOG SERVICE — audit trail for admin actions.
// In-memory only. logActivity() is called by other admin services/pages after
// a successful mutation; the equivalent Laravel API would write this
// server-side inside each write endpoint instead.
// ----------------------------------------------------------------------------

export type ActivityStatus = "Success" | "Failed";

export type ActivityLog = {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  module: string;
  description: string;
  affectedData: string;
  status: ActivityStatus;
};

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function iso(hoursAgo: number) {
  return new Date(Date.now() - hoursAgo * 3600000).toISOString();
}

let logStore: ActivityLog[] = [
  {
    id: "log-001",
    timestamp: iso(1),
    admin: "Admin Konektra",
    action: "Update",
    module: "Inquiries",
    description: "Changed inquiry status to Contacted",
    affectedData: "iq-002 — Sarah Wijaya",
    status: "Success",
  },
  {
    id: "log-002",
    timestamp: iso(5),
    admin: "Admin Konektra",
    action: "Create",
    module: "News",
    description: "Published a new news article",
    affectedData: "Konektra Commissions 20 MVA Substation for Tier-III Data Center in Batam",
    status: "Success",
  },
  {
    id: "log-003",
    timestamp: iso(20),
    admin: "Admin Konektra",
    action: "Update",
    module: "Products",
    description: "Updated stock levels",
    affectedData: "BKJ-0004 — Cast-Resin Distribution Transformer",
    status: "Success",
  },
  {
    id: "log-004",
    timestamp: iso(30),
    admin: "Admin Konektra",
    action: "Delete",
    module: "Gallery",
    description: "Removed a gallery image",
    affectedData: "g-9 — Substation commissioning",
    status: "Success",
  },
  {
    id: "log-005",
    timestamp: iso(48),
    admin: "Admin Konektra",
    action: "Login",
    module: "Authentication",
    description: "Signed in to the admin console",
    affectedData: "—",
    status: "Success",
  },
  {
    id: "log-006",
    timestamp: iso(72),
    admin: "Admin Konektra",
    action: "Update",
    module: "Categories",
    description: "Reordered product categories",
    affectedData: "Transformers, Switchgear, Generators",
    status: "Success",
  },
];

// --- activity log service (GET /api/admin/activity-logs) -------------------
export async function getActivityLogs(): Promise<ActivityLog[]> {
  await delay(450);
  return clone(logStore).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

// Called by other admin services after a successful mutation.
export function logActivity(
  entry: Omit<ActivityLog, "id" | "timestamp" | "admin" | "status"> & {
    admin?: string;
    status?: ActivityStatus;
  },
) {
  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    admin: entry.admin ?? "Admin Konektra",
    status: entry.status ?? "Success",
    action: entry.action,
    module: entry.module,
    description: entry.description,
    affectedData: entry.affectedData,
  };
  logStore = [log, ...logStore];
}

export const activityModules = [
  "Authentication",
  "Company Profile",
  "Employees",
  "Categories",
  "Products",
  "News",
  "Gallery",
  "Banners",
  "Inquiries",
  "Settings",
];
