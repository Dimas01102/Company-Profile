// ----------------------------------------------------------------------------
// MOCK AUTHENTICATION SERVICE
// Frontend-only. Replace the internals of login/logout/getCurrentUser with real
// Laravel API calls later — the exported signatures must stay the same.
// ----------------------------------------------------------------------------

import { useEffect, useState } from "react";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  photo: string;
  role: "admin";
};

export type LoginResult = { ok: true; user: AdminUser } | { ok: false; error: string };

const STORAGE_KEY = "konektra.admin.session";

// Demo credentials — replaced by Laravel auth later.
const DEMO_EMAIL = "admin@batamkonektra.co.id";
const DEMO_PASSWORD = "admin123";

const demoAdmin: AdminUser = {
  id: "u-001",
  name: "Dewi Kartika, S.T.",
  email: DEMO_EMAIL,
  phone: "+62 811 7000 220",
  position: "Website Administrator",
  photo: "",
  role: "admin",
};

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

function readSession(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

function writeSession(user: AdminUser | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(STORAGE_KEY);
  emit();
}

/** TODO: replace with POST /api/admin/login */
export async function login(email: string, password: string): Promise<LoginResult> {
  await new Promise((r) => setTimeout(r, 900));
  const normalized = email.trim().toLowerCase();
  if (normalized !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
    return { ok: false, error: "Incorrect email or password. Please try again." };
  }
  writeSession(demoAdmin);
  return { ok: true, user: demoAdmin };
}

/** TODO: replace with POST /api/admin/logout */
export async function logout(): Promise<void> {
  writeSession(null);
}

/** TODO: replace with GET /api/admin/me */
export function getCurrentUser(): AdminUser | null {
  return readSession();
}

export function isAuthenticated(): boolean {
  return readSession() !== null;
}

/** TODO: replace with PATCH /api/admin/me */
export async function updateProfile(patch: Partial<AdminUser>): Promise<AdminUser> {
  await new Promise((r) => setTimeout(r, 700));
  const current = readSession() ?? demoAdmin;
  const next = { ...current, ...patch };
  writeSession(next);
  return next;
}

/** TODO: replace with PUT /api/admin/password */
export async function changePassword(
  currentPassword: string,
  _newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  await new Promise((r) => setTimeout(r, 700));
  if (currentPassword !== DEMO_PASSWORD) {
    return { ok: false, error: "Current password is incorrect." };
  }
  return { ok: true };
}

export const demoCredentials = { email: DEMO_EMAIL, password: DEMO_PASSWORD };

/** Hydration-safe auth state for components. */
export function useAdminAuth() {
  const [state, setState] = useState<{ ready: boolean; user: AdminUser | null }>({
    ready: false,
    user: null,
  });

  useEffect(() => {
    const sync = () => setState({ ready: true, user: readSession() });
    sync();
    listeners.add(sync);
    window.addEventListener("storage", sync);
    return () => {
      listeners.delete(sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return state;
}
