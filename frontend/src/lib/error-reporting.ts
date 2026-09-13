// Lightweight client-side error reporting hook.
// Wire this up to a real monitoring service (e.g. Sentry) when one is
// selected for production. For now it just logs so error boundaries have
// a single place to report from.

type ErrorReportOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

export function reportClientError(
  error: unknown,
  context: Record<string, unknown> = {},
  options: ErrorReportOptions = {},
) {
  if (typeof window === "undefined") return;
  console.error("[error-reporting]", error, {
    route: window.location.pathname,
    ...context,
    ...options,
  });
}
