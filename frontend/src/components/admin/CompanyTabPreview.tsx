import type { ReactNode } from "react";
import {
  Clock,
  Download,
  ExternalLink,
  Eye,
  Facebook,
  FileText,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Target,
  Youtube,
  Zap,
} from "lucide-react";

import { Panel } from "@/components/admin/ui";
import {
  brandLabel,
  joinAddress,
  mapEmbedFor,
  mapsLinkFor,
  paragraphs,
  parseBusinessHours,
  splitMission,
} from "@/lib/company-display";
import type { CompanyProfile, Milestone } from "@/lib/company-service";

export type PreviewTabId =
  | "general"
  | "story"
  | "vision"
  | "values"
  | "business"
  | "social"
  | "location"
  | "seo"
  | "document"
  | "milestones";

/** URLs for files that may be a just-picked (unsaved) upload. */
export type PreviewAssets = { logo: string; ogImage: string; pdf: string };

type Where = { field: string; page: string; section: string };

const APPEARS_ON: Record<
  PreviewTabId,
  { pages: { label: string; href: string }[]; rows: Where[] }
> = {
  general: {
    pages: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
    ],
    rows: [
      { field: "Company logo", page: "Every page", section: "Header and footer" },
      {
        field: "Company name",
        page: "Every page",
        section: "Header and footer brand text, footer copyright line",
      },
      {
        field: "Tagline",
        page: "Every page",
        section: "Header and footer, under the company name",
      },
      {
        field: "Short description",
        page: "Every page / About",
        section:
          "Footer paragraph (unless Website Settings sets its own footer text) and the About page hero subtitle",
      },
      { field: "Full description", page: "About", section: "Our Story, first paragraphs" },
    ],
  },
  story: {
    pages: [{ label: "About", href: "/about" }],
    rows: [
      { field: "Founded year", page: "About", section: 'Our Story, the "Est." badge on the photo' },
      { field: "Company history", page: "About", section: "Our Story paragraphs" },
      {
        field: "Company background",
        page: "About",
        section: "Our Story paragraphs (after the history)",
      },
    ],
  },
  vision: {
    pages: [{ label: "About", href: "/about" }],
    rows: [
      { field: "Vision statement", page: "About", section: '"Our Vision" card' },
      {
        field: "Mission statement",
        page: "About",
        section: '"Our Mission" card, one bullet per line or per semicolon',
      },
    ],
  },
  values: {
    pages: [{ label: "About", href: "/about" }],
    rows: [
      {
        field: "Core values",
        page: "About",
        section: '"Core Values" grid (the section is hidden while there are no values)',
      },
    ],
  },
  business: {
    pages: [
      { label: "Contact", href: "/contact" },
      { label: "About", href: "/about" },
    ],
    rows: [
      {
        field: "Business type, Industry, Business scope",
        page: "About",
        section: "Facts box in Our Story",
      },
      {
        field: "Address, City, Province, Postal code",
        page: "Contact / every page",
        section: "Head Office, Visit Us text, footer contact",
      },
      {
        field: "Phone",
        page: "Contact / every page",
        section: "Call card, Head Office list, footer contact",
      },
      { field: "WhatsApp", page: "Contact", section: "WhatsApp card and chat button" },
      {
        field: "Email",
        page: "Contact / every page",
        section: "Email card, Head Office list, footer contact",
      },
      {
        field: "Business hours",
        page: "Contact",
        section: '"Business Hours" card, one row per line',
      },
    ],
  },
  social: {
    pages: [{ label: "Home", href: "/" }],
    rows: [
      {
        field: "Facebook, Instagram, LinkedIn, YouTube",
        page: "Every page",
        section: "Round icons in the footer. An empty field hides its icon",
      },
    ],
  },
  location: {
    pages: [{ label: "Contact", href: "/contact" }],
    rows: [
      { field: "Google Maps link", page: "Contact", section: '"Visit Us" map' },
      {
        field: "Latitude, Longitude",
        page: "Contact",
        section: 'Map pin and the "Open in Google Maps" button',
      },
    ],
  },
  seo: {
    pages: [{ label: "Home", href: "/" }],
    rows: [
      {
        field: "Meta title",
        page: "Home",
        section: "Browser tab title and the Google result title",
      },
      {
        field: "Meta description",
        page: "Home / default",
        section:
          "Google result text. Also the default for pages that have no description of their own",
      },
      { field: "Keywords", page: "Every page", section: 'Hidden <meta name="keywords"> tag' },
      {
        field: "Open Graph image",
        page: "Every page without its own image",
        section: "Preview picture when a link is shared on WhatsApp, Facebook or LinkedIn",
      },
    ],
  },
  document: {
    pages: [{ label: "About", href: "/about" }],
    rows: [
      {
        field: "Company profile PDF",
        page: "About",
        section: '"Download Company Profile (PDF)" button in Our Story',
      },
    ],
  },
  milestones: {
    pages: [{ label: "About", href: "/about" }],
    rows: [{ field: "Milestones (active only)", page: "About", section: "Company timeline" }],
  },
};

/** "Where this appears on the website" box shown at the top of every tab. */
export function AppearsOn({ tab }: { tab: PreviewTabId }) {
  const info = APPEARS_ON[tab];
  return (
    <div className="border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-primary">Where this appears on the website</h3>
        <div className="flex flex-wrap gap-2">
          {info.pages.map((p) => (
            <a
              key={p.href}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open {p.label} page
            </a>
          ))}
        </div>
      </div>
      <ul className="divide-y divide-border text-sm">
        {info.rows.map((r) => (
          <li
            key={r.field}
            className="grid gap-1 px-5 py-2.5 md:grid-cols-[14rem_9rem_1fr] md:gap-4"
          >
            <span className="font-medium text-foreground">{r.field}</span>
            <span className="text-muted-foreground">{r.page}</span>
            <span className="text-muted-foreground">{r.section}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview blocks. Each one mirrors the markup/logic of the public page.
// ---------------------------------------------------------------------------

function Block({ title, page, children }: { title: string; page: string; children: ReactNode }) {
  return (
    <div className="border border-border bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/50 px-4 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <span className="text-[11px] text-muted-foreground">{page}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <span className="text-sm italic text-muted-foreground">{children}</span>;
}

function Logo({ src, name, dark }: { src: string; name: string; dark?: boolean }) {
  return src ? (
    <img src={src} alt={name} className="h-9 w-auto max-w-28 object-contain" />
  ) : (
    <span
      className={`grid h-9 w-9 place-items-center rounded-sm ${
        dark ? "bg-white/10 text-white" : "bg-primary text-primary-foreground"
      }`}
    >
      <Zap className="h-5 w-5" strokeWidth={2.5} />
    </span>
  );
}

function HeaderPreview({ form, assets }: { form: CompanyProfile; assets: PreviewAssets }) {
  return (
    <Block title="Header" page="Every page">
      <div className="flex items-center gap-2.5 border border-border bg-white px-4 py-3">
        <Logo src={assets.logo} name={form.name} />
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[15px] font-bold uppercase tracking-tight text-primary">
            {brandLabel(form.name) || "Company name"}
          </span>
          <span className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {form.tagline || "Tagline"}
          </span>
        </span>
      </div>
    </Block>
  );
}

function FooterPreview({ form, assets }: { form: CompanyProfile; assets: PreviewAssets }) {
  return (
    <Block title="Footer" page="Every page">
      <div className="bg-primary p-5 text-primary-foreground">
        <div className="flex items-center gap-2.5">
          <Logo src={assets.logo} name={form.name} dark />
          <div className="leading-tight">
            <div className="text-base font-bold uppercase tracking-tight">
              {brandLabel(form.name) || "Company name"}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">
              {form.tagline || "Tagline"}
            </div>
          </div>
        </div>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
          {form.shortDescription || "Short description"}
        </p>
        <ul className="mt-4 space-y-2 text-sm text-white/80">
          <li className="flex gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{joinAddress(form) || "Address"}</span>
          </li>
          <li className="flex gap-2">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{form.phone || "Phone"}</span>
          </li>
          <li className="flex gap-2">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{form.email || "Email"}</span>
          </li>
        </ul>
        <p className="mt-4 border-t border-white/10 pt-3 text-xs text-white/60">
          © {new Date().getFullYear()} {form.name}. All rights reserved.
        </p>
      </div>
    </Block>
  );
}

function AboutHeroPreview({ form }: { form: CompanyProfile }) {
  return (
    <Block title="About page hero" page="/about">
      <p className="eyebrow">About the Company</p>
      <h4 className="mt-2 text-lg font-bold text-primary">
        Engineering Indonesia's industrial power, one project at a time.
      </h4>
      <p className="mt-2 text-sm text-muted-foreground">
        {form.shortDescription || "Short description"}
      </p>
    </Block>
  );
}

function StoryPreview({ form }: { form: CompanyProfile }) {
  const story = [
    ...paragraphs(form.fullDescription),
    ...paragraphs(form.history),
    ...paragraphs(form.background),
  ];
  const facts: [string, string][] = [
    ["Business type", form.businessType],
    ["Industry", form.industry],
    ["Business scope", form.businessScope],
  ];
  const shownFacts = facts.filter(([, v]) => v);
  return (
    <Block title="Our Story" page="/about">
      <div className="grid gap-5 md:grid-cols-[10rem_1fr]">
        <div className="relative grid aspect-4/3 place-items-center bg-muted text-xs text-muted-foreground">
          Photo
          <div className="absolute -bottom-3 -right-3 bg-accent px-3 py-2">
            <div className="text-base font-bold text-accent-foreground">
              Est. {form.foundedYear || "----"}
            </div>
          </div>
        </div>
        <div>
          <p className="eyebrow">Our Story</p>
          <div className="mt-2 space-y-3 text-sm leading-relaxed text-muted-foreground">
            {story.length > 0 ? (
              story.map((t, i) => <p key={i}>{t}</p>)
            ) : (
              <Empty>No story text yet. The website shows its built-in text.</Empty>
            )}
          </div>
          {shownFacts.length > 0 && (
            <dl className="mt-4 grid gap-3 border border-border bg-card p-4 text-sm">
              {shownFacts.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </Block>
  );
}

function VisionMissionPreview({ form }: { form: CompanyProfile }) {
  const mission = splitMission(form.mission);
  return (
    <Block title="Vision and Mission" page="/about">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="border-t-2 border-accent bg-card p-5">
          <span className="grid h-9 w-9 place-items-center bg-primary text-primary-foreground">
            <Eye className="h-4 w-4" />
          </span>
          <h4 className="mt-4 text-base font-semibold text-foreground">Our Vision</h4>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {form.vision || <Empty>Empty. The website shows its built-in text.</Empty>}
          </p>
        </div>
        <div className="border-t-2 border-accent bg-card p-5">
          <span className="grid h-9 w-9 place-items-center bg-primary text-primary-foreground">
            <Target className="h-4 w-4" />
          </span>
          <h4 className="mt-4 text-base font-semibold text-foreground">Our Mission</h4>
          {mission.length > 0 ? (
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              {mission.map((m) => (
                <li key={m} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-accent" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2">
              <Empty>Empty. The website shows its built-in text.</Empty>
            </p>
          )}
        </div>
      </div>
    </Block>
  );
}

function ValuesPreview({ form }: { form: CompanyProfile }) {
  const values = form.coreValues.slice().sort((a, b) => a.order - b.order);
  return (
    <Block title="Core Values" page="/about">
      {values.length === 0 ? (
        <Empty>No core values. The whole section is hidden on the website.</Empty>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {values.map((v) => (
            <li key={v.id} className="border border-border bg-card p-4">
              <p className="text-sm font-semibold text-primary">{v.name || "Untitled value"}</p>
              <p className="mt-1 text-xs text-muted-foreground">{v.description}</p>
              <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                Icon: {v.icon}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Block>
  );
}

function ContactPreview({ form }: { form: CompanyProfile }) {
  const hours = parseBusinessHours(form.businessHours);
  const rows: [typeof MapPin, string, string][] = [
    [MapPin, "Head Office", joinAddress(form)],
    [Phone, "Phone", form.phone],
    [Phone, "WhatsApp", form.whatsapp],
    [Mail, "Email", form.email],
  ];
  return (
    <Block title="Company information" page="/contact">
      <ul className="space-y-3 text-sm">
        {rows.map(([Icon, label, value]) => (
          <li key={label} className="flex gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </div>
              <div className="text-foreground">{value || <Empty>Not set</Empty>}</div>
            </div>
          </li>
        ))}
      </ul>
      {hours.length > 0 ? (
        <div className="mt-5 border-l-2 border-accent bg-card p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="h-4 w-4 text-secondary" />
            Business Hours
          </div>
          <ul className="mt-3 divide-y divide-border text-sm">
            {hours.map((h, i) => (
              <li key={`${h.day}-${i}`} className="flex items-center justify-between gap-4 py-2">
                <span className="text-muted-foreground">{h.day}</span>
                {h.hours && <span className="font-semibold text-foreground">{h.hours}</span>}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-5">
          <Empty>No business hours. The hours card is hidden on the Contact page.</Empty>
        </p>
      )}
    </Block>
  );
}

function SocialPreview({ form }: { form: CompanyProfile }) {
  const items = [
    { label: "LinkedIn", href: form.linkedin, Icon: Linkedin },
    { label: "Facebook", href: form.facebook, Icon: Facebook },
    { label: "Instagram", href: form.instagram, Icon: Instagram },
    { label: "YouTube", href: form.youtube, Icon: Youtube },
  ].filter((x) => x.href);
  return (
    <Block title="Footer social icons" page="Every page">
      {items.length === 0 ? (
        <Empty>No links. No social icons are shown in the footer.</Empty>
      ) : (
        <div className="bg-primary p-5">
          <div className="flex items-center gap-2">
            {items.map(({ label, Icon }) => (
              <span
                key={label}
                title={label}
                className="grid h-9 w-9 place-items-center rounded-sm border border-white/15 text-white"
              >
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>
      )}
    </Block>
  );
}

function MapPreview({ form }: { form: CompanyProfile }) {
  const src = mapEmbedFor(form.mapEmbed, form.latitude, form.longitude);
  const address = joinAddress(form);
  return (
    <Block title="Visit Us map" page="/contact">
      <p className="text-sm text-muted-foreground">{address || "Address"}</p>
      <div className="mt-3 aspect-video w-full overflow-hidden border border-border bg-muted">
        {src ? (
          <iframe title="Map preview" src={src} loading="lazy" className="h-full w-full border-0" />
        ) : (
          <div className="grid h-full place-items-center p-4 text-center text-sm italic text-muted-foreground">
            No map set. The map section is hidden on the Contact page.
          </div>
        )}
      </div>
      <p className="mt-3 break-all text-xs text-muted-foreground">
        "Open in Google Maps" button opens:{" "}
        <span className="text-secondary">
          {mapsLinkFor(form.latitude, form.longitude, address)}
        </span>
      </p>
    </Block>
  );
}

function SeoPreview({ form, assets }: { form: CompanyProfile; assets: PreviewAssets }) {
  const title =
    form.metaTitle || "PT Batam Konektra Jaya | Industrial Engineering & Power Solutions";
  const description = form.metaDescription || "(built-in default description)";
  return (
    <div className="space-y-4">
      <Block title="Browser tab" page="Home page">
        <div className="inline-flex max-w-full items-center gap-2 border border-border bg-muted px-3 py-1.5 text-xs text-foreground">
          <span className="h-3 w-3 shrink-0 bg-primary" />
          <span className="truncate">{title}</span>
        </div>
      </Block>
      <Block title="Google result" page="Home page">
        <p className="text-base font-medium text-secondary">{title}</p>
        <p className="text-xs text-[oklch(0.5_0.12_145)]">www.batamkonektra.co.id</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {form.keywords && (
          <p className="mt-3 text-xs text-muted-foreground">
            Keywords: <span className="text-foreground">{form.keywords}</span>
          </p>
        )}
      </Block>
      <Block title="Shared link card" page="WhatsApp, Facebook, LinkedIn">
        <div className="max-w-sm overflow-hidden border border-border bg-card">
          <div className="grid aspect-1200/630 place-items-center bg-muted text-xs text-muted-foreground">
            {assets.ogImage ? (
              <img src={assets.ogImage} alt="" className="h-full w-full object-cover" />
            ) : (
              "No Open Graph image"
            )}
          </div>
          <div className="p-3">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </Block>
    </div>
  );
}

function DocumentPreview({ form, assets }: { form: CompanyProfile; assets: PreviewAssets }) {
  return (
    <Block title="Download button" page="/about, Our Story">
      {form.profilePdfName || assets.pdf ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="btn-outline inline-flex text-sm">
            <Download className="h-4 w-4" />
            Download Company Profile (PDF)
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            {form.profilePdfSize}
          </span>
        </div>
      ) : (
        <Empty>No PDF. The download button is hidden on the About page.</Empty>
      )}
    </Block>
  );
}

function TimelinePreview({ milestones }: { milestones: Milestone[] | null }) {
  const active = (milestones ?? []).filter((m) => m.active);
  return (
    <Block title="Company timeline" page="/about">
      {active.length === 0 ? (
        <Empty>No active milestones. The timeline is hidden on the About page.</Empty>
      ) : (
        <ol className="space-y-4 border-l border-border pl-5">
          {active.map((m) => (
            <li key={m.id} className="relative">
              <span className="absolute -left-6.75 top-1.5 h-2.5 w-2.5 bg-accent" />
              <div className="flex gap-3">
                {m.image && (
                  <img
                    src={m.image}
                    alt=""
                    className="h-12 w-16 shrink-0 border border-border object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-bold text-primary">
                    {m.year} | {m.title}
                  </p>
                  <p className="text-sm text-muted-foreground">{m.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Block>
  );
}

/** Live preview panel shown under the form of each tab. Updates as the form changes. */
export function TabPreview({
  tab,
  form,
  milestones,
  assets,
}: {
  tab: PreviewTabId;
  form: CompanyProfile;
  milestones: Milestone[] | null;
  assets: PreviewAssets;
}) {
  let body: ReactNode;
  switch (tab) {
    case "general":
      body = (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <HeaderPreview form={form} assets={assets} />
            <AboutHeroPreview form={form} />
          </div>
          <FooterPreview form={form} assets={assets} />
        </div>
      );
      break;
    case "story":
      body = <StoryPreview form={form} />;
      break;
    case "vision":
      body = <VisionMissionPreview form={form} />;
      break;
    case "values":
      body = <ValuesPreview form={form} />;
      break;
    case "business":
      body = (
        <div className="grid gap-4 lg:grid-cols-2">
          <ContactPreview form={form} />
          <StoryPreview form={{ ...form, fullDescription: "", history: "", background: "" }} />
        </div>
      );
      break;
    case "social":
      body = <SocialPreview form={form} />;
      break;
    case "location":
      body = <MapPreview form={form} />;
      break;
    case "seo":
      body = <SeoPreview form={form} assets={assets} />;
      break;
    case "document":
      body = <DocumentPreview form={form} assets={assets} />;
      break;
    case "milestones":
      body = <TimelinePreview milestones={milestones} />;
      break;
  }
  return (
    <Panel
      title="Live preview"
      description="Updates as you type, before saving. Shows how this tab looks on the website."
    >
      {body}
    </Panel>
  );
}

/** Whole-site preview used by the toolbar "Live preview" button. */
export function FullPreview({
  form,
  milestones,
  assets,
}: {
  form: CompanyProfile;
  milestones: Milestone[] | null;
  assets: PreviewAssets;
}) {
  return (
    <div className="space-y-4 text-sm">
      <HeaderPreview form={form} assets={assets} />
      <AboutHeroPreview form={form} />
      <StoryPreview form={form} />
      <DocumentPreview form={form} assets={assets} />
      <VisionMissionPreview form={form} />
      <ValuesPreview form={form} />
      <TimelinePreview milestones={milestones} />
      <ContactPreview form={form} />
      <MapPreview form={form} />
      <FooterPreview form={form} assets={assets} />
      <SocialPreview form={form} />
      <SeoPreview form={form} assets={assets} />
    </div>
  );
}
