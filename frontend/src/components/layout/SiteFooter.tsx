import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube, Zap } from "lucide-react";
import { brandLabel } from "@/lib/company-display";
import { company as fallbackCompany } from "@/lib/mock-data";
import {
  getPublicCategories,
  getPublicCompany,
  getPublicSettings,
  type PublicCategory,
  type PublicSettings,
} from "@/lib/public-data";

const companyLinks = [
  { label: "About Us", to: "/about" },
  { label: "Management Team", to: "/about" },
  { label: "News & Insights", to: "/news" },
  { label: "Project Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
] as const;

export function SiteFooter() {
  const [company, setCompany] = useState({
    ...fallbackCompany,
    logo: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  });
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [categories, setCategories] = useState<PublicCategory[]>([]);

  useEffect(() => {
    getPublicCompany()
      .then((c) =>
        setCompany((prev) => ({
          ...prev,
          name: c.name,
          tagline: c.tagline,
          description: c.description,
          address: c.address,
          phone: c.phone,
          email: c.email,
          logo: c.logo,
          facebook: c.facebook,
          instagram: c.instagram,
          linkedin: c.linkedin,
          youtube: c.youtube,
        })),
      )
      .catch(() => {
        // Keep showing the fallback copy if the API call fails.
      });
    getPublicSettings().then(setSettings);
    getPublicCategories().then(setCategories);
  }, []);

  const socials = [
    { label: "LinkedIn", href: company.linkedin, Icon: Linkedin },
    { label: "Facebook", href: company.facebook, Icon: Facebook },
    { label: "Instagram", href: company.instagram, Icon: Instagram },
    { label: "YouTube", href: company.youtube, Icon: Youtube },
  ].filter((x) => x.href);
  const description = settings?.footerDescription || company.description;
  const copyright =
    settings?.copyrightText ||
    `© ${new Date().getFullYear()} ${company.name}. All rights reserved.`;

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="h-10 w-auto max-w-32" />
              ) : (
                <span className="grid h-10 w-10 place-items-center rounded-sm bg-white/10">
                  <Zap className="h-5 w-5" strokeWidth={2.5} />
                </span>
              )}
              <div className="leading-tight">
                <div className="text-base font-bold uppercase tracking-tight">
                  {brandLabel(company.name)}
                </div>
                <div className="max-w-56 text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">
                  {company.tagline}
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">{description}</p>
            <div className="mt-6 flex items-center gap-2">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  aria-label={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-9 w-9 place-items-center rounded-sm border border-white/15 transition-colors hover:bg-white/10"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              Products
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    to="/products"
                    className="text-white/80 transition-colors hover:text-accent"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              {categories.length === 0 && (
                <li>
                  <Link
                    to="/products"
                    className="text-white/80 transition-colors hover:text-accent"
                  >
                    All products
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              Company
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              {settings && settings.footerLinks.length > 0
                ? settings.footerLinks.map((l) => (
                    <li key={l.id}>
                      <a href={l.url} className="text-white/80 transition-colors hover:text-accent">
                        {l.label}
                      </a>
                    </li>
                  ))
                : companyLinks.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="text-white/80 transition-colors hover:text-accent">
                        {l.label}
                      </Link>
                    </li>
                  ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              Get in touch
            </h4>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex gap-3 text-white/80">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{company.address}</span>
              </li>
              <li className="flex gap-3 text-white/80">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="hover:text-white">
                  {company.phone}
                </a>
              </li>
              <li className="flex gap-3 text-white/80">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a href={`mailto:${company.email}`} className="hover:text-white">
                  {company.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-6 text-xs text-white/60 sm:flex-row sm:items-center">
          <p>{copyright}</p>
          <p>Designed for industrial power, energy, and manufacturing.</p>
        </div>
      </div>
    </footer>
  );
}
