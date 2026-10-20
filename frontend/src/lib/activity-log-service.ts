import { api } from "@/lib/api-client";

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

export const activityModules = [
  "Authentication",
  "Banners",
  "Categories",
  "Company Profile",
  "Employees",
  "Gallery",
  "Inquiries",
  "Milestones",
  "News",
  "Products",
  "Settings",
];

type RawActivityLog = {
  id: number;
  timestamp: string | null;
  admin: string;
  action: string;
  module: string;
  description: string;
  // The API client camelCases every response key (affected_data -> affectedData).
  affectedData: string | null;
  status: ActivityStatus;
};

function normalize(raw: RawActivityLog): ActivityLog {
  return {
    id: String(raw.id),
    timestamp: raw.timestamp ?? "",
    admin: raw.admin,
    action: raw.action,
    module: raw.module,
    description: raw.description,
    affectedData: raw.affectedData ?? "",
    status: raw.status,
  };
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  const raw = await api.get<RawActivityLog[]>("/admin/activity-logs", {
    perPage: 1000,
  });
  return raw
    .map(normalize)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
