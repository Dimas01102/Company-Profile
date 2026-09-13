import { Link } from "@tanstack/react-router";
import { Linkedin, Mail, MapPin, Phone, Zap } from "lucide-react";
import { company } from "@/lib/mock-data";

const productLinks = [
  { label: "Transformers", to: "/products" },
  { label: "Switchgear", to: "/products" },
  { label: "Generators", to: "/products" },
  { label: "Power Distribution", to: "/products" },
] as const;

const companyLinks = [
  { label: "About Us", to: "/about" },
  { label: "Management Team", to: "/about" },
  { label: "News & Insights", to: "/news" },
  { label: "Project Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-page py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-sm bg-white/10">
                <Zap className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <div className="leading-tight">
                <div className="text-base font-bold tracking-tight">KONEKTRA</div>
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/60">
                  Engineering Solutions
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              {company.description}
            </p>
            <div className="mt-6 flex items-center gap-2">
              <a
                aria-label="LinkedIn"
                href={company.linkedin}
                target="_blank"
                rel="noreferrer"
                className="grid h-9 w-9 place-items-center rounded-sm border border-white/15 transition-colors hover:bg-white/10"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              Products
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              {productLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-white/80 transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
              Company
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              {companyLinks.map((l) => (
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
          <p>
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <p>Designed for industrial power, energy, and manufacturing.</p>
        </div>
      </div>
    </footer>
  );
}
