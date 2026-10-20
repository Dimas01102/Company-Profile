import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Download,
  Mail,
  Phone,
} from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { company, type Product, type ProductDetail } from "@/lib/mock-data";
import { getPublicProduct } from "@/lib/public-data";

type LoaderData = { product: ProductDetail; related: Product[] };

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }): Promise<LoaderData> => {
    const result = await getPublicProduct(params.slug);
    if (!result) throw notFound();
    const { related, ...product } = result;
    return { product: product as ProductDetail, related };
  },

  head: ({ loaderData }) => {
    const p = loaderData?.product;
    const title = p
      ? `${p.metaTitle || p.name} | PT Batam Konektra Jaya`
      : "Product | PT Batam Konektra Jaya";
    const description =
      p?.metaDescription || p?.shortDescription || "Industrial power product detail.";
    const shareImage = p?.ogImage || p?.image;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(p?.keywords ? [{ name: "keywords", content: p.keywords }] : []),
        ...(shareImage ? [{ property: "og:image", content: shareImage }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-page py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">404</p>
        <h1 className="mt-3 text-3xl font-bold">Product not found</h1>
        <p className="mt-3 text-muted-foreground">
          The product you're looking for is unavailable or has been renamed.
        </p>
        <Button asChild className="mt-6">
          <Link to="/products">Back to catalog</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
  component: ProductDetail,
});

const availabilityStyles: Record<string, string> = {
  Available: "bg-[color:oklch(0.95_0.05_145)] text-[color:oklch(0.4_0.13_145)]",
  "Limited Stock": "bg-[color:oklch(0.96_0.04_70)] text-[color:oklch(0.45_0.13_70)]",
  "Out of Stock": "bg-[color:oklch(0.94_0.04_254)] text-[color:oklch(0.4_0.14_254)]",
};

function ProductDetail() {
  const { product, related } = Route.useLoaderData() as LoaderData;
  const [active, setActive] = useState(0);
  const gallery = product.gallery ?? [product.image];

  return (
    <SiteLayout>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/40">
        <div className="container-page flex items-center gap-2 py-4 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/products" className="hover:text-foreground">
            Products
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{product.category}</span>
        </div>
      </div>

      {/* Main product */}
      <section className="bg-background py-12 md:py-16">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="relative aspect-4/3 overflow-hidden border border-border bg-muted">
              {gallery[active] ? (
                <img
                  src={gallery[active]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  No image
                </div>
              )}
              <span className="absolute left-4 top-4 inline-flex items-center bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                {product.category}
              </span>
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    className={[
                      "aspect-4/3 overflow-hidden border transition-all",
                      i === active
                        ? "border-secondary ring-2 ring-secondary/30"
                        : "border-border hover:border-secondary/60",
                    ].join(" ")}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              {product.category}
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">{product.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={[
                  "inline-flex items-center px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider",
                  availabilityStyles[product.availability],
                ].join(" ")}
              >
                {product.availability}
              </span>
              {product.sku && (
                <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
              )}
              {product.model && (
                <span className="text-xs text-muted-foreground">Model: {product.model}</span>
              )}
            </div>

            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>

            {/* Quick specs */}
            {product.specs.length > 0 && (
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-border py-5">
                {product.specs.slice(0, 6).map((s) => (
                  <div key={s.label}>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </dt>
                    <dd className="mt-0.5 text-sm font-semibold text-foreground">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/contact">
                  Request a Quote
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline">
                <a
                  href={`mailto:${company.email}?subject=Inquiry: ${encodeURIComponent(product.name)}`}
                >
                  <Mail className="mr-1 h-4 w-4" />
                  Email Sales
                </a>
              </Button>
            </div>

            {(product.brochure || product.datasheet) && (
              <div className="mt-3 flex flex-wrap gap-3">
                {product.brochure && (
                  <Button asChild variant="outline">
                    <a href={product.brochure} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-1 h-4 w-4" />
                      Download Brochure
                    </a>
                  </Button>
                )}
                {product.datasheet && (
                  <Button asChild variant="outline">
                    <a href={product.datasheet} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-1 h-4 w-4" />
                      Download Datasheet
                    </a>
                  </Button>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-secondary" />
                {company.phone}
              </span>
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary" />
                {company.email}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Description + Features */}
      <section className="border-t border-border bg-muted/30 py-14">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold">Product Overview</h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
              {product.description.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <h3 className="mt-10 text-xl font-bold">Key Features</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {product.advantages && product.advantages.length > 0 && (
              <>
                <h3 className="mt-10 text-xl font-bold">Advantages</h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {product.advantages.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <h3 className="mt-10 text-xl font-bold">Applications</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {product.applications.map((a) => (
                <li key={a} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>

            {product.industries && product.industries.length > 0 && (
              <>
                <h3 className="mt-10 text-xl font-bold">Industries Served</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.industries.map((i) => (
                    <span key={i} className="bg-muted px-3 py-1.5 text-sm text-foreground">
                      {i}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Specs card */}
          <aside className="border border-border bg-card p-6">
            <h3 className="text-lg font-bold">Technical Specifications</h3>
            <dl className="mt-4 divide-y divide-border">
              {product.specs.map((s) => (
                <div key={s.label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="text-sm text-muted-foreground">{s.label}</dt>
                  <dd className="text-sm font-semibold text-foreground text-right">{s.value}</dd>
                </div>
              ))}
            </dl>

            <h4 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Standards
            </h4>
            <ul className="mt-2 flex flex-wrap gap-2">
              {product.standards.map((s) => (
                <li
                  key={s}
                  className="inline-flex items-center border border-border bg-background px-2.5 py-1 text-xs font-medium"
                >
                  {s}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-background py-14">
          <div className="container-page">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  Related Products
                </p>
                <h2 className="mt-2 text-2xl font-bold">You may also be interested in</h2>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to catalog
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
