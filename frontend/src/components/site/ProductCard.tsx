import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/lib/mock-data";

const availabilityStyles: Record<Product["availability"], string> = {
  Available: "bg-[color:oklch(0.95_0.05_145)] text-[color:oklch(0.4_0.13_145)]",
  "Limited Stock": "bg-[color:oklch(0.96_0.04_70)] text-[color:oklch(0.45_0.13_70)]",
  "Out of Stock": "bg-[color:oklch(0.94_0.04_254)] text-[color:oklch(0.4_0.14_254)]",
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden border border-border bg-card transition-shadow duration-200 hover:shadow-(--shadow-card-hover)">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={1024}
            height={768}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            No image
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
          {product.category}
        </span>
        <span
          className={[
            "absolute right-3 top-3 inline-flex items-center px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
            availabilityStyles[product.availability],
          ].join(" ")}
        >
          {product.availability}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-base font-semibold leading-snug text-foreground">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.shortDescription}</p>
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-secondary transition-colors hover:text-primary"
        >
          View detail
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
