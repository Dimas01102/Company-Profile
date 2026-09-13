import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  PackageOpen,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { ProductCard } from "@/components/site/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { productAvailabilities, productBrands, productCategories, products } from "@/lib/mock-data";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Product Catalog — PT Batam Konektra Jaya" },
      {
        name: "description",
        content:
          "Browse our industrial catalog: transformers, switchgear, generators and power distribution equipment.",
      },
    ],
  }),
  component: ProductsPage,
});

type SortKey = "featured" | "name-asc" | "name-desc" | "availability";
const PAGE_SIZE = 8;

function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [brand, setBrand] = useState<string>("All");
  const [availability, setAvailability] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, category, brand, availability, sort]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (brand !== "All" && p.brand !== brand) return false;
      if (availability !== "All" && p.availability !== availability) return false;
      if (
        q &&
        !`${p.name} ${p.shortDescription} ${p.category} ${p.brand}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    switch (sort) {
      case "name-asc":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "availability":
        list = [...list].sort((a, b) => a.availability.localeCompare(b.availability));
        break;
    }
    return list;
  }, [query, category, brand, availability, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const activeFilterCount =
    (category !== "All" ? 1 : 0) +
    (brand !== "All" ? 1 : 0) +
    (availability !== "All" ? 1 : 0) +
    (query ? 1 : 0);

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setBrand("All");
    setAvailability("All");
    setSort("featured");
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Product Catalog"
        title="Industrial power equipment, engineered for reliability."
        description="Explore our full range of transformers, switchgear, generators and power distribution systems — filter by category, brand and availability."
      />
      <Breadcrumb items={[{ label: "Products" }]} />

      <section className="bg-background py-10 md:py-14">
        <div className="container-page grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Sidebar filters (desktop) */}
          <aside className="hidden lg:block">
            <FilterPanel
              query={query}
              setQuery={setQuery}
              category={category}
              setCategory={setCategory}
              brand={brand}
              setBrand={setBrand}
              availability={availability}
              setAvailability={setAvailability}
              onReset={resetFilters}
              activeFilterCount={activeFilterCount}
            />
          </aside>

          {/* Results */}
          <div className="min-w-0">
            {/* Toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div className="text-sm text-muted-foreground">
                {loading ? (
                  <Skeleton className="h-4 w-40" />
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-foreground">{paginated.length}</span> of{" "}
                    <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
                    products
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileFilters(true)}
                  className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm font-medium lg:hidden"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <div className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm">
                  <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                  <label className="sr-only" htmlFor="sort">
                    Sort
                  </label>
                  <select
                    id="sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="bg-transparent text-sm font-medium outline-none"
                  >
                    <option value="featured">Featured</option>
                    <option value="name-asc">Name (A–Z)</option>
                    <option value="name-desc">Name (Z–A)</option>
                    <option value="availability">Availability</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-border bg-card">
                    <Skeleton className="aspect-[4/3] w-full rounded-none" />
                    <div className="space-y-3 p-5">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {paginated.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onChange={(p) => {
                      setPage(p);
                      window.scrollTo({ top: 200, behavior: "smooth" });
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-primary/60" onClick={() => setMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm overflow-y-auto bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="text-base font-bold">Filters</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setMobileFilters(false)}
                className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <FilterPanel
                query={query}
                setQuery={setQuery}
                category={category}
                setCategory={setCategory}
                brand={brand}
                setBrand={setBrand}
                availability={availability}
                setAvailability={setAvailability}
                onReset={resetFilters}
                activeFilterCount={activeFilterCount}
              />
              <button
                type="button"
                onClick={() => setMobileFilters(false)}
                className="btn-primary mt-6 w-full"
              >
                Apply filters
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}

function FilterPanel(props: {
  query: string;
  setQuery: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  brand: string;
  setBrand: (v: string) => void;
  availability: string;
  setAvailability: (v: string) => void;
  onReset: () => void;
  activeFilterCount: number;
}) {
  const {
    query,
    setQuery,
    category,
    setCategory,
    brand,
    setBrand,
    availability,
    setAvailability,
    onReset,
    activeFilterCount,
  } = props;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Search
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </div>
      </div>

      <FilterGroup
        label="Category"
        value={category}
        options={["All", ...productCategories]}
        onChange={setCategory}
      />
      <FilterGroup
        label="Brand"
        value={brand}
        options={["All", ...productBrands]}
        onChange={setBrand}
      />
      <FilterGroup
        label="Availability"
        value={availability}
        options={["All", ...productAvailabilities]}
        onChange={setAvailability}
      />

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex w-full items-center justify-center gap-2 border border-border py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          Clear all filters
        </button>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <ul className="space-y-1">
        {options.map((opt) => {
          const active = opt === value;
          return (
            <li key={opt}>
              <button
                type="button"
                onClick={() => onChange(opt)}
                className={[
                  "flex w-full items-center justify-between border-l-2 px-3 py-2 text-left text-sm transition-colors",
                  active
                    ? "border-accent bg-muted font-semibold text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
                ].join(" ")}
              >
                <span>{opt}</span>
                {active && <span className="text-accent">•</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-border bg-card px-6 py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <PackageOpen className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold">No products match your filters</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Try adjusting your search terms or clearing one of the active filters to see more results.
      </p>
      <button type="button" onClick={onReset} className="btn-outline mt-6">
        Clear all filters
      </button>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="inline-flex h-9 items-center gap-1 border border-border px-3 text-sm font-medium disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={[
            "h-9 min-w-9 border px-3 text-sm font-semibold",
            p === page
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:border-primary",
          ].join(" ")}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="inline-flex h-9 items-center gap-1 border border-border px-3 text-sm font-medium disabled:opacity-40"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
