const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000/api";
const TOKEN_KEY = "konektra.admin.token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]> | null;

  constructor(message: string, status: number, errors: Record<string, string[]> | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  /** First validation message across all fields, handy for a single toast. */
  firstError(): string | null {
    if (!this.errors) return null;
    const first = Object.values(this.errors)[0];
    return first?.[0] ?? null;
  }
}

export function getErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return e.firstError() ?? (e.message || fallback);
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}

function toSnakeCase(key: string): string {
  return key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`);
}

function toCamelCase(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    !(v instanceof File) &&
    !(v instanceof Date)
  );
}

export function snakeizeKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(snakeizeKeys);
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [toSnakeCase(k), snakeizeKeys(v)]),
    );
  }
  return value;
}

export function camelizeKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(camelizeKeys);
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [toCamelCase(k), camelizeKeys(v)]),
    );
  }
  return value;
}

type QueryValue = string | number | boolean | undefined | null;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Send as multipart/form-data instead of JSON, required whenever `body` contains a File. */
  multipart?: boolean;
};

function buildQuery(query?: Record<string, QueryValue>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(toSnakeCase(key), String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Recursively appends a (possibly nested) value to FormData, snake_casing
 * keys as it goes. Laravel reads nested arrays as `key[0][field]`.
 */
function appendFormData(form: FormData, key: string, value: unknown) {
  if (value === undefined) return;
  if (value === null) {
    form.append(key, "");
  } else if (value instanceof File) {
    form.append(key, value);
  } else if (typeof value === "boolean") {
    form.append(key, value ? "1" : "0");
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => appendFormData(form, `${key}[${i}]`, v));
  } else if (isPlainObject(value)) {
    for (const [k, v] of Object.entries(value)) {
      appendFormData(form, `${key}[${toSnakeCase(k)}]`, v);
    }
  } else {
    form.append(key, String(value));
  }
}

function toFormData(body: Record<string, unknown>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(body)) {
    appendFormData(form, toSnakeCase(key), value);
  }
  return form;
}

type SuccessEnvelope<T> = {
  success: true;
  message: string | null;
  data: T;
  meta?: unknown;
};
type ErrorEnvelope = {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta: unknown }> {
  const { method = "GET", body, query, multipart } = options;
  const token = getAuthToken();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let fetchMethod: string = method;
  let fetchBody: BodyInit | undefined;

  if (body !== undefined && multipart) {
    const payload: Record<string, unknown> = {
      ...(body as Record<string, unknown>),
    };
    if (method === "PUT" || method === "PATCH") {
      payload._method = method;
      fetchMethod = "POST";
    }
    fetchBody = toFormData(payload);
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    fetchBody = JSON.stringify(snakeizeKeys(body));
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}${buildQuery(query)}`, {
      method: fetchMethod,
      headers,
      body: fetchBody,
    });
  } catch {
    throw new ApiError(
      `Could not reach the server at ${API_URL}. Check that the backend is running and that its CORS settings allow this site.`,
      0,
    );
  }

  const json = (await response.json().catch(() => null)) as
    SuccessEnvelope<T> | ErrorEnvelope | null;

  if (!response.ok || !json || json.success === false) {
    const errorJson = json as ErrorEnvelope | null;
    const fallbackMessage =
      response.status === 413
        ? "The upload is too large for the server. Use a smaller file or raise upload_max_filesize / post_max_size in php.ini."
        : response.status === 401
          ? "Your session has expired. Please sign in again."
          : `Request failed (${response.status}).`;
    throw new ApiError(
      errorJson?.message || fallbackMessage,
      response.status,
      errorJson?.errors ?? null,
    );
  }

  return { data: camelizeKeys(json.data) as T, meta: camelizeKeys(json.meta) };
}

export const api = {
  get: <T>(path: string, query?: Record<string, QueryValue>) =>
    request<T>(path, { method: "GET", query }).then((r) => r.data),
  getWithMeta: <T>(path: string, query?: Record<string, QueryValue>) =>
    request<T>(path, { method: "GET", query }),
  post: <T>(path: string, body?: unknown, multipart = false) =>
    request<T>(path, { method: "POST", body, multipart }).then((r) => r.data),
  put: <T>(path: string, body?: unknown, multipart = false) =>
    request<T>(path, { method: "PUT", body, multipart }).then((r) => r.data),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }).then((r) => r.data),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }).then((r) => r.data),
};
