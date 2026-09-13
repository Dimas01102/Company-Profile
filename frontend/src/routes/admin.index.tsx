import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Package,
  Users,
  Newspaper,
  Images,
  Inbox,
  Plus,
  ArrowUpRight,
  Building2,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdminUser } from "@/components/admin/admin-context";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchDashboard } from "@/lib/admin-mock-data";
import type { AdminStat } from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Konektra Admin Console" },
      {
        name: "description",
        content:
          "Overview of products, employees, news, gallery items, and customer inquiries for PT Batam Konektra Jaya.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Dashboard — Konektra Admin Console" },
      {
        property: "og:description",
        content: "Administrator overview of website content and inquiries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardHome,
});

const icons = { Package, Users, Newspaper, Images, Inbox };

type Data = Awaited<ReturnType<typeof fetchDashboard>>;

const statusStyles: Record<string, string> = {
  New: "bg-[color:var(--info)]/12 text-[color:var(--info)]",
  "In Review": "bg-accent/15 text-[color:oklch(0.45_0.13_70)]",
  Quoted: "bg-[color:var(--success)]/12 text-[color:oklch(0.42_0.13_145)]",
  Closed: "bg-muted text-muted-foreground",
};

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-border bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
        <h2 className="text-sm font-semibold text-primary">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

function StatCard({ stat }: { stat: AdminStat }) {
  const Icon = icons[stat.icon];
  return (
    <div className="border border-border bg-surface p-5 transition-shadow hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {stat.label}
        </p>
        <span className="flex h-8 w-8 items-center justify-center bg-muted text-secondary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold text-primary">{stat.value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
      <p className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-secondary">
        <TrendingUp className="h-3.5 w-3.5" />
        {stat.delta}
      </p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border border-border bg-surface p-5">
            <Skeleton className="h-3 w-24 rounded-none" />
            <Skeleton className="mt-5 h-8 w-16 rounded-none" />
            <Skeleton className="mt-3 h-3 w-32 rounded-none" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="border border-border bg-surface p-5 lg:col-span-2">
          <Skeleton className="h-4 w-40 rounded-none" />
          <Skeleton className="mt-5 h-64 w-full rounded-none" />
        </div>
        <div className="border border-border bg-surface p-5">
          <Skeleton className="h-4 w-32 rounded-none" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="mt-4 h-10 w-full rounded-none" />
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardHome() {
  const user = useAdminUser();
  const navigate = useNavigate();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    setError(false);
    fetchDashboard()
      .then((d) => alive && setData(d))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  const firstName = user.name.split(" ")[0];

  return (
    <>
      <AdminHeader user={user} title="Dashboard" subtitle="Website content and inquiry overview" />

      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex flex-col gap-4 border-l-2 border-accent bg-surface px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
              Monday, 7 September 2026
            </p>
            <h2 className="mt-1 text-lg font-bold text-primary">Welcome back, {firstName}.</h2>
            <p className="text-sm text-muted-foreground">
              8 inquiries are waiting for a reply and 2 news drafts are unpublished.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn-primary text-sm"
              type="button"
              onClick={() => navigate({ to: "/admin/products" })}
            >
              <Plus className="h-4 w-4" />
              New product
            </button>
            <button
              className="btn-outline text-sm"
              type="button"
              onClick={() => navigate({ to: "/admin/news" })}
            >
              <Newspaper className="h-4 w-4" />
              Write news
            </button>
          </div>
        </div>

        {error ? (
          <div className="border border-destructive/40 bg-destructive/5 px-5 py-8 text-center">
            <p className="text-sm font-semibold text-destructive">
              Dashboard data could not be loaded.
            </p>
            <button
              type="button"
              onClick={() => {
                setError(false);
                fetchDashboard()
                  .then(setData)
                  .catch(() => setError(true));
              }}
              className="btn-outline mt-4 text-sm"
            >
              Try again
            </button>
          </div>
        ) : !data ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {data.stats.map((s) => (
                <StatCard key={s.key} stat={s} />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Panel
                title="Inquiry overview — last 7 months"
                action={
                  <span className="text-xs text-muted-foreground">Inquiries vs. quotations</span>
                }
              >
                <div className="h-72 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.trend} barGap={4}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="var(--border)"
                      />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} width={28} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 0,
                          border: "1px solid var(--border)",
                          fontSize: 12,
                        }}
                      />
                      <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="inquiries" name="Inquiries" fill="var(--primary)" />
                      <Bar dataKey="quotations" name="Quotations" fill="var(--accent)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Panel>

              <Panel title="Recent activity">
                <ul className="divide-y divide-border">
                  {data.activities.map((a) => (
                    <li key={a.id} className="px-5 py-3.5">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{a.actor}</span> {a.action.toLowerCase()}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{a.target}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground/70">
                        {a.at}
                      </p>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>

            <Panel
              title="Latest inquiries"
              action={<span className="text-xs text-muted-foreground">8 awaiting reply</span>}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-2.5 font-semibold">Ref</th>
                      <th className="px-5 py-2.5 font-semibold">Company</th>
                      <th className="px-5 py-2.5 font-semibold">Subject</th>
                      <th className="px-5 py-2.5 font-semibold">Status</th>
                      <th className="px-5 py-2.5 font-semibold">Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.inquiries.map((q) => (
                      <tr key={q.id} className="hover:bg-muted/40">
                        <td className="whitespace-nowrap px-5 py-3 font-semibold text-primary">
                          {q.id}
                        </td>
                        <td className="px-5 py-3">
                          <span className="block font-medium text-foreground">{q.company}</span>
                          <span className="block text-xs text-muted-foreground">{q.contact}</span>
                        </td>
                        <td className="max-w-[280px] px-5 py-3 text-muted-foreground">
                          <span className="line-clamp-1">{q.subject}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusStyles[q.status]}`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground">
                          {q.receivedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <div className="grid gap-6 lg:grid-cols-2">
              <Panel title="Latest products">
                <ul className="divide-y divide-border">
                  {data.products.map((p) => (
                    <li key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-12 w-16 shrink-0 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.category} · {p.brand}
                        </p>
                      </div>
                      <Link
                        to="/products/$slug"
                        params={{ slug: p.slug }}
                        target="_blank"
                        className="text-muted-foreground hover:text-secondary"
                        aria-label={`View ${p.name} on the website`}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel title="Latest news">
                <ul className="divide-y divide-border">
                  {data.news.map((n) => (
                    <li key={n.id} className="px-5 py-3.5">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {n.category} · {n.date} · {n.author}
                      </p>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>

            <Panel title="Quick actions">
              <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Add product", icon: Package, to: "/admin/products" },
                  { label: "Publish news", icon: Newspaper, to: "/admin/news" },
                  { label: "Upload gallery item", icon: Images, to: "/admin/gallery" },
                  { label: "Edit company profile", icon: Building2, to: "/admin/company-profile" },
                ].map(({ label, icon: Icon, to }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate({ to })}
                    className="flex items-center gap-3 border border-border px-4 py-3 text-left text-sm font-medium text-primary hover:border-secondary hover:bg-muted"
                  >
                    <Icon className="h-4 w-4 text-secondary" />
                    {label}
                  </button>
                ))}
              </div>
            </Panel>
          </div>
        )}
      </div>
    </>
  );
}
