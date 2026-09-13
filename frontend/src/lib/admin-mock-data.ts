// ----------------------------------------------------------------------------
// MOCK ADMIN DATA — placeholder for future Laravel API responses.
// ----------------------------------------------------------------------------

import { products, news, team, galleryImages } from "@/lib/mock-data";

export type AdminStat = {
  key: string;
  label: string;
  value: number;
  delta: string;
  hint: string;
  icon: "Package" | "Users" | "Newspaper" | "Images" | "Inbox";
  to: string;
};

export const adminStats: AdminStat[] = [
  {
    key: "products",
    label: "Products",
    value: products.length,
    delta: "+3 this month",
    hint: "4 categories active",
    icon: "Package",
    to: "/admin",
  },
  {
    key: "employees",
    label: "Employees",
    value: team.length,
    delta: "No change",
    hint: "Management team profiles",
    icon: "Users",
    to: "/admin",
  },
  {
    key: "news",
    label: "News Articles",
    value: news.length,
    delta: "+2 this month",
    hint: "1 featured article",
    icon: "Newspaper",
    to: "/admin",
  },
  {
    key: "gallery",
    label: "Gallery Items",
    value: galleryImages.length,
    delta: "+5 this month",
    hint: "3 videos included",
    icon: "Images",
    to: "/admin",
  },
  {
    key: "inquiries",
    label: "Inquiries",
    value: 46,
    delta: "+12 this week",
    hint: "8 awaiting reply",
    icon: "Inbox",
    to: "/admin",
  },
];

export type InquiryPoint = { month: string; inquiries: number; quotations: number };
export const inquiryTrend: InquiryPoint[] = [
  { month: "Mar", inquiries: 18, quotations: 9 },
  { month: "Apr", inquiries: 24, quotations: 13 },
  { month: "May", inquiries: 21, quotations: 12 },
  { month: "Jun", inquiries: 30, quotations: 18 },
  { month: "Jul", inquiries: 35, quotations: 22 },
  { month: "Aug", inquiries: 41, quotations: 25 },
  { month: "Sep", inquiries: 46, quotations: 29 },
];

export type AdminInquiry = {
  id: string;
  company: string;
  contact: string;
  subject: string;
  product: string;
  status: "New" | "In Review" | "Quoted" | "Closed";
  receivedAt: string;
};

export const latestInquiries: AdminInquiry[] = [
  {
    id: "INQ-2609",
    company: "PT Nusantara Petrochem",
    contact: "Handoko Prasetyo",
    subject: "Quotation request — 2 x 1600 kVA cast-resin transformer",
    product: "Cast-Resin Dry-Type Transformer 1600 kVA",
    status: "New",
    receivedAt: "2026-09-07 08:12",
  },
  {
    id: "INQ-2608",
    company: "Batamindo Estate Management",
    contact: "Sri Wahyuni",
    subject: "LV switchgear panel for utility building upgrade",
    product: "Low-Voltage Switchgear Panel — MNS Type",
    status: "In Review",
    receivedAt: "2026-09-06 16:45",
  },
  {
    id: "INQ-2607",
    company: "Karimun Marine Yard",
    contact: "Ir. Yusuf Aditama",
    subject: "500 kVA genset with AMF panel, delivery week 42",
    product: "Industrial Diesel Generator Set 500 kVA",
    status: "Quoted",
    receivedAt: "2026-09-05 11:03",
  },
  {
    id: "INQ-2606",
    company: "Sumatra Grid Services",
    contact: "Rina Marlina",
    subject: "RMU 12 kV availability and FAT schedule",
    product: "Medium-Voltage Ring Main Unit 12 kV",
    status: "Closed",
    receivedAt: "2026-09-04 09:30",
  },
  {
    id: "INQ-2605",
    company: "PT Data Centra Indonesia",
    contact: "Alvin Kusnadi",
    subject: "Busbar trunking 2500 A for riser package",
    product: "Copper Busbar Trunking System 2500 A",
    status: "In Review",
    receivedAt: "2026-09-03 14:20",
  },
];

export type ActivityLog = {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
};

export const recentActivities: ActivityLog[] = [
  {
    id: "a-1",
    actor: "Dewi Kartika",
    action: "Published news article",
    target: "20 MVA Substation for Tier-III Data Center",
    at: "12 minutes ago",
  },
  {
    id: "a-2",
    actor: "Dewi Kartika",
    action: "Updated product",
    target: "Vacuum Circuit Breaker 24 kV",
    at: "1 hour ago",
  },
  {
    id: "a-3",
    actor: "Bambang Setiawan",
    action: "Uploaded gallery item",
    target: "Transformer factory walkthrough",
    at: "3 hours ago",
  },
  {
    id: "a-4",
    actor: "Dewi Kartika",
    action: "Replied to inquiry",
    target: "INQ-2607 — Karimun Marine Yard",
    at: "Yesterday, 17:24",
  },
  {
    id: "a-5",
    actor: "Linda Hartono",
    action: "Edited company profile",
    target: "Certifications section",
    at: "Yesterday, 10:02",
  },
  {
    id: "a-6",
    actor: "Dewi Kartika",
    action: "Added product category",
    target: "Power Distribution",
    at: "2 days ago",
  },
];

export const latestProducts = products.slice(0, 5);
export const latestNews = news.slice(0, 4);

/** TODO: replace with GET /api/admin/dashboard */
export async function fetchDashboard() {
  await new Promise((r) => setTimeout(r, 500));
  return {
    stats: adminStats,
    trend: inquiryTrend,
    inquiries: latestInquiries,
    activities: recentActivities,
    products: latestProducts,
    news: latestNews,
  };
}
