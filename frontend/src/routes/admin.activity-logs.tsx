import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Eye, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdminUser } from "@/components/admin/admin-context";
import { Panel, EmptyState, ErrorState, TableSkeleton } from "@/components/admin/ui";
import { getActivityLogs, activityModules, type ActivityLog } from "@/lib/activity-log-service";

export const Route = createFileRoute("/admin/activity-logs")({
  head: () => ({
    meta: [
      { title: "Activity Logs Konektra Admin Console" },
      {
        name: "description",
        content: "Audit trail of admin actions across the PT Batam Konektra Jaya website.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ActivityLogsPage,
});

type SortKey = "timestamp" | "module" | "action";

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityLogsPage() {
  const user = useAdminUser();
  const [rows, setRows] = useState<ActivityLog[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All modules");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [active, setActive] = useState<ActivityLog | null>(null);

  function load() {
    setLoadError(false);
    setRows(null);
    getActivityLogs()
      .then(setRows)
      .catch(() => setLoadError(true));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    let list = [...(rows ?? [])];
    const q = query.trim().toLowerCase();
    if (q)
      list = list.filter(
        (l) =>
          l.description.toLowerCase().includes(q) ||
          l.affectedData.toLowerCase().includes(q) ||
          l.admin.toLowerCase().includes(q),
      );
    if (moduleFilter !== "All modules") list = list.filter((l) => l.module === moduleFilter);
    if (dateFrom) list = list.filter((l) => l.timestamp.slice(0, 10) >= dateFrom);
    if (dateTo) list = list.filter((l) => l.timestamp.slice(0, 10) <= dateTo);
    list.sort((a, b) => {
      let r = 0;
      if (sortKey === "timestamp")
        r = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      else if (sortKey === "module") r = a.module.localeCompare(b.module);
      else r = a.action.localeCompare(b.action);
      return sortAsc ? r : -r;
    });
    return list;
  }, [rows, query, moduleFilter, dateFrom, dateTo, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice((current - 1) * perPage, current * perPage);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  return (
    <>
      <AdminHeader
        user={user}
        title="Activity Logs"
        subtitle="Audit trail of admin console actions"
      />

      <div className="space-y-6 p-5 lg:p-8">
        <Panel padded={false}>
          <div className="grid gap-3 border-b border-border p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search description, admin..."
                className="h-10 w-full border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-secondary"
              />
            </div>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
            >
              {["All modules", ...activityModules].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
              aria-label="From date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
              aria-label="To date"
            />
          </div>

          {rows === null && !loadError && <TableSkeleton rows={7} />}
          {loadError && (
            <div className="p-5">
              <ErrorState message="We could not load the activity logs." onRetry={load} />
            </div>
          )}

          {rows !== null && !loadError && filtered.length === 0 && (
            <EmptyState
              title="No activity found"
              description="Actions taken in the admin console will appear here."
            />
          )}

          {rows !== null && !loadError && filtered.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-240 text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSort("timestamp")}
                          className="inline-flex items-center gap-1 uppercase"
                        >
                          Timestamp <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-5 py-3">Admin</th>
                      <th className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSort("action")}
                          className="inline-flex items-center gap-1 uppercase"
                        >
                          Action <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSort("module")}
                          className="inline-flex items-center gap-1 uppercase"
                        >
                          Module <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pageRows.map((l) => (
                      <tr key={l.id} className="align-middle hover:bg-muted/40">
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {formatTimestamp(l.timestamp)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-foreground">{l.admin}</td>
                        <td className="whitespace-nowrap px-5 py-3">
                          <span className="bg-muted px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground">
                            {l.action}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {l.module}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          <span className="block max-w-sm truncate">{l.description}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setActive(l)}
                            aria-label="View log details"
                            className="btn-icon"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Rows per page</span>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className="h-9 border border-input bg-background px-2 text-sm outline-none focus:border-secondary"
                  >
                    {[10, 25, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span>
                    · {(current - 1) * perPage + 1}–{Math.min(current * perPage, filtered.length)}{" "}
                    of {filtered.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage(current - 1)}
                    disabled={current === 1}
                    className="btn-outline h-9 px-3 text-sm"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(i + 1)}
                      className={`h-9 min-w-9 px-2 text-sm ${
                        current === i + 1
                          ? "bg-primary text-primary-foreground"
                          : "border border-input text-foreground"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage(current + 1)}
                    disabled={current === totalPages}
                    className="btn-outline h-9 px-3 text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </Panel>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-md rounded-none">
          <DialogHeader>
            <DialogTitle>Log details</DialogTitle>
          </DialogHeader>
          {active && (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Timestamp
                </dt>
                <dd className="mt-0.5 text-foreground">{formatTimestamp(active.timestamp)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin
                </dt>
                <dd className="mt-0.5 text-foreground">{active.admin}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Action / Module
                </dt>
                <dd className="mt-0.5 text-foreground">
                  {active.action} · {active.module}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </dt>
                <dd className="mt-0.5 text-foreground">{active.description}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Affected data
                </dt>
                <dd className="mt-0.5 text-foreground">{active.affectedData}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </dt>
                <dd className="mt-0.5 text-foreground">{active.status}</dd>
              </div>
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
