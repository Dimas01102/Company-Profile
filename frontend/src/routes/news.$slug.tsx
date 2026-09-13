import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, Tag, User } from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { NewsCard } from "@/components/site/NewsCard";
import { Button } from "@/components/ui/button";
import { news, type NewsArticle } from "@/lib/mock-data";

type LoaderData = { article: NewsArticle; related: NewsArticle[] };

export const Route = createFileRoute("/news/$slug")({
  loader: ({ params }): LoaderData => {
    const article = news.find((n) => n.slug === params.slug);
    if (!article) throw notFound();
    const related = news
      .filter((n) => n.id !== article.id && n.category === article.category)
      .slice(0, 3);
    return { article, related };
  },

  head: ({ loaderData }) => {
    const a = loaderData?.article;
    const title = a ? `${a.title} — PT Batam Konektra Jaya` : "News — PT Batam Konektra Jaya";
    const description = a?.excerpt ?? "Company news and project updates.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(a?.image ? [{ property: "og:image", content: a.image }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-page py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">404</p>
        <h1 className="mt-3 text-3xl font-bold">Article not found</h1>
        <p className="mt-3 text-muted-foreground">This article is unavailable or has been moved.</p>
        <Button asChild className="mt-6">
          <Link to="/news">Back to news</Link>
        </Button>
      </div>
    </SiteLayout>
  ),
  component: NewsDetailPage,
});

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function NewsDetailPage() {
  const { article, related } = Route.useLoaderData();
  const paragraphs = article.content?.length ? article.content : [article.excerpt];

  return (
    <SiteLayout>
      <Breadcrumb items={[{ label: "News", to: "/news" }, { label: article.title }]} />

      <article className="container-page py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/news"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to news
          </Link>

          <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-secondary">
            {article.category}
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-primary md:text-4xl">
            {article.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-5 border-b border-border pb-6 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" /> {article.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {formatDate(article.date)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {article.readTime}
            </span>
          </div>

          <div className="mt-8 aspect-[16/9] overflow-hidden bg-muted">
            <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
          </div>

          <div className="prose prose-neutral mt-8 max-w-none text-foreground">
            {paragraphs.map((p, i) => (
              <p key={i} className="mb-4 leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border pt-6">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {article.tags.map((t) => (
                <span key={t} className="bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-border bg-surface py-16 md:py-20">
          <div className="container-page">
            <h2 className="text-2xl font-bold text-primary">Related articles</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
