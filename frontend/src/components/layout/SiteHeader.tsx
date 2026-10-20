import { Link } from "@tanstack/react-router";
import { Menu, Search, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { brandLabel } from "@/lib/company-display";
import { getPublicCompany } from "@/lib/public-data";

const nav = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Products", to: "/products" },
  { label: "News", to: "/news" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
] as const;

type Props = { transparentOnTop?: boolean };

export function SiteHeader({ transparentOnTop = false }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [logo, setLogo] = useState("");
  const [brand, setBrand] = useState({ name: "KONEKTRA", tagline: "Engineering Solutions" });

  // Company logo uploaded in Admin > Company Profile.
  useEffect(() => {
    getPublicCompany()
      .then((c) => {
        setLogo(c.logo);
        setBrand((prev) => ({
          name: c.name ? brandLabel(c.name) : prev.name,
          tagline: c.tagline || prev.tagline,
        }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isTransparent = transparentOnTop && !scrolled && !open;

  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-200",
        isTransparent
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80 shadow-[0_1px_0_0_var(--color-border)]",
      ].join(" ")}
    >
      <div className="container-page flex h-16 items-center justify-between md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          {logo ? (
            <img src={logo} alt="Company logo" className="h-9 w-auto max-w-28 object-contain" />
          ) : (
            <span
              className={[
                "grid h-9 w-9 place-items-center rounded-sm",
                isTransparent ? "bg-white/15 text-white" : "bg-primary text-primary-foreground",
              ].join(" ")}
            >
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </span>
          )}
          <span className="flex flex-col leading-tight">
            <span
              className={[
                "max-w-44 truncate text-[15px] font-bold uppercase tracking-tight sm:max-w-64",
                isTransparent ? "text-white" : "text-primary",
              ].join(" ")}
            >
              {brand.name}
            </span>
            <span
              className={[
                "max-w-44 truncate text-[10px] font-medium uppercase tracking-[0.18em] sm:max-w-64",
                isTransparent ? "text-white/70" : "text-muted-foreground",
              ].join(" ")}
            >
              {brand.tagline}
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "after:scale-x-100" }}
              className={[
                "relative px-3 py-2 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:scale-x-0 after:bg-accent after:transition-transform",
                isTransparent
                  ? "text-white/90 hover:text-white"
                  : "text-foreground hover:text-primary",
              ].join(" ")}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/products"
            aria-label="Search products"
            className={[
              "grid h-10 w-10 place-items-center rounded-md transition-colors",
              isTransparent ? "text-white hover:bg-white/10" : "text-foreground hover:bg-muted",
            ].join(" ")}
          >
            <Search className="h-4.5 w-4.5" />
          </Link>
          <Link to="/contact" className={isTransparent ? "btn-ghost-light" : "btn-accent"}>
            Contact Sales
          </Link>
        </div>

        {/* Mobile trigger */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className={[
            "grid h-10 w-10 place-items-center rounded-md lg:hidden",
            isTransparent ? "text-white" : "text-foreground",
          ].join(" ")}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-border bg-white lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="border-b border-border py-3 text-sm font-medium text-foreground last:border-b-0"
              >
                {n.label}
              </Link>
            ))}
            <Link to="/contact" onClick={() => setOpen(false)} className="btn-accent mt-4">
              Contact Sales
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
