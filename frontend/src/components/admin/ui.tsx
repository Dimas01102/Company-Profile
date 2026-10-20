import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Panel({
  title,
  description,
  action,
  padded = true,
  children,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  padded?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="border border-border bg-surface">
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-primary">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  error,
  placeholder,
  hint,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`mt-2 h-10 w-full border bg-background px-3 text-sm outline-none focus:border-secondary disabled:bg-muted disabled:text-muted-foreground ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  error,
  hint,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={`mt-2 w-full border bg-background px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-secondary disabled:bg-muted disabled:text-muted-foreground ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-secondary disabled:bg-muted disabled:text-muted-foreground"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Notice({ kind, children }: { kind: "success" | "error"; children: ReactNode }) {
  const success = kind === "success";
  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-2.5 border-l-2 px-4 py-3 text-sm ${
        success
          ? "border-success bg-(--success)/8 text-foreground"
          : "border-destructive bg-destructive/5 text-destructive"
      }`}
    >
      {success ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{children}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center bg-muted text-muted-foreground">
        <Inbox className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-semibold text-primary">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="border border-destructive/40 bg-destructive/5 px-5 py-10 text-center">
      <p className="text-sm font-semibold text-destructive">{message}</p>
      <button type="button" onClick={onRetry} className="btn-outline mt-4 text-sm">
        Try again
      </button>
    </div>
  );
}

export function FormSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border border-border bg-surface p-5">
          <Skeleton className="h-4 w-40 rounded-none" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full rounded-none" />
            <Skeleton className="h-10 w-full rounded-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-10 w-10 rounded-none" />
          <Skeleton className="h-4 flex-1 rounded-none" />
          <Skeleton className="hidden h-4 w-32 rounded-none sm:block" />
          <Skeleton className="h-4 w-16 rounded-none" />
        </div>
      ))}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const active = status === "Active";
  return (
    <span
      className={`inline-flex px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
        active ? "bg-(--success)/12 text-[oklch(0.42_0.13_145)]" : "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}
