import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Download, FileText, Mail, MessageSquare, ShieldCheck } from "lucide-react";
import { computeAvailability, lines, type AdminProduct } from "@/lib/catalog-service";

function AvailabilityBadge({ value }: { value: string }) {
  const tone =
    value === "Available"
      ? "bg-[color:var(--success)]/12 text-[color:oklch(0.42_0.13_145)]"
      : value === "Limited Stock"
        ? "bg-accent/15 text-accent-foreground"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${tone}`}
    >
      {value}
    </span>
  );
}

export function ProductPreview({
  product,
  related,
}: {
  product: Omit<AdminProduct, "id"> & { id?: string };
  related: AdminProduct[];
}) {
  const gallery = [product.mainImage, ...product.gallery].filter(Boolean);
  const [active, setActive] = useState(0);
  const availability = computeAvailability(product.stock, product.minStock);
  const quickSpecs = product.specs.filter((s) => s.label && s.value).slice(0, 4);

  return (
    <div className="space-y-8">
      <p className="text-xs text-muted-foreground">
        Home / Products / {product.category} /{" "}
        <span className="text-foreground">{product.name || "Untitled product"}</span>
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="flex aspect-4/3 w-full items-center justify-center overflow-hidden border border-border bg-muted">
            {gallery[active] ? (
              <img
                src={gallery[active]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                No image uploaded
              </span>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2">
              {gallery.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-16 w-16 overflow-hidden border ${
                    i === active ? "border-secondary" : "border-border"
                  }`}
                >
                  <img src={g} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
              {product.category}
            </span>
            <AvailabilityBadge value={availability} />
            {product.status !== "Published" && (
              <span className="bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {product.status} — not visible publicly
              </span>
            )}
          </div>
          <h1 className="mt-4 text-2xl font-bold text-primary lg:text-3xl">
            {product.name || "Untitled product"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>

          <dl className="mt-6 grid gap-x-6 gap-y-3 border-y border-border py-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Brand</dt>
              <dd className="mt-1 font-medium text-foreground">{product.brand}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Model</dt>
              <dd className="mt-1 font-medium text-foreground">{product.model || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">SKU</dt>
              <dd className="mt-1 font-medium text-foreground">{product.sku || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Product code
              </dt>
              <dd className="mt-1 font-medium text-foreground">{product.productCode || "—"}</dd>
            </div>
          </dl>

          {quickSpecs.length > 0 && (
            <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
              {quickSpecs.map((s) => (
                <li key={s.label} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  <span className="text-muted-foreground">
                    <strong className="font-medium text-foreground">{s.label}:</strong> {s.value}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => toast.info("This is a preview — actions are disabled here.")}
              className="btn-primary text-sm"
            >
              <MessageSquare className="h-4 w-4" /> Request inquiry
            </button>
            <button
              type="button"
              onClick={() => toast.info("This is a preview — actions are disabled here.")}
              className="btn-outline text-sm"
            >
              <Mail className="h-4 w-4" /> Contact sales
            </button>
          </div>
        </div>
      </div>

      {product.description && (
        <section>
          <h2 className="text-lg font-bold text-primary">Product description</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
            {product.description.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {product.specs.some((s) => s.label && s.value) && (
        <section>
          <h2 className="text-lg font-bold text-primary">Technical specifications</h2>
          <div className="mt-3 overflow-hidden border border-border">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border">
                {product.specs
                  .filter((s) => s.label && s.value)
                  .map((s, i) => (
                    <tr key={i} className={i % 2 ? "bg-muted/40" : ""}>
                      <th className="w-1/3 px-4 py-2.5 text-left font-medium text-foreground">
                        {s.label}
                      </th>
                      <td className="px-4 py-2.5 text-muted-foreground">{s.value}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {(
          [
            ["Key features", product.features],
            ["Applications", product.applications],
            ["Advantages", product.advantages],
            ["Industries served", product.industries],
          ] as const
        ).map(([title, value]) =>
          lines(value).length ? (
            <section key={title}>
              <h2 className="text-lg font-bold text-primary">{title}</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {lines(value).map((l) => (
                  <li key={l} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-accent" />
                    {l}
                  </li>
                ))}
              </ul>
            </section>
          ) : null,
        )}
      </div>

      {lines(product.standards).length > 0 && (
        <section className="border border-border bg-muted/40 p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
            <ShieldCheck className="h-4 w-4" /> Standards & compliance
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {lines(product.standards).map((s) => (
              <span
                key={s}
                className="border border-border bg-surface px-2.5 py-1 text-xs text-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {(product.brochure || product.datasheet) && (
        <section className="grid gap-3 sm:grid-cols-2">
          {[
            ["Product brochure", product.brochure],
            ["Technical datasheet", product.datasheet],
          ]
            .filter(([, f]) => f)
            .map(([label, file]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{file}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info("This is a preview — downloads are disabled here.")}
                  className="btn-outline h-9 px-3 text-sm"
                >
                  <Download className="h-4 w-4" /> Download
                </button>
              </div>
            ))}
        </section>
      )}

      {related.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-primary">Related products</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <article key={r.id} className="border border-border">
                <div className="aspect-4/3 overflow-hidden bg-muted">
                  {r.mainImage && (
                    <img src={r.mainImage} alt={r.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {r.category}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{r.name}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
