import { api } from "@/lib/api-client";

export type AdminStat = {
  key: string;
  label: string;
  value: number;
  delta: string;
  hint: string;
  icon: "Package" | "Users" | "Newspaper" | "Images" | "Inbox";
  to: string;
};

export type InquiryPoint = {
  month: string;
  inquiries: number;
  quotations: number;
};

export type AdminInquiry = {
  id: string;
  company: string;
  contact: string;
  subject: string;
  product: string;
  status: string;
  receivedAt: string;
};

export type ActivityLog = {
  id: string | number;
  actor: string;
  action: string;
  target: string;
  at: string;
};

export type DashboardProduct = {
  id: string | number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  image: string | null;
};

export type DashboardNews = {
  id: string | number;
  title: string;
  category: string;
  date: string;
  author: string;
};

export type DashboardData = {
  stats: AdminStat[];
  trend: InquiryPoint[];
  inquiries: AdminInquiry[];
  activities: ActivityLog[];
  products: DashboardProduct[];
  news: DashboardNews[];
};

export async function fetchDashboard(): Promise<DashboardData> {
  return api.get<DashboardData>("/admin/dashboard");
}
