import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportClientError } from "../lib/error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { getPublicSeo } from "@/lib/public-data";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Error 404</p>
        <h1 className="mt-3 text-5xl font-bold text-primary">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-primary">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportClientError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-primary">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. Please refresh or return home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary"
          >
            Try again
          </button>
          <a href="/" className="btn-outline">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_TITLE = "PT Batam Konektra Jaya Industrial Engineering & Power Solutions";
const DEFAULT_DESCRIPTION =
  "PT Batam Konektra Jaya supplies transformers, switchgear, and industrial electrical systems to power, energy, and manufacturing companies across Indonesia.";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // Site-wide SEO defaults managed in Admin > Company Profile > SEO. Pages that
  // define their own title/description (products, news, about...) override these.
  loader: async () => ({ seo: await getPublicSeo() }),
  staleTime: 60_000,
  head: ({ loaderData }) => {
    const seo = loaderData?.seo;
    const title = seo?.title || DEFAULT_TITLE;
    const description = seo?.description || DEFAULT_DESCRIPTION;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title },
        { name: "description", content: description },
        ...(seo?.keywords ? [{ name: "keywords", content: seo.keywords }] : []),
        { name: "author", content: seo?.siteName || "PT Batam Konektra Jaya" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(seo?.ogImage
          ? [
              { property: "og:image", content: seo.ogImage },
              { name: "twitter:image", content: seo.ogImage },
            ]
          : []),
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
        },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
