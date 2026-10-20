import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  Tags,
  Package,
  Newspaper,
  Images,
  Inbox,
  GalleryHorizontal,
  Settings,
  History,
  UserCog,
} from "lucide-react";
import { AdminBrand } from "./AdminBrand";

type Item = {
  label: string;
  icon: typeof LayoutDashboard;
  to?: string;
  badge?: string;
};

const primaryNav: Item[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
  { label: "Company Profile", icon: Building2, to: "/admin/company-profile" },
  { label: "Employees", icon: Users, to: "/admin/employees" },
  { label: "Categories", icon: Tags, to: "/admin/categories" },
  { label: "Products", icon: Package, to: "/admin/products" },
  { label: "News", icon: Newspaper, to: "/admin/news" },
  { label: "Gallery", icon: Images, to: "/admin/gallery" },
  { label: "Inquiries", icon: Inbox, to: "/admin/inquiries" },
  { label: "Banners", icon: GalleryHorizontal, to: "/admin/banners" },
];

const systemNav: Item[] = [
  { label: "Website Settings", icon: Settings, to: "/admin/settings" },
  { label: "Activity Logs", icon: History, to: "/admin/activity-logs" },
  { label: "Admin Profile", icon: UserCog, to: "/admin/profile" },
];

function NavGroup({
  title,
  items,
  pathname,
  onNavigate,
}: {
  title: string;
  items: Item[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="px-3 py-4">
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/40">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = item.to === pathname;
          const base =
            "flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-medium transition-colors";
          const Icon = item.icon;

          if (!item.to) {
            return (
              <li key={item.label}>
                <span
                  className={`${base} cursor-not-allowed border-transparent text-primary-foreground/40`}
                  title="Available in the next phase"
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-primary-foreground/10 px-1.5 py-0.5 text-[10px] font-semibold">
                      {item.badge}
                    </span>
                  )}
                </span>
              </li>
            );
          }

          return (
            <li key={item.label}>
              <Link
                to={item.to}
                onClick={onNavigate}
                className={`${base} ${
                  active
                    ? "border-accent bg-primary-foreground/10 text-primary-foreground"
                    : "border-transparent text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col bg-primary">
      <div className="flex h-16 items-center border-b border-primary-foreground/10 px-5">
        <AdminBrand />
      </div>
      <nav className="flex-1 overflow-y-auto divide-y divide-primary-foreground/10">
        <NavGroup title="Content" items={primaryNav} pathname={pathname} onNavigate={onNavigate} />
        <NavGroup title="System" items={systemNav} pathname={pathname} onNavigate={onNavigate} />
      </nav>
      <div className="border-t border-primary-foreground/10 px-5 py-4">
        <p className="text-[11px] text-primary-foreground/50">
          Console v1.7
          <br />
        </p>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
      <AdminSidebarContent />
    </aside>
  );
}
