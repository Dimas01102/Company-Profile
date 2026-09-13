import { useEffect, useMemo, useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ImageIcon, Play, X, ZoomIn } from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { galleryAlbums, galleryImages, type GalleryItem } from "@/lib/mock-data";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Project Gallery — PT Batam Konektra Jaya" },
      {
        name: "description",
        content:
          "Selected works: substations, manufacturing, and industrial electrification projects across Indonesia.",
      },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [album, setAlbum] = useState<string>("All");
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    if (album === "All") return galleryImages;
    return galleryImages.filter((g) => g.album === album);
  }, [album]);

  const albumCounts = useMemo(() => {
    const counts: Record<string, number> = { All: galleryImages.length };
    for (const g of galleryImages) counts[g.album] = (counts[g.album] ?? 0) + 1;
    return counts;
  }, []);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(
    () => setActive((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length)),
    [filtered.length],
  );
  const next = useCallback(
    () => setActive((i) => (i === null ? null : (i + 1) % filtered.length)),
    [filtered.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, prev, next]);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Project Gallery"
        title="Selected works from the field."
        description="A visual record of our substations, manufacturing operations, and industrial electrification projects."
      />
      <Breadcrumb items={[{ label: "Gallery" }]} />

      <section className="bg-background py-12 md:py-16">
        <div className="container-page">
          {/* Album filter */}
          <div className="mb-8 flex flex-wrap gap-2">
            {galleryAlbums.map((a) => {
              const activeAlbum = a === album;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAlbum(a)}
                  className={[
                    "inline-flex items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors",
                    activeAlbum
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
                  ].join(" ")}
                >
                  {a}
                  <span
                    className={[
                      "inline-flex h-5 min-w-5 items-center justify-center px-1.5 text-[10px] font-bold",
                      activeAlbum
                        ? "bg-white/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    ].join(" ")}
                  >
                    {albumCounts[a] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-none" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed border-border bg-card px-6 py-20 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-muted text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold">No images in this album yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Check back soon.</p>
            </div>
          ) : (
            <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((g, i) => (
                <GalleryTile key={g.id} item={g} onOpen={() => setActive(i)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {active !== null && filtered[active] && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Previous"
            onClick={prev}
            className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={next}
            className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="flex h-full items-center justify-center p-6 md:p-12">
            <figure className="relative max-h-full max-w-6xl">
              <img
                src={filtered[active].src}
                alt={filtered[active].alt}
                className="max-h-[80vh] w-auto object-contain shadow-2xl"
              />
              {filtered[active].isVideo && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-accent/90 text-accent-foreground shadow-lg">
                    <Play className="h-8 w-8 fill-current" />
                  </span>
                </div>
              )}
              <figcaption className="mt-4 flex items-center justify-between gap-4 text-sm text-white/80">
                <span>{filtered[active].alt}</span>
                <span className="text-xs text-white/60">
                  {active + 1} / {filtered.length} • {filtered[active].album}
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}

function GalleryTile({ item, onOpen }: { item: GalleryItem; onOpen: () => void }) {
  const spanCls =
    item.span === "lg" ? "sm:col-span-2 sm:row-span-2" : item.span === "md" ? "row-span-2" : "";
  return (
    <button
      type="button"
      onClick={onOpen}
      className={[
        "group relative overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-accent",
        spanCls,
      ].join(" ")}
    >
      <img
        src={item.src}
        alt={item.alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Icon */}
      <div className="absolute inset-0 grid place-items-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm">
          {item.isVideo ? (
            <Play className="h-5 w-5 fill-current" />
          ) : (
            <ZoomIn className="h-5 w-5" />
          )}
        </span>
      </div>

      {/* Video badge */}
      {item.isVideo && (
        <>
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
            <Play className="h-3 w-3 fill-current" />
            Video
          </span>
          {item.duration && (
            <span className="absolute bottom-2 right-2 rounded-sm bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {item.duration}
            </span>
          )}
        </>
      )}

      {/* Caption on hover */}
      <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 text-left text-xs font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <span className="line-clamp-2">{item.alt}</span>
      </div>
    </button>
  );
}
