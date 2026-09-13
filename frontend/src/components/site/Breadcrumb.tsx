import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export type Crumb = { label: string; to?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <div className="border-b border-border bg-muted/40">
      <div className="container-page flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Link to="/" className="inline-flex items-center gap-1.5 hover:text-foreground">
          <Home className="h-3.5 w-3.5" />
          Home
        </Link>
        {items.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {c.to && i < items.length - 1 ? (
              <Link to={c.to} className="hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className="text-foreground">{c.label}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
