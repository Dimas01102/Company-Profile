import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Newspaper,
  Search,
  Tag,
  User,
} from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { NewsCard } from "@/components/site/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { news, newsCategories } from "@/lib/mock-data";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News & Insights — PT Batam Konektra Jaya" },
      {
        name: "description",
        content: "Project milestones, industry updates, and company announcements from Konektra.",
      },
    ],
  }),
  component: NewsPage,
});

const PAGE_SIZE = 6;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function NewsPage() {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, category]);

  const featured = news.find((a) => a.featured) ?? news[0];
  const rest = news.filter((a) => a.id !== featured.id);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rest.filter((a) => {
      if (category !== "All" && a.category !== category) return false;
      if (q && !`${a.title} ${a.excerpt} ${a.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [query, category, rest]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Sidebar data
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of newsCategories) counts[c] = 0;
    counts["All"] = news.length;
    for (const a of news) counts[a.category] = (counts[a.category] ?? 0) + 1;
    return counts;
  }, []);

  const tagCloud = useMemo(() => {
    const set = new Set<string>();
    for (const a of news) for (const t of a.tags ?? []) set.add(t);
    return Array.from(set);
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="News & Insights"
        title="Project milestones, technology and company updates."
        description="Stay informed on Konektra's latest project deliveries, technology launches, and industry perspectives."
      />
      <Breadcrumb items={[{ label: "News" }]} />

      {/* Featured */}
      {!loading && featured && (
        <section className="bg-background pt-12 md:pt-16">
          <div className="container-page">
            <p className="eyebrow">Featured Story</p>
            <Link
              to="/news"
              className="mt-4 grid gap-6 border border-border bg-card transition-shadow hover:shadow-[var(--shadow-card-hover)] md:grid-cols-[1.2fr_1fr]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted md:aspect-auto">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-4 top-4 inline-flex items-center bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                  Featured
                </span>
              </div>
              <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider text-secondary">
                    {featured.category}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(featured.date)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {featured.readTime}
                  </span>
                </div>
                <h2 className="text-2xl font-bold leading-tight md:text-3xl">{featured.title}</h2>
                <p className="text-muted-foreground">{featured.excerpt}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  Read the story
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="bg-background py-12 md:py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_320px]">
          {/* Main list */}
          <div className="min-w-0">
            {/* Toolbar */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <h2 className="text-xl font-bold">Latest Articles</h2>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles…"
                  className="w-full border border-input bg-background py-2.5 pl-9 pr-3 text-sm outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="mb-8 flex flex-wrap gap-2">
              {newsCategories.map((c) => {
                const active = c === category;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={[
                      "inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
                    ].join(" ")}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border border-border bg-card">
                    <Skeleton className="aspect-[16/10] w-full rounded-none" />
                    <div className="space-y-3 p-6">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center border border-dashed border-border bg-card px-6 py-20 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
                  <Newspaper className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold">No articles found</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  We couldn't find articles matching your search. Try a different keyword or
                  category.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory("All");
                  }}
                  className="btn-outline mt-6"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {paginated.map((a) => (
                    <NewsCard key={a.id} article={a} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <nav className="mt-10 flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex h-9 items-center gap-1 border border-border px-3 text-sm font-medium disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={[
                          "h-9 min-w-9 border px-3 text-sm font-semibold",
                          p === currentPage
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-foreground hover:border-primary",
                        ].join(" ")}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="inline-flex h-9 items-center gap-1 border border-border px-3 text-sm font-medium disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="border border-border bg-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Categories
              </h3>
              <ul className="mt-4 space-y-1">
                {newsCategories.map((c) => (
                  <li key={c}>
                    <button
                      type="button"
                      onClick={() => setCategory(c)}
                      className={[
                        "flex w-full items-center justify-between border-l-2 px-3 py-2 text-left text-sm transition-colors",
                        c === category
                          ? "border-accent bg-muted font-semibold text-primary"
                          : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
                      ].join(" ")}
                    >
                      <span>{c}</span>
                      <span className="text-xs text-muted-foreground">
                        {categoryCounts[c] ?? 0}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-border bg-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Recent Posts
              </h3>
              <ul className="mt-4 space-y-4">
                {news.slice(0, 4).map((a) => (
                  <li key={a.id} className="flex gap-3">
                    <img
                      src={a.image}
                      alt=""
                      className="h-16 w-20 shrink-0 object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                        {a.title}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <User className="h-3 w-3" />
                        {a.author}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-border bg-card p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                Popular Tags
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {tagCloud.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-secondary hover:text-secondary"
                  >
                    <Tag className="h-3 w-3" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="border border-border bg-primary p-6 text-primary-foreground">
              <h3 className="text-lg font-bold">Newsletter</h3>
              <p className="mt-2 text-sm text-white/75">
                Get monthly updates on projects and industrial power insights.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="mt-4 flex flex-col gap-2">
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-accent focus:outline-none"
                />
                <button type="submit" className="btn-accent">
                  Subscribe
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
