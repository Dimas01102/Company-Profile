import { TeamCard } from "@/components/site/TeamCard";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import heroImage from "@/assets/hero-transformer.jpg";
import facilityImage from "@/assets/about-facility.jpg";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CountUp } from "@/components/site/CountUp";
import { ProductCard } from "@/components/site/ProductCard";
import { NewsCard } from "@/components/site/NewsCard";
import { stats, whyChooseUs } from "@/lib/mock-data";
import {
  getPublicBanners,
  getPublicCompany,
  getPublicGallery,
  getPublicNews,
  getPublicProducts,
  getPublicSettings,
  getPublicTeam,
} from "@/lib/public-data";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [company, products, news, galleryImages, team, banners, settings] = await Promise.all([
      getPublicCompany(),
      getPublicProducts(),
      getPublicNews(),
      getPublicGallery(),
      getPublicTeam(),
      getPublicBanners(),
      getPublicSettings(),
    ]);
    return { company, products, news, galleryImages, team, banners, settings };
  },
  // Home page title/description come from Admin > Company Profile > SEO.
  head: ({ loaderData }) => {
    const company = loaderData?.company;
    const title =
      company?.metaTitle || "PT Batam Konektra Jaya | Industrial Engineering & Power Solutions";
    const description =
      company?.metaDescription ||
      "Transformers, switchgear, generators, and turnkey industrial power solutions. Trusted by utilities, EPCs, and manufacturers across Indonesia.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: HomePage,
});

const icons: Record<string, LucideIcon> = { Users, ShieldCheck, Wrench, Truck };

function HomePage() {
  const { company, products, news, galleryImages, team, banners, settings } = Route.useLoaderData();
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (banners.length < 2) return;
    const timer = window.setInterval(() => setSlide((i) => (i + 1) % banners.length), 6000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  // Hero content: the active banner (Admin > Banners) wins; otherwise the
  // hero text from Admin > Settings; otherwise the built-in defaults.
  const banner = banners.length ? banners[slide % banners.length] : null;
  const heroTitle = banner?.title || settings?.heroTitle || "";
  const heroSubtitle =
    (banner ? banner.subtitle : settings?.heroSubtitle) ||
    `${company.name} designs, manufactures, and commissions transformers, switchgear, generators, and turnkey power systems for utilities, EPC contractors, and heavy industry across Indonesia.`;
  const heroCtaText = banner?.ctaText || settings?.heroCtaText || "Explore Products";
  const heroCtaUrl = banner?.ctaUrl || settings?.heroCtaUrl || "/products";
  const show = {
    stats: settings?.showStats ?? true,
    why: settings?.showWhyChooseUs ?? true,
    products: settings?.showFeaturedProducts ?? true,
    news: settings?.showLatestNews ?? true,
    cta: settings?.showFinalCta ?? true,
  };
  const featured = products.slice(0, 8);
  const latestNews = news.slice(0, 3);
  const gallery = galleryImages.slice(0, 8);
  const topTeam = team.slice(0, 4);

  return (
    <SiteLayout transparentHeader>
      {/* ───── SECTION 1 · Hero ───── */}
      <section className="relative isolate min-h-170 overflow-hidden bg-primary text-white md:min-h-190">
        <img
          key={banner?.id ?? "default"}
          src={banner?.image || heroImage}
          alt={banner?.title || "Industrial high-voltage substation at sunset"}
          width={1920}
          height={1280}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(105deg, rgb(15 61 99 / 0.92) 0%, rgb(15 61 99 / 0.72) 45%, rgb(15 61 99 / 0.25) 100%)",
          }}
        />
        <div className="container-page flex min-h-170 flex-col justify-center pt-28 pb-20 md:min-h-190 md:pt-36">
          <div className="max-w-3xl animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Since 2004 · Batam, Indonesia
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] text-white md:text-6xl">
              {heroTitle || (
                <>
                  Professional Engineering Solutions
                  <span className="block text-accent">for Industrial Needs.</span>
                </>
              )}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              {heroSubtitle}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={heroCtaUrl} className="btn-accent">
                {heroCtaText}
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link to="/contact" className="btn-ghost-light">
                Contact Sales
              </Link>
            </div>
            {banners.length > 1 && (
              <div className="mt-8 flex gap-2">
                {banners.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    aria-label={`Show banner ${i + 1}`}
                    onClick={() => setSlide(i)}
                    className={`h-1.5 w-8 transition-colors ${
                      i === slide % banners.length ? "bg-accent" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom indicator strip */}
        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-primary-dark/70 backdrop-blur">
          <div className="container-page grid grid-cols-2 divide-x divide-white/10 md:grid-cols-4">
            {[
              ["IEC", "Certified"],
              ["SNI / SPLN", "Compliant"],
              ["ISO 9001", "Quality System"],
              ["24 / 7", "Service Support"],
            ].map(([primary, secondary]) => (
              <div key={primary} className="px-5 py-5 md:px-8">
                <div className="text-sm font-bold text-white">{primary}</div>
                <div className="text-xs uppercase tracking-wider text-white/55">{secondary}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── SECTION 2 · Company Highlights ───── */}
      {show.stats && (
        <section className="bg-surface py-20 md:py-24">
          <div className="container-page">
            <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-card p-8 md:p-10">
                  <div className="text-4xl font-bold text-primary md:text-5xl">
                    <CountUp end={parseInt(s.value, 10)} suffix={s.suffix} />
                  </div>
                  <p className="mt-3 text-sm leading-snug text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───── SECTION 3 · About Preview ───── */}
      <section className="bg-background py-20 md:py-28">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <img
              src={facilityImage}
              alt="Inside the Konektra manufacturing facility"
              width={1280}
              height={960}
              loading="lazy"
              className="aspect-4/3 w-full object-cover"
            />
            <div className="absolute -bottom-6 -right-6 hidden bg-accent px-6 py-5 md:block">
              <div className="text-3xl font-bold text-accent-foreground">20+ Years</div>
              <div className="text-xs font-medium uppercase tracking-wider text-accent-foreground/80">
                Of Engineering Excellence
              </div>
            </div>
          </div>
          <div>
            <p className="eyebrow">About the Company</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
              An Indonesian engineering company built on technical depth and trust.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              From our headquarters in Batam, we partner with utilities, oil &amp; gas operators,
              data center developers, and industrial manufacturers to deliver reliable power
              equipment and complete substation projects. Every product is engineered, tested, and
              supported by our in-house team.
            </p>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "In-house engineering & testing",
                "Local manufacturing in Batam",
                "Type-tested to IEC / SPLN",
                "Nationwide service network",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <ChevronRight className="mt-0.5 h-4 w-4 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <Link to="/about" className="btn-primary">
                Read more about us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── SECTION 4 · Featured Products ───── */}
      {show.products && featured.length > 0 && (
        <section className="bg-surface py-20 md:py-28">
          <div className="container-page">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <SectionHeader
                eyebrow="Product Catalog"
                title="Featured Industrial Products"
                description="A selection from our portfolio of transformers, switchgear, generators, and power distribution systems."
              />
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                View all products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───── SECTION 5 · Why Choose Us ───── */}
      {show.why && (
        <section className="bg-background py-20 md:py-28">
          <div className="container-page">
            <SectionHeader
              eyebrow="Why Choose Konektra"
              title="Engineering reliability, delivered on schedule."
              description="Four principles guide every project we take on, from design through commissioning."
              align="center"
            />
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {whyChooseUs.map((f) => {
                const Icon = icons[f.icon] ?? ShieldCheck;
                return (
                  <div
                    key={f.title}
                    className="border-t-2 border-accent bg-card p-7 transition-shadow hover:shadow-(--shadow-card-hover)"
                  >
                    <span className="grid h-12 w-12 place-items-center bg-primary text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-foreground">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {f.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ───── SECTION 6 · Management Preview ───── */}
      {topTeam.length > 0 && (
        <section className="bg-surface py-20 md:py-28">
          <div className="container-page">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <SectionHeader
                eyebrow="Leadership"
                title="Meet our management team"
                description="Decades of combined experience in power engineering, manufacturing, and industrial sales."
              />
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                View full team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {topTeam.map((m) => (
                <TeamCard key={m.id} member={m} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───── SECTION 7 · Latest News ───── */}
      {show.news && latestNews.length > 0 && (
        <section className="bg-background py-20 md:py-28">
          <div className="container-page">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <SectionHeader
                eyebrow="News & Insights"
                title="Latest from Konektra"
                description="Project milestones, industry updates, and company announcements."
              />
              <Link
                to="/news"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                All news
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {latestNews.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───── SECTION 8 · Gallery Preview ───── */}
      {gallery.length > 0 && (
        <section className="bg-surface py-20 md:py-28">
          <div className="container-page">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <SectionHeader
                eyebrow="Project Gallery"
                title="Selected works from the field"
                description="Substations, electrification projects, and manufacturing operations."
              />
              <Link
                to="/gallery"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                View gallery
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
              {gallery.map((g) => (
                <div key={g.id} className="group relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={g.src}
                    alt={g.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-primary/0 transition-colors group-hover:bg-primary/30" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───── SECTION 9 · Contact CTA ───── */}
      {show.cta && (
        <section className="relative isolate overflow-hidden bg-primary text-white">
          <div
            className="absolute inset-0 -z-10 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgb(31 106 165 / 0.55), transparent 60%), radial-gradient(circle at 80% 20%, rgb(245 158 11 / 0.25), transparent 55%)",
            }}
          />
          <div className="container-page grid gap-10 py-20 md:grid-cols-[1fr_auto] md:items-center md:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Need engineering solutions?
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-white md:text-4xl">
                Talk to our sales team about your next industrial project.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
                From a single transformer to a full substation, our engineers will help you specify
                the right solution, prepare a quotation, and plan delivery.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link to="/contact" className="btn-accent">
                Contact Sales
              </Link>
              <Link to="/contact" className="btn-ghost-light">
                Send Inquiry
              </Link>
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
