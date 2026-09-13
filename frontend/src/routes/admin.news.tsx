import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  Calendar,
  Eye,
  Loader2,
  Newspaper,
  Pencil,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
  Upload,
  X,
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
import {
  Panel,
  Field,
  TextAreaField,
  SelectField,
  EmptyState,
  ErrorState,
  TableSkeleton,
  StatusPill,
} from "@/components/admin/ui";
import {
  getNewsList,
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  setNewsStatus,
  emptyNewsArticle,
  newsCategories,
  newsStatuses,
  slugify,
  lines,
  formatDate,
  type AdminNewsArticle,
} from "@/lib/news-service";

export const Route = createFileRoute("/admin/news")({
  head: () => ({
    meta: [
      { title: "News — Konektra Admin Console" },
      {
        name: "description",
        content: "Manage news articles published on the PT Batam Konektra Jaya website.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NewsPage,
});

type Draft = Omit<AdminNewsArticle, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};
type SortKey = "date" | "title" | "status";

function NewsPage() {
  const user = useAdminUser();
  const [rows, setRows] = useState<AdminNewsArticle[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminNewsArticle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [preview, setPreview] = useState<AdminNewsArticle | null>(null);

  function load() {
    setLoadError(false);
    setRows(null);
    getNewsList()
      .then(setRows)
      .catch(() => setLoadError(true));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    let list = [...(rows ?? [])];
    const q = query.trim().toLowerCase();
    if (q)
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.author.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q),
      );
    if (categoryFilter !== "All categories")
      list = list.filter((n) => n.category === categoryFilter);
    if (statusFilter !== "All statuses") list = list.filter((n) => n.status === statusFilter);
    if (dateFrom) list = list.filter((n) => n.date >= dateFrom);
    if (dateTo) list = list.filter((n) => n.date <= dateTo);
    list.sort((a, b) => {
      let r = 0;
      if (sortKey === "date") r = new Date(a.date).getTime() - new Date(b.date).getTime();
      else if (sortKey === "title") r = a.title.localeCompare(b.title);
      else r = a.status.localeCompare(b.status);
      return sortAsc ? r : -r;
    });
    return list;
  }, [rows, query, categoryFilter, statusFilter, dateFrom, dateTo, sortKey, sortAsc]);

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

  function openCreate() {
    setErrors({});
    setDraft(emptyNewsArticle());
  }

  function openEdit(article: AdminNewsArticle) {
    setErrors({});
    setDraft({ ...article });
  }

  function validate(d: Draft) {
    const e: Record<string, string> = {};
    if (!d.title.trim()) e.title = "Title is required.";
    if (!d.slug.trim()) e.slug = "Slug is required.";
    else if (!/^[a-z0-9-]+$/.test(d.slug)) e.slug = "Use lowercase letters, numbers, and dashes.";
    else if ((rows ?? []).some((n) => n.slug === d.slug && n.id !== d.id))
      e.slug = "This slug is already used by another article.";
    if (!d.author.trim()) e.author = "Author is required.";
    if (!d.date) e.date = "Publish date is required.";
    if (!d.summary.trim()) e.summary = "Summary is required.";
    if (!d.content.trim()) e.content = "Content is required.";
    return e;
  }

  async function save() {
    if (!draft) return;
    const e = validate(draft);
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    const { id, ...payload } = draft;
    try {
      if (id) {
        const updated = await updateNewsArticle(id, payload);
        setRows((prev) => (prev ?? []).map((n) => (n.id === id ? updated : n)));
        toast.success("Article updated.");
      } else {
        const created = await createNewsArticle(payload);
        setRows((prev) => [created, ...(prev ?? [])]);
        toast.success("Article created.");
      }
      setDraft(null);
    } catch {
      toast.error("Could not save the article. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteNewsArticle(deleteTarget.id);
      setRows((prev) => (prev ?? []).filter((n) => n.id !== deleteTarget.id));
      toast.success("Article deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Could not delete the article.");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleStatus(article: AdminNewsArticle) {
    setBusyId(article.id);
    try {
      const next = article.status === "Published" ? "Draft" : "Published";
      const updated = await setNewsStatus(article.id, next);
      setRows((prev) => (prev ?? []).map((n) => (n.id === article.id ? updated : n)));
      toast.success(next === "Published" ? "Article published." : "Article unpublished.");
    } catch {
      toast.error("Could not change the article status.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AdminHeader
        user={user}
        title="News"
        subtitle="Announcements and updates for the public site"
      />

      <div className="space-y-6 p-5 lg:p-8">
        <Panel padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-primary">News articles</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {(rows ?? []).length} articles ·{" "}
                {(rows ?? []).filter((n) => n.status === "Published").length} published
              </p>
            </div>
            <button type="button" onClick={openCreate} className="btn-primary text-sm">
              <Plus className="h-4 w-4" /> Add article
            </button>
          </div>
        </Panel>

        <Panel padded={false}>
          <div className="grid gap-3 border-b border-border p-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search title, author..."
                className="h-10 w-full border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-secondary"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
            >
              {["All categories", ...newsCategories].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
            >
              {["All statuses", ...newsStatuses].map((s) => (
                <option key={s}>{s}</option>
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

          {rows === null && !loadError && <TableSkeleton rows={6} />}
          {loadError && (
            <div className="p-5">
              <ErrorState message="We could not load the news articles." onRetry={load} />
            </div>
          )}

          {rows !== null && !loadError && filtered.length === 0 && (
            <EmptyState
              title="No articles found"
              description="Adjust your filters or publish a new article."
              action={
                <button type="button" onClick={openCreate} className="btn-primary text-sm">
                  <Plus className="h-4 w-4" /> Add article
                </button>
              }
            />
          )}

          {rows !== null && !loadError && filtered.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSort("title")}
                          className="inline-flex items-center gap-1 uppercase"
                        >
                          Article <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Author</th>
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
                    {pageRows.map((n) => (
                      <tr key={n.id} className="align-middle hover:bg-muted/40">
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1.5 font-medium text-foreground">
                            {n.featured && (
                              <Star className="h-3.5 w-3.5 fill-current text-accent" />
                            )}
                            {n.title}
                          </span>
                          <span className="mt-0.5 block max-w-md truncate text-xs text-muted-foreground">
                            {n.summary}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {n.category}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {n.author}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" /> {formatDate(n.date)}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <StatusPill status={n.status} />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreview(n)}
                              aria-label={`Preview ${n.title}`}
                              className="btn-icon"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStatus(n)}
                              disabled={busyId === n.id}
                              className="btn-outline h-8 px-2.5 text-xs"
                            >
                              {n.status === "Published" ? "Unpublish" : "Publish"}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(n)}
                              aria-label={`Edit ${n.title}`}
                              className="btn-icon"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(n)}
                              aria-label={`Delete ${n.title}`}
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

      {/* Create / edit dialog */}
      <Dialog open={!!draft} onOpenChange={(o) => !o && !saving && setDraft(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit article" : "Add article"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Basic
                </p>
                <Field
                  label="Title"
                  value={draft.title}
                  error={errors.title}
                  onChange={(v) =>
                    setDraft({ ...draft, title: v, slug: draft.id ? draft.slug : slugify(v) })
                  }
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Slug"
                    value={draft.slug}
                    error={errors.slug}
                    hint="Used in the public article URL."
                    onChange={(v) => setDraft({ ...draft, slug: v })}
                  />
                  <SelectField
                    label="Category"
                    value={draft.category}
                    options={newsCategories}
                    onChange={(v) => setDraft({ ...draft, category: v })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field
                    label="Author"
                    value={draft.author}
                    error={errors.author}
                    onChange={(v) => setDraft({ ...draft, author: v })}
                  />
                  <Field
                    label="Publish date"
                    type="date"
                    value={draft.date}
                    error={errors.date}
                    onChange={(v) => setDraft({ ...draft, date: v })}
                  />
                  <Field
                    label="Read time"
                    value={draft.readTime}
                    onChange={(v) => setDraft({ ...draft, readTime: v })}
                  />
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Content
                </p>
                <TextAreaField
                  label="Summary"
                  value={draft.summary}
                  error={errors.summary}
                  rows={2}
                  onChange={(v) => setDraft({ ...draft, summary: v })}
                />
                <TextAreaField
                  label="Full content"
                  value={draft.content}
                  error={errors.content}
                  rows={8}
                  hint="Separate paragraphs with a blank line."
                  onChange={(v) => setDraft({ ...draft, content: v })}
                />
                <Field
                  label="Tags"
                  value={draft.tags}
                  hint="Comma-separated, e.g. Substation, Batam"
                  onChange={(v) => setDraft({ ...draft, tags: v })}
                />
                <div className="flex items-center gap-2">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={draft.featured}
                    onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
                    className="h-4 w-4 border-input"
                  />
                  <label htmlFor="featured" className="text-sm text-foreground">
                    Feature this article on the homepage
                  </label>
                </div>
              </div>

              <div className="space-y-4 border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Media
                </p>
                <div className="border border-dashed border-border bg-muted/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center bg-primary/10 text-xs font-semibold text-primary">
                        IMG
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Thumbnail</p>
                        <p className="text-xs text-muted-foreground">
                          {draft.thumbnail || "JPG or PNG, at least 1200 × 800 px."}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({ ...draft, thumbnail: `${draft.slug || "article"}-cover.jpg` })
                        }
                        className="btn-outline h-9 px-3 text-sm"
                      >
                        <Upload className="h-4 w-4" /> Choose file
                      </button>
                      {draft.thumbnail && (
                        <button
                          type="button"
                          onClick={() => setDraft({ ...draft, thumbnail: "" })}
                          className="btn-outline h-9 px-3 text-sm text-destructive"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <TextAreaField
                  label="Gallery images"
                  value={draft.gallery.join("\n")}
                  rows={2}
                  hint="One filename per line — additional images shown in the article body."
                  onChange={(v) => setDraft({ ...draft, gallery: lines(v) })}
                />
              </div>

              <div className="space-y-4 border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  SEO
                </p>
                <Field
                  label="Meta title"
                  value={draft.metaTitle}
                  onChange={(v) => setDraft({ ...draft, metaTitle: v })}
                />
                <TextAreaField
                  label="Meta description"
                  value={draft.metaDescription}
                  rows={2}
                  onChange={(v) => setDraft({ ...draft, metaDescription: v })}
                />
                <Field
                  label="Meta keywords"
                  value={draft.metaKeywords}
                  onChange={(v) => setDraft({ ...draft, metaKeywords: v })}
                />
              </div>

              <div className="space-y-4 border-t border-border pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Publishing
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="Status"
                    value={draft.status}
                    options={newsStatuses}
                    onChange={(v) =>
                      setDraft({ ...draft, status: v as AdminNewsArticle["status"] })
                    }
                  />
                  <Field
                    label="Scheduled publish (optional)"
                    type="datetime-local"
                    value={draft.scheduledAt}
                    hint="Leave blank to publish immediately when status is set to Published."
                    onChange={(v) => setDraft({ ...draft, scheduledAt: v })}
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  disabled={saving}
                  className="btn-outline text-sm"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="btn-primary text-sm"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview dialog — mirrors the structure a public detail page would use */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle className="sr-only">Article preview</DialogTitle>
          </DialogHeader>
          {preview && (
            <article className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-secondary">
                <Newspaper className="h-3.5 w-3.5" />
                {preview.category}
                <StatusPill status={preview.status} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-primary">{preview.title}</h1>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>{preview.author}</span>
                <span>{formatDate(preview.date)}</span>
                <span>{preview.readTime}</span>
              </div>
              {preview.thumbnail && (
                <div className="flex h-40 items-center justify-center border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
                  {preview.thumbnail}
                </div>
              )}
              <p className="text-sm font-medium text-foreground">{preview.summary}</p>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                {preview.content.split(/\n\n+/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {preview.tags && (
                <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                  {preview.tags.split(",").map((t) => (
                    <span key={t} className="bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              )}
            </article>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && !deleting && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete article?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.title} will be permanently removed from the news list. This cannot be
              undone.
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
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
