import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAdminAuth } from "@/lib/auth";
import { AdminContext } from "@/components/admin/admin-context";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console PT Batam Konektra Jaya" },
      {
        name: "description",
        content:
          "Internal administration console for managing PT Batam Konektra Jaya website content, products, news, and inquiries.",
      },
      { name: "robots", content: "noindex, nofollow" },
      {
        property: "og:title",
        content: "Admin Console, PT Batam Konektra Jaya",
      },
      {
        property: "og:description",
        content: "Internal content management console for PT Batam Konektra Jaya.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { ready, user } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !user) navigate({ to: "/admin/login", replace: true });
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verifying your session…
        </div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ user }}>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="lg:pl-64">
          <Outlet />
        </div>
      </div>
    </AdminContext.Provider>
  );
}
