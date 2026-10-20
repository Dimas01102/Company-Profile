import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  Building2,
  Eye,
  Loader2,
  Mail,
  MessageSquare,
  Package,
  Phone,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdminUser } from "@/components/admin/admin-context";
import { Panel, EmptyState, ErrorState, TableSkeleton } from "@/components/admin/ui";
import { formatDate } from "@/lib/catalog-service";
import {
  getInquiries,
  updateInquiryStatus,
  addInternalNote,
  deleteInquiry,
  inquiryStatuses,
  type Inquiry,
  type InquiryStatus,
} from "@/lib/inquiry-service";
import { getErrorMessage } from "@/lib/api-client";

export const Route = createFileRoute("/admin/inquiries")({
  head: () => ({
    meta: [
      { title: "Inquiries Konektra Admin Console" },
      {
        name: "description",
        content: "Manage sales inquiries submitted from the public PT Batam Konektra Jaya website.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InquiriesPage,
});

type SortKey = "date" | "name" | "status";

const statusTone: Record<InquiryStatus, string> = {
  New: "bg-[color:var(--info)]/12 text-[color:oklch(0.45_0.15_255)]",
  Contacted: "bg-muted text-foreground",
  "In Progress": "bg-accent/15 text-[color:oklch(0.5_0.15_70)]",
  Completed: "bg-[color:var(--success)]/12 text-[color:oklch(0.42_0.13_145)]",
  Cancelled: "bg-destructive/10 text-destructive",
};

function StatusBadge({ status }: { status: InquiryStatus }) {
  return (
    <span
      className={`inline-flex px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
        statusTone[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {status}
    </span>
  );
}

function InquiriesPage() {
  const user = useAdminUser();
  const [rows, setRows] = useState<Inquiry[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const [active, setActive] = useState<Inquiry | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteBusy, setNoteBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoadError(false);
    setRows(null);
    getInquiries()
      .then(setRows)
      .catch(() => setLoadError(true));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    let list = [...(rows ?? [])];
    const q = query.trim().toLowerCase();
    if (q)
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.company.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q) ||
          i.subject.toLowerCase().includes(q) ||
          (i.product ?? "").toLowerCase().includes(q),
      );
    if (statusFilter !== "All statuses") list = list.filter((i) => i.status === statusFilter);
    list.sort((a, b) => {
      let r = 0;
      if (sortKey === "date") r = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortKey === "name") r = a.name.localeCompare(b.name);
      else r = a.status.localeCompare(b.status);
      return sortAsc ? r : -r;
    });
    return list;
  }, [rows, query, statusFilter, sortKey, sortAsc]);

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

  function openDetail(inquiry: Inquiry) {
    setNoteText("");
    setActive(inquiry);
  }

  async function changeStatus(status: InquiryStatus) {
    if (!active) return;
    setStatusBusy(true);
    try {
      const updated = await updateInquiryStatus(active.id, status);
      setActive(updated);
      setRows((prev) => (prev ?? []).map((i) => (i.id === updated.id ? updated : i)));
      toast.success(`Status changed to ${status}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not update the status."));
    } finally {
      setStatusBusy(false);
    }
  }

  async function submitNote() {
    if (!active || !noteText.trim()) return;
    setNoteBusy(true);
    try {
      const updated = await addInternalNote(active.id, user.name, noteText.trim());
      setActive(updated);
      setRows((prev) => (prev ?? []).map((i) => (i.id === updated.id ? updated : i)));
      setNoteText("");
      toast.success("Note added.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not add the note."));
    } finally {
      setNoteBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInquiry(deleteTarget.id);
      setRows((prev) => (prev ?? []).filter((i) => i.id !== deleteTarget.id));
      if (active?.id === deleteTarget.id) setActive(null);
      toast.success("Inquiry archived.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not archive the inquiry."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <AdminHeader
        user={user}
        title="Inquiries"
        subtitle="Sales inquiries from the public website"
      />

      <div className="space-y-6 p-5 lg:p-8">
        <details className="border border-border bg-surface" open>
          <summary className="cursor-pointer px-5 py-3 text-sm font-semibold text-primary">
            How inquiries work
          </summary>
          <div className="space-y-3 border-t border-border px-5 py-4 text-sm text-muted-foreground">
            <p>
              A visitor fills in the form on the{" "}
              <a
                href="/contact"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-secondary hover:underline"
              >
                Contact page
              </a>{" "}
              (the "Request a Quote" buttons on product pages lead to the same form). The inquiry is
              saved here with status <strong>New</strong> and the company email receives a
              notification (the visitor email is set as Reply-To, so replying answers the sender
              directly).
            </p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                <strong>New</strong>: just received, nobody has handled it.
              </li>
              <li>
                <strong>Contacted</strong>: sales has replied or called the sender.
              </li>
              <li>
                <strong>In Progress</strong>: quotation or discussion is ongoing.
              </li>
              <li>
                <strong>Completed</strong>: deal done or question answered.{" "}
                <strong>Cancelled</strong>: no longer relevant.
              </li>
            </ol>
            <p>
              Use <strong>Internal notes</strong> to record what was discussed. Notes are only
              visible to admins, never to the sender.
            </p>
            <p>
              Difference from WhatsApp: an inquiry is recorded with its status, the product asked
              about, the history of notes, and who handled it, so nothing is lost and the whole team
              sees the same list. A WhatsApp chat stays on one person's phone, has no status or
              tracking, and cannot be searched or filtered here.
            </p>
          </div>
        </details>
        <Panel padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-primary">Inbox</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {(rows ?? []).length} inquiries ·{" "}
                {(rows ?? []).filter((i) => i.status === "New").length} new
              </p>
            </div>
          </div>
        </Panel>

        <Panel padded={false}>
          <div className="grid gap-3 border-b border-border p-5 sm:grid-cols-[1fr_200px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, company, email, product..."
                className="h-10 w-full border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-secondary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
            >
              {["All statuses", ...inquiryStatuses].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {rows === null && !loadError && <TableSkeleton rows={6} />}
          {loadError && (
            <div className="p-5">
              <ErrorState message="We could not load the inquiries." onRetry={load} />
            </div>
          )}

          {rows !== null && !loadError && filtered.length === 0 && (
            <EmptyState
              title="No inquiries found"
              description="New inquiries submitted from the website will show up here."
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
                          onClick={() => toggleSort("name")}
                          className="inline-flex items-center gap-1 uppercase"
                        >
                          Contact <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-5 py-3">Subject</th>
                      <th className="px-5 py-3">Source</th>
                      <th className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSort("date")}
                          className="inline-flex items-center gap-1 uppercase"
                        >
                          Date <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSort("status")}
                          className="inline-flex items-center gap-1 uppercase"
                        >
                          Status <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pageRows.map((i) => (
                      <tr key={i.id} className="align-middle hover:bg-muted/40">
                        <td className="px-5 py-3">
                          <span className="block font-medium text-foreground">{i.name}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {i.company}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="block max-w-xs truncate text-foreground">
                            {i.subject}
                          </span>
                          {i.product && (
                            <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <Package className="h-3 w-3" /> {i.product}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {i.source}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {formatDate(i.date)}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={i.status} />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openDetail(i)}
                              aria-label={`View inquiry from ${i.name}`}
                              className="btn-icon"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(i)}
                              aria-label={`Archive inquiry from ${i.name}`}
                              className="btn-icon text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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
                    {[8, 15, 30].map((n) => (
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
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPage(idx + 1)}
                      className={`h-9 min-w-9 px-2 text-sm ${
                        current === idx + 1
                          ? "bg-primary text-primary-foreground"
                          : "border border-input text-foreground"
                      }`}
                    >
                      {idx + 1}
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>{active?.subject}</DialogTitle>
          </DialogHeader>
          {active && (
            <div className="space-y-6">
              <div className="grid gap-4 border border-border p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Contact
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{active.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3" /> {active.company}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" /> {active.email}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> {active.phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Details
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Source: {active.source}</p>
                  {active.product && (
                    <p className="text-xs text-muted-foreground">Product: {active.product}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Received: {formatDate(active.date)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Message
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{active.message}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {inquiryStatuses.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={statusBusy}
                      onClick={() => changeStatus(s)}
                      className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                        active.status === s
                          ? statusTone[s]
                          : "border border-input text-muted-foreground hover:border-secondary"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-5">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" /> Internal notes
                </p>
                <div className="mt-3 space-y-3">
                  {active.notes.length === 0 && (
                    <p className="text-xs text-muted-foreground">No internal notes yet.</p>
                  )}
                  {active.notes.map((n) => (
                    <div key={n.id} className="border border-border bg-muted/30 px-3 py-2">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">{n.author}</span>
                        <span>{formatDate(n.date)}</span>
                      </div>
                      <p className="mt-1 text-sm text-foreground">{n.note}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Add an internal note..."
                    className="h-10 flex-1 border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
                  />
                  <button
                    type="button"
                    onClick={submitNote}
                    disabled={noteBusy || !noteText.trim()}
                    className="btn-primary h-10 px-3 text-sm"
                  >
                    {noteBusy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && !deleting && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Archive this inquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              The inquiry from {deleteTarget?.name} will be removed from the active inbox.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={deleting}
              className="rounded-none bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
