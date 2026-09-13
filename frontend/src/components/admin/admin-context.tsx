import { createContext, useContext } from "react";
import type { AdminUser } from "@/lib/auth";

export const AdminContext = createContext<{ user: AdminUser } | null>(null);

export function useAdminUser(): AdminUser {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdminUser must be used inside the admin layout");
  return ctx.user;
}
