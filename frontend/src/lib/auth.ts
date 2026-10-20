import { useEffect, useState } from "react";
import { api, ApiError, getAuthToken, setAuthToken } from "@/lib/api-client";

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

type RawAdmin = {
  id: number | string;
  name: string;
  email: string;
  phone: string | null;
  position: string | null;
  photo: string | null;
};

const SESSION_KEY = "konektra.admin.session";

function normalize(raw: RawAdmin): AdminUser {
  return {
    id: String(raw.id),
    name: raw.name,
    email: raw.email,
    phone: raw.phone ?? "",
    position: raw.position ?? "",
    photo: raw.photo ?? "",
    role: "admin",
  };
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

function readSession(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

function writeSession(user: AdminUser | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(SESSION_KEY);
  emit();
}

function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return e.firstError() ?? e.message;
  return fallback;
}

export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const data = await api.post<{ token: string; admin: RawAdmin }>("/admin/login", {
      email,
      password,
    });
    setAuthToken(data.token);
    const user = normalize(data.admin);
    writeSession(user);
    return { ok: true, user };
  } catch (e) {
    return {
      ok: false,
      error: errorMessage(e, "Could not reach the server. Please try again."),
    };
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post("/admin/logout");
  } catch {
    // Clear the local session regardless, an admin shouldn't stay "stuck"
    // logged in against a dead or already-expired token.
  } finally {
    setAuthToken(null);
    writeSession(null);
  }
}

export function getCurrentUser(): AdminUser | null {
  return readSession();
}

export function isAuthenticated(): boolean {
  return readSession() !== null && getAuthToken() !== null;
}

/** Re-validates the cached session against the server. Call once on app load. */
export async function refreshSession(): Promise<AdminUser | null> {
  if (!getAuthToken()) {
    writeSession(null);
    return null;
  }
  try {
    const admin = await api.get<RawAdmin>("/admin/me");
    const user = normalize(admin);
    writeSession(user);
    return user;
  } catch {
    setAuthToken(null);
    writeSession(null);
    return null;
  }
}

export async function updateProfile(
  patch: Partial<Pick<AdminUser, "name" | "email" | "phone" | "position">> & {
    photoFile?: File;
  },
): Promise<AdminUser> {
  const current = readSession();
  const { photoFile, ...rest } = patch;
  const payload = {
    name: current?.name ?? "",
    email: current?.email ?? "",
    phone: current?.phone ?? "",
    position: current?.position ?? "",
    ...rest,
    ...(photoFile ? { photo: photoFile } : {}),
  };

  const admin = await api.put<RawAdmin>("/admin/profile", payload, !!photoFile);
  const user = normalize(admin);
  writeSession(user);
  return user;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await api.put("/admin/password", {
      currentPassword,
      password: newPassword,
      passwordConfirmation: newPassword,
    });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: errorMessage(e, "Password could not be updated."),
    };
  }
}

// Matches AdminSeeder, shown as a hint on the login screen.
export const demoCredentials = {
  email: "admin@batamkonektrajaya.co.id",
  password: "Konektra#2026",
};

/** Hydration-safe auth state for components. */
export function useAdminAuth() {
  const [state, setState] = useState<{
    ready: boolean;
    user: AdminUser | null;
  }>({
    ready: false,
    user: null,
  });

  useEffect(() => {
    let alive = true;
    const sync = () => setState((s) => ({ ready: s.ready, user: readSession() }));
    listeners.add(sync);
    window.addEventListener("storage", sync);

    // Show the cached user immediately (no flash of "logged out"), then
    // confirm against the server in the background, a revoked/expired
    // token won't silently look authenticated.
    setState({ ready: false, user: readSession() });
    refreshSession().then((user) => {
      if (alive) setState({ ready: true, user });
    });

    return () => {
      alive = false;
      listeners.delete(sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return state;
}
