import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  ChevronRight,
  Compass,
  Eye,
  Factory,
  Handshake,
  Lightbulb,
  ShieldCheck,
  Target,
  Users,
  ArrowRight,
} from "lucide-react";

import facilityImage from "@/assets/about-facility.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeader } from "@/components/site/SectionHeader";
import { CountUp } from "@/components/site/CountUp";
import { company, stats, team } from "@/lib/mock-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — PT Batam Konektra Jaya" },
      {
        name: "description",
        content:
          "Learn about PT Batam Konektra Jaya — an Indonesian engineering company with over 20 years of experience delivering transformers, switchgear, and industrial power solutions.",
      },
      { property: "og:title", content: "About PT Batam Konektra Jaya" },
      {
        property: "og:description",
        content:
          "Company history, vision & mission, certifications, and leadership team behind Konektra.",
      },
      { property: "og:image", content: facilityImage },
    ],
  }),
  component: AboutPage,
});

const coreValues = [
  {
    icon: ShieldCheck,
    title: "Integrity",
    description:
      "We deliver what we promise — from technical specifications to project schedules and after-sales commitments.",
  },
  {
    icon: Award,
    title: "Quality",
    description:
      "Every unit is type-tested and factory-inspected against IEC, SPLN, and SNI standards before it leaves our facility.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "We continuously invest in engineering talent, tooling, and technology partnerships to raise the bar of local manufacturing.",
  },
  {
    icon: Handshake,
    title: "Partnership",
    description:
      "We work as an extension of our clients' teams — from utilities and EPCs to industrial and offshore operators.",
  },
];

const milestones = [
  {
    year: "2004",
    title: "Company Founded",
    description:
      "Established in Batam as an electrical engineering workshop serving local industry.",
  },
  {
    year: "2009",
    title: "First Substation Project",
    description:
      "Delivered turnkey 20 kV substation for a heavy manufacturing plant in Kepulauan Riau.",
  },
  {
    year: "2014",
    title: "ISO 9001 Certified",
    description:
      "Achieved ISO 9001 quality management certification across engineering and production.",
  },
  {
    year: "2018",
    title: "Manufacturing Expansion",
    description:
      "Opened expanded panel and busbar production facility inside Kawasan Industri Batamindo.",
  },
  {
    year: "2022",
    title: "European OEM Partnership",
    description:
      "Signed technology transfer agreement for medium-voltage switchgear assembly in Batam.",
  },
  {
    year: "2026",
    title: "500+ Projects Delivered",
    description: "Reached 500 completed industrial projects across Indonesia and Southeast Asia.",
  },
];

const certifications = [
  { code: "ISO 9001:2015", label: "Quality Management System" },
  { code: "IEC 60076", label: "Power Transformers" },
  { code: "IEC 61439-1/2", label: "Low-Voltage Switchgear" },
  { code: "SPLN D3.002", label: "PLN Distribution Standard" },
  { code: "SNI IEC 61439", label: "Indonesian National Standard" },
  { code: "K3 / SMK3", label: "Occupational Safety System" },
];

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="About the Company"
        title="Engineering Indonesia's industrial power, one project at a time."
        description="Since 2004, PT Batam Konektra Jaya has designed, manufactured, and commissioned electrical power equipment for utilities, EPC contractors, and heavy industry across the archipelago."
      />

      {/* ───── Company Story ───── */}
      <section className="bg-background py-20 md:py-28">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative">
            <img
              src={facilityImage}
              alt="Konektra manufacturing facility in Batam"
              width={1280}
              height={960}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute -bottom-6 -right-6 hidden bg-accent px-6 py-5 md:block">
              <div className="text-3xl font-bold text-accent-foreground">
                Est. {company.founded}
              </div>
              <div className="text-xs font-medium uppercase tracking-wider text-accent-foreground/80">
                Batam, Indonesia
              </div>
            </div>
          </div>
          <div>
            <p className="eyebrow">Our Story</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
              Two decades of Indonesian engineering, built on trust.
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                {company.name} was founded in 2004 as a small electrical workshop in Batam, serving
                local manufacturers with switchboards and control panels. Two decades later, we are
                a full-service industrial power engineering company with in-house design,
                manufacturing, testing, and commissioning capabilities.
              </p>
              <p>
                From our headquarters at Kawasan Industri Batamindo, we partner with utilities, oil
                &amp; gas operators, data center developers, and industrial manufacturers across
                Indonesia — delivering equipment that meets the most demanding international
                standards.
              </p>
            </div>
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                "In-house engineering & design",
                "Local manufacturing in Batam",
                "Type-tested to IEC / SPLN / SNI",
                "Nationwide service network",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                  <ChevronRight className="mt-0.5 h-4 w-4 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───── Stats strip ───── */}
      <section className="bg-surface py-16 md:py-20">
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

      {/* ───── Vision & Mission ───── */}
      <section className="bg-background py-20 md:py-28">
        <div className="container-page">
          <SectionHeader
            eyebrow="Vision & Mission"
            title="A clear purpose, guiding every project."
            align="center"
          />
          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
            <div className="border-t-2 border-accent bg-card p-8 md:p-10">
              <span className="grid h-12 w-12 place-items-center bg-primary text-primary-foreground">
                <Eye className="h-5 w-5" />
              </span>
              <h3 className="mt-6 text-xl font-semibold text-foreground">Our Vision</h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                To become Indonesia's most trusted engineering partner for industrial power —
                recognized for technical depth, product reliability, and long-term customer
                relationships.
              </p>
            </div>
            <div className="border-t-2 border-accent bg-card p-8 md:p-10">
              <span className="grid h-12 w-12 place-items-center bg-primary text-primary-foreground">
                <Target className="h-5 w-5" />
              </span>
              <h3 className="mt-6 text-xl font-semibold text-foreground">Our Mission</h3>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                {[
                  "Design and manufacture power equipment that meets international standards.",
                  "Support customers through every stage — from specification to after-sales.",
                  "Develop Indonesian engineering talent through continuous investment.",
                  "Operate responsibly with safety, quality, and integrity at the core.",
                ].map((m) => (
                  <li key={m} className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Core Values ───── */}
      <section className="bg-surface py-20 md:py-28">
        <div className="container-page">
          <SectionHeader
            eyebrow="Core Values"
            title="The principles behind our work."
            description="Four values that shape how we engineer, manufacture, and serve our clients."
            align="center"
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((v) => (
              <div
                key={v.title}
                className="border-t-2 border-accent bg-card p-7 transition-shadow hover:shadow-[var(--shadow-card-hover)]"
              >
                <span className="grid h-12 w-12 place-items-center bg-primary text-primary-foreground">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Milestones / Timeline ───── */}
      <section className="bg-background py-20 md:py-28">
        <div className="container-page">
          <SectionHeader
            eyebrow="Company Milestones"
            title="Two decades of steady growth."
            description="Key moments in the Konektra journey — from workshop origins to a nationwide engineering partner."
            align="center"
          />
          <div className="mx-auto mt-14 max-w-4xl">
            <ol className="relative border-l-2 border-border pl-8">
              {milestones.map((m) => (
                <li key={m.year} className="relative pb-10 last:pb-0">
                  <span className="absolute -left-[41px] top-1 grid h-5 w-5 place-items-center rounded-full border-4 border-background bg-accent" />
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
                    {m.year}
                  </div>
                  <h3 className="mt-1.5 text-lg font-semibold text-foreground">{m.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {m.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───── Facility banner ───── */}
      <section className="relative isolate overflow-hidden bg-primary text-white">
        <img
          src={gallery1}
          alt="Konektra facility"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(105deg, rgb(15 61 99 / 0.92) 0%, rgb(15 61 99 / 0.7) 100%)",
          }}
        />
        <div className="container-page grid gap-10 py-16 md:grid-cols-3 md:py-20">
          {[
            { icon: Factory, title: "12,000 m²", label: "Production facility in Batam" },
            { icon: Users, title: "180+ Staff", label: "Engineers, technicians & operators" },
            { icon: Compass, title: "3 Service Hubs", label: "Batam · Jakarta · Surabaya" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center bg-accent text-accent-foreground">
                <f.icon className="h-6 w-6" />
              </span>
              <div>
                <div className="text-2xl font-bold text-white">{f.title}</div>
                <div className="mt-1 text-sm text-white/70">{f.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Certifications ───── */}
      <section className="bg-surface py-20 md:py-28">
        <div className="container-page">
          <SectionHeader
            eyebrow="Certifications & Standards"
            title="Compliance you can rely on."
            description="Our products and processes are certified to Indonesian and international standards."
            align="center"
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((c) => (
              <div
                key={c.code}
                className="flex items-center gap-4 border border-border bg-card p-5"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center bg-primary/5 text-primary">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-bold text-foreground">{c.code}</div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Leadership Team ───── */}
      <section className="bg-background py-20 md:py-28">
        <div className="container-page">
          <SectionHeader
            eyebrow="Leadership"
            title="Meet our management team"
            description="Decades of combined experience in power engineering, manufacturing, and industrial sales."
            align="center"
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <article key={m.id} className="group bg-card">
                <div className="aspect-[4/5] overflow-hidden bg-muted">
                  <img
                    src={m.photo}
                    alt={m.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="border-x border-b border-border p-5">
                  <h3 className="text-base font-semibold text-foreground">{m.name}</h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-secondary">
                    {m.position}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
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
              Work with Konektra
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white md:text-4xl">
              Let's engineer your next industrial project together.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
              Our engineers are ready to help you specify equipment, review your single-line
              diagram, and prepare a detailed quotation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link to="/contact" className="btn-accent">
              Contact Sales
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/products" className="btn-ghost-light">
              Explore Products
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
