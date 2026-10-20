import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { NewsArticle } from "@/lib/mock-data";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <article className="group flex flex-col overflow-hidden border border-border bg-card transition-shadow duration-200 hover:shadow-(--shadow-card-hover)">
      <div className="aspect-16/10 overflow-hidden bg-muted">
        {article.image ? (
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold uppercase tracking-wider text-secondary">
            {article.category}
          </span>
          <span className="text-muted-foreground">{formatDate(article.date)}</span>
        </div>
        <h3 className="text-lg font-semibold leading-snug text-foreground">
          <Link to="/news/$slug" params={{ slug: article.slug }} className="hover:text-primary">
            {article.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
        <Link
          to="/news/$slug"
          params={{ slug: article.slug }}
          className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary"
        >
          Read article
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}
