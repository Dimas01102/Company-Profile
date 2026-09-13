import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, Camera, CheckCircle2, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdminUser } from "@/components/admin/admin-context";
import { changePassword, updateProfile } from "@/lib/auth";

export const Route = createFileRoute("/admin/profile")({
  head: () => ({
    meta: [
      { title: "Admin Profile — Konektra Admin Console" },
      {
        name: "description",
        content:
          "Manage the administrator account details and password for the PT Batam Konektra Jaya website console.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin Profile — Konektra Admin Console" },
      { property: "og:description", content: "Administrator account settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminProfilePage,
});

function initials(name: string) {
  return name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border bg-surface">
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-primary">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-2 h-11 w-full border bg-background px-3.5 text-sm outline-none focus:border-secondary ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Notice({ kind, children }: { kind: "success" | "error"; children: React.ReactNode }) {
  const success = kind === "success";
  return (
    <div
      role={success ? "status" : "alert"}
      className={`mb-5 flex items-start gap-2.5 border-l-2 px-4 py-3 text-sm ${
        success
          ? "border-[color:var(--success)] bg-[color:var(--success)]/8 text-foreground"
          : "border-destructive bg-destructive/5 text-destructive"
      }`}
    >
      {success ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--success)]" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}

function AdminProfilePage() {
  const user = useAdminUser();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [position, setPosition] = useState(user.position);
  const [photo, setPhoto] = useState(user.photo);
  const [profileState, setProfileState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [pwState, setPwState] = useState<"idle" | "saving" | "saved">("idle");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      errs.email = "Enter a valid email address.";
    if (!phone.trim()) errs.phone = "Phone number is required.";
    setProfileErrors(errs);
    if (Object.keys(errs).length) return;

    setProfileState("saving");
    try {
      await updateProfile({ name, email, phone, position, photo });
      setProfileState("saved");
    } catch {
      setProfileState("error");
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.current = "Enter your current password.";
    if (newPassword.length < 8) errs.next = "New password must be at least 8 characters.";
    if (newPassword !== confirmPassword) errs.confirm = "Passwords do not match.";
    setPwErrors(errs);
    setPwError(null);
    if (Object.keys(errs).length) return;

    setPwState("saving");
    const result = await changePassword(currentPassword, newPassword);
    if (!result.ok) {
      setPwState("idle");
      setPwError(result.error ?? "Password could not be updated.");
      return;
    }
    setPwState("saved");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <>
      <AdminHeader user={user} title="Admin Profile" subtitle="Your account details and password" />

      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Panel title="Profile photo" description="Square image, at least 400 × 400 px.">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-28 w-28 items-center justify-center bg-primary text-2xl font-bold text-primary-foreground">
                {initials(name || user.name)}
              </div>
              <button
                type="button"
                onClick={() => setPhoto(`admin-${Date.now()}.jpg`)}
                className="btn-outline text-sm"
              >
                <Camera className="h-4 w-4" />
                Change photo
              </button>
              {photo && <p className="text-xs text-muted-foreground">{photo}</p>}
              <div className="w-full border-t border-border pt-4 text-left text-xs text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">Role:</span> Administrator
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-foreground">Last sign-in:</span> 7 Sep 2026,
                  07:41 WIB
                </p>
              </div>
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel
              title="Account details"
              description="Shown in the activity log and internal records."
            >
              {profileState === "saved" && (
                <Notice kind="success">Profile updated successfully.</Notice>
              )}
              {profileState === "error" && (
                <Notice kind="error">Profile could not be saved. Try again.</Notice>
              )}
              <form onSubmit={saveProfile} noValidate className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    value={name}
                    onChange={setName}
                    error={profileErrors.name}
                  />
                  <Field label="Position" value={position} onChange={setPosition} />
                  <Field
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    error={profileErrors.email}
                  />
                  <Field
                    label="Phone"
                    value={phone}
                    onChange={setPhone}
                    error={profileErrors.phone}
                  />
                </div>
                <button
                  type="submit"
                  disabled={profileState === "saving"}
                  className="btn-primary text-sm disabled:opacity-70"
                >
                  {profileState === "saving" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save changes
                    </>
                  )}
                </button>
              </form>
            </Panel>

            <Panel
              title="Change password"
              description="Use at least 8 characters with letters and numbers."
            >
              {pwState === "saved" && (
                <Notice kind="success">Password updated successfully.</Notice>
              )}
              {pwError && <Notice kind="error">{pwError}</Notice>}
              <form onSubmit={savePassword} noValidate className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-3">
                  <Field
                    label="Current password"
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    error={pwErrors.current}
                  />
                  <Field
                    label="New password"
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={setNewPassword}
                    error={pwErrors.next}
                  />
                  <Field
                    label="Confirm new password"
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    error={pwErrors.confirm}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={pwState === "saving"}
                    className="btn-primary text-sm disabled:opacity-70"
                  >
                    {pwState === "saving" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating…
                      </>
                    ) : (
                      "Update password"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswords((v) => !v)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-primary"
                  >
                    {showPasswords ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    {showPasswords ? "Hide passwords" : "Show passwords"}
                  </button>
                </div>
              </form>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}
