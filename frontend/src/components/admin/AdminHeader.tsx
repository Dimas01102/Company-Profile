import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ExternalLink, LogOut, Menu, Search, UserCog } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminSidebarContent } from "./AdminSidebar";
import { logout, type AdminUser } from "@/lib/auth";

function initials(name: string) {
  return name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function AdminHeader({
  user,
  title,
  subtitle,
}: {
  user: AdminUser;
  title: string;
  subtitle?: string;
}) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  async function handleLogout() {
    await logout();
    setConfirmLogout(false);
    navigate({ to: "/admin/login" });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              className="inline-flex h-9 w-9 items-center justify-center border border-border text-primary lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-0 p-0">
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <AdminSidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-primary md:text-lg">{title}</h1>
          {subtitle && (
            <p className="hidden truncate text-xs text-muted-foreground md:block">{subtitle}</p>
          )}
        </div>

        <div className="relative hidden xl:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search console…"
            className="h-9 w-64 border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-secondary"
          />
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1.5 border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-muted md:inline-flex"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View website
        </a>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 border border-border px-2 py-1.5 text-left hover:bg-muted">
              <span className="flex h-7 w-7 items-center justify-center bg-primary text-[11px] font-bold text-primary-foreground">
                {initials(user.name)}
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-xs font-semibold text-foreground">
                  {user.name.split(",")[0]}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                  Admin
                </span>
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 rounded-none">
            <DropdownMenuLabel className="py-3">
              <span className="block text-sm font-semibold text-foreground">{user.name}</span>
              <span className="block text-xs font-normal text-muted-foreground">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="rounded-none">
              <Link to="/admin/profile" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Admin profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setConfirmLogout(true);
              }}
              className="rounded-none text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to manage website content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="rounded-none">
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
