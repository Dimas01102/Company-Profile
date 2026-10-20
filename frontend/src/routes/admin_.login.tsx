import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { login, useAdminAuth, demoCredentials } from "@/lib/auth";
import { company } from "@/lib/mock-data";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({
    meta: [
      { title: "Administrator Sign In PT Batam Konektra Jaya" },
      {
        name: "description",
        content:
          "Secure sign-in for PT Batam Konektra Jaya website administrators managing products, news, gallery, and inquiries.",
      },
      { name: "robots", content: "noindex, nofollow" },
      {
        property: "og:title",
        content: "Administrator Sign In PT Batam Konektra Jaya",
      },
      {
        property: "og:description",
        content: "Internal administrator access for PT Batam Konektra Jaya.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { ready, user } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  useEffect(() => {
    if (ready && user) navigate({ to: "/admin", replace: true });
  }, [ready, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 6) next.password = "Password must be at least 6 characters.";

    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setStatus("loading");
    const result = await login(email, password);
    if (!result.ok) {
      setStatus("idle");
      setFormError(result.error);
      return;
    }
    setStatus("success");
    setTimeout(() => navigate({ to: "/admin", replace: true }), 600);
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-primary px-12 py-14 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center bg-accent text-sm font-bold text-accent-foreground">
            BK
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold text-primary-foreground">{company.name}</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/60">
              Administrator Console
            </p>
          </div>
        </div>

        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            Internal access only
          </p>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-primary-foreground">
            Manage the company website, product catalog, and customer inquiries in one place.
          </h2>
          <ul className="mt-8 space-y-3 text-sm text-primary-foreground/75">
            {[
              "Product catalog and technical specifications",
              "News, gallery, and homepage banners",
              "Customer inquiries and activity records",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2 border-t border-primary-foreground/10 pt-6 text-xs text-primary-foreground/50">
          <ShieldCheck className="h-4 w-4" />
          Access is monitored and recorded in the activity log.
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center px-5 py-12 lg:min-h-0">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center bg-primary text-xs font-bold text-primary-foreground">
              BK
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-primary">{company.name}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
                Administrator Console
              </p>
            </div>
          </div>

          <div className="border border-border bg-surface p-7 shadow-(--shadow-card) md:p-9">
            <p className="eyebrow">Sign in</p>
            <h1 className="mt-2 text-2xl font-bold text-primary">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your administrator account to manage website content.
            </p>

            {formError && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-2.5 border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {status === "success" && (
              <div
                role="status"
                className="mt-6 flex items-start gap-2.5 border-l-2 border-success bg-(--success)/8 px-4 py-3 text-sm text-foreground"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>Signed in successfully. Opening the dashboard…</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  className={`mt-2 h-11 w-full border bg-background px-3.5 text-sm outline-none transition-colors focus:border-secondary ${
                    errors.email ? "border-destructive" : "border-input"
                  }`}
                  placeholder="name@batamkonektra.co.id"
                />
                {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFormError("Please contact your IT administrator to reset your password.")
                    }
                    className="text-xs font-semibold text-secondary hover:text-primary"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!errors.password}
                    className={`h-11 w-full border bg-background px-3.5 pr-11 text-sm outline-none transition-colors focus:border-secondary ${
                      errors.password ? "border-destructive" : "border-input"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-primary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-secondary"
                />
                Remember me on this device
              </label>

              <button
                type="submit"
                disabled={status !== "idle"}
                className="btn-primary w-full disabled:opacity-70"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : status === "success" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Success
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-start gap-2.5 border border-dashed border-border bg-muted px-4 py-3 text-xs text-muted-foreground">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Demo account:{" "}
                <span className="font-semibold text-foreground">{demoCredentials.email}</span> /{" "}
                <span className="font-semibold text-foreground">{demoCredentials.password}</span>
              </span>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="font-semibold text-secondary hover:text-primary">
              Return to the public website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
