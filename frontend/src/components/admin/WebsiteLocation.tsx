import { ExternalLink } from "lucide-react";

type Row = { field: string; page: string; section: string };
type PageLink = { href: string; label: string };

const FEATURES = {
  employees: {
    pages: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
    ],
    rows: [
      {
        field: "Photo, Name, Position",
        page: "Home, About",
        section: "Team cards (Home: first 4 active employees, About: all active employees)",
      },
      { field: "Short bio", page: "About", section: "Team card text under the position" },
      {
        field: "Department, Full bio, Responsibilities, Career experience, LinkedIn",
        page: "Home, About",
        section: 'Profile popup that opens from "View profile"',
      },
      { field: "Display order", page: "Home, About", section: "Order of the team cards" },
      { field: "Status: Inactive", page: "None", section: "Hidden from the website" },
      {
        field: "Employee ID, Email, Phone",
        page: "Admin only",
        section: "Never sent to the public website",
      },
    ],
  },
  categories: {
    pages: [{ href: "/products", label: "Products" }],
    rows: [
      {
        field: "Category name",
        page: "Products",
        section: "Category filter buttons and the category label on every product",
      },
      { field: "Display order", page: "Products", section: "Order of the filter buttons" },
      { field: "Status: Inactive", page: "None", section: "Hidden from the filter" },
      {
        field: "Slug, Description, Icon",
        page: "Admin only",
        section: "Used internally, not displayed on the website yet",
      },
    ],
  },
  products: {
    pages: [
      { href: "/products", label: "Products" },
      { href: "/", label: "Home" },
    ],
    rows: [
      {
        field: "Name, Category, Brand, Short description, Main image, Availability",
        page: "Products, Home",
        section: "Product cards (Home shows the first 8 products)",
      },
      {
        field:
          "Gallery, Full description, Features, Advantages, Applications, Industries, Specifications, Standards",
        page: "Product detail",
        section: 'Opens from "View details" (/products/your-slug)',
      },
      {
        field: "SKU, Model, Brochure, Datasheet",
        page: "Product detail",
        section: "SKU and model next to the name, brochure and datasheet download buttons",
      },
      {
        field: "SEO: Meta title, Meta description, Keywords",
        page: "Product detail",
        section: "Browser tab title and search result text (view page source to check)",
      },
      { field: "Status: Draft or Archived", page: "None", section: "Hidden from the website" },
      {
        field: "Stock, Minimum stock, Warehouse",
        page: "Products, Product detail",
        section: "Only turned into the Availability badge, the numbers stay private",
      },
    ],
  },
  news: {
    pages: [
      { href: "/news", label: "News" },
      { href: "/", label: "Home" },
    ],
    rows: [
      {
        field: "Title, Category, Date, Summary, Thumbnail",
        page: "News, Home",
        section: 'Article cards (Home shows the latest 3), "Featured story" block on News',
      },
      {
        field: "Full content, Gallery images, Tags, Author, Read time",
        page: "Article detail",
        section: 'Opens from "Read article" (/news/your-slug)',
      },
      {
        field: "SEO: Meta title, Meta description, Meta keywords",
        page: "Article detail",
        section: "Browser tab title and search result text (view page source to check)",
      },
      {
        field: "Status and Scheduled publish",
        page: "All news pages",
        section: "Visible only when Published and the scheduled time has passed",
      },
    ],
  },
  gallery: {
    pages: [
      { href: "/gallery", label: "Gallery" },
      { href: "/", label: "Home" },
    ],
    rows: [
      {
        field: "Image, Title, Caption",
        page: "Gallery, Home",
        section: "Photo grid and the enlarged viewer (Home shows a short selection)",
      },
      { field: "Album", page: "Gallery", section: "Album filter buttons" },
      { field: "Status: Inactive", page: "None", section: "Hidden from the website" },
    ],
  },
  banners: {
    pages: [{ href: "/", label: "Home" }],
    rows: [
      {
        field: "Image, Title, Subtitle, CTA text, CTA URL",
        page: "Home",
        section: "Hero slider at the top (rotates every 6 seconds when 2 or more banners are live)",
      },
      { field: "Display order", page: "Home", section: "Order of the slides" },
      {
        field: "Start date and End date",
        page: "Home",
        section: "Banner is only shown between these dates",
      },
      {
        field: "Status: Inactive",
        page: "None",
        section: "Hidden. With no live banner the hero uses Settings",
      },
    ],
  },
} satisfies Record<string, { pages: PageLink[]; rows: Row[] }>;

export type WebsiteFeature = keyof typeof FEATURES;

/** "Where this appears on the website" box with links that open the live pages. */
export function WebsiteLocation({
  feature,
  extraPages = [],
}: {
  feature: WebsiteFeature;
  extraPages?: PageLink[];
}) {
  const info = FEATURES[feature];
  return (
    <div className="border border-border bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold text-primary">Where this appears on the website</h3>
        <div className="flex flex-wrap gap-3">
          {[...info.pages, ...extraPages].map((p) => (
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
            className="grid gap-1 px-5 py-2.5 md:grid-cols-[18rem_10rem_1fr] md:gap-4"
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
