import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
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
  getGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItem,
  emptyGalleryItem,
  galleryAlbums,
  type AdminGalleryItem,
} from "@/lib/gallery-service";

export const Route = createFileRoute("/admin/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Konektra Admin Console" },
      {
        name: "description",
        content: "Manage the photo gallery shown on the public PT Batam Konektra Jaya website.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: GalleryPage,
});

type Draft = Omit<AdminGalleryItem, "id"> & { id?: string };
type SortKey = "order" | "title" | "date";

function GalleryPage() {
  const user = useAdminUser();
  const [rows, setRows] = useState<AdminGalleryItem[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [albumFilter, setAlbumFilter] = useState("All albums");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [sortKey, setSortKey] = useState<SortKey>("order");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminGalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [preview, setPreview] = useState<AdminGalleryItem | null>(null);

  function load() {
    setLoadError(false);
    setRows(null);
    getGalleryItems()
      .then(setRows)
      .catch(() => setLoadError(true));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    let list = [...(rows ?? [])];
    const q = query.trim().toLowerCase();
    if (q)
      list = list.filter(
        (g) => g.title.toLowerCase().includes(q) || g.caption.toLowerCase().includes(q),
      );
    if (albumFilter !== "All albums") list = list.filter((g) => g.album === albumFilter);
    if (statusFilter !== "All statuses") list = list.filter((g) => g.status === statusFilter);
    list.sort((a, b) => {
      let r = 0;
      if (sortKey === "order") r = a.order - b.order;
      else if (sortKey === "title") r = a.title.localeCompare(b.title);
      else r = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortAsc ? r : -r;
    });
    return list;
  }, [rows, query, albumFilter, statusFilter, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice((current - 1) * perPage, current * perPage);

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function openCreate() {
    const nextOrder = (rows ?? []).reduce((m, g) => Math.max(m, g.order), 0) + 1;
    setErrors({});
    setDraft(emptyGalleryItem(nextOrder));
  }

  function openEdit(item: AdminGalleryItem) {
    setErrors({});
    setDraft({ ...item });
  }

  function validate(d: Draft) {
    const e: Record<string, string> = {};
    if (!d.title.trim()) e.title = "Title is required.";
    if (!d.image.trim()) e.image = "An image is required.";
    if (!d.date) e.date = "Date is required.";
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
        const updated = await updateGalleryItem(id, payload);
        setRows((prev) => (prev ?? []).map((g) => (g.id === id ? updated : g)));
        toast.success("Gallery item updated.");
      } else {
        const created = await createGalleryItem(payload);
        setRows((prev) => [...(prev ?? []), created]);
        toast.success("Gallery item added.");
      }
      setDraft(null);
    } catch {
      toast.error("Could not save the gallery item.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteGalleryItem(deleteTarget.id);
      setRows((prev) => (prev ?? []).filter((g) => g.id !== deleteTarget.id));
      toast.success("Gallery item deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Could not delete the gallery item.");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleStatus(item: AdminGalleryItem) {
    setBusyId(item.id);
    const { id, ...rest } = item;
    try {
      const updated = await updateGalleryItem(id, {
        ...rest,
        status: item.status === "Active" ? "Inactive" : "Active",
      });
      setRows((prev) => (prev ?? []).map((g) => (g.id === id ? updated : g)));
      toast.success(`Image ${updated.status === "Active" ? "enabled" : "disabled"}.`);
    } catch {
      toast.error("Could not change the image status.");
    } finally {
      setBusyId(null);
    }
  }

  async function move(item: AdminGalleryItem, direction: "up" | "down") {
    setBusyId(item.id);
    try {
      const next = await reorderGalleryItem(item.id, direction);
      setRows(next);
    } catch {
      toast.error("Could not reorder the gallery.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AdminHeader user={user} title="Gallery" subtitle="Photo albums shown on the public site" />

      <div className="space-y-6 p-5 lg:p-8">
        <Panel padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-primary">Gallery images</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {(rows ?? []).length} images ·{" "}
                {(rows ?? []).filter((g) => g.status === "Active").length} active
              </p>
            </div>
            <button type="button" onClick={openCreate} className="btn-primary text-sm">
              <Plus className="h-4 w-4" /> Add image
            </button>
          </div>
        </Panel>

        <Panel padded={false}>
          <div className="grid gap-3 border-b border-border p-5 sm:grid-cols-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search title or caption..."
                className="h-10 w-full border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-secondary"
              />
            </div>
            <select
              value={albumFilter}
              onChange={(e) => {
                setAlbumFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
            >
              {["All albums", ...galleryAlbums].map((a) => (
                <option key={a}>{a}</option>
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
              {["All statuses", "Active", "Inactive"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {rows === null && !loadError && <TableSkeleton rows={6} />}
          {loadError && (
            <div className="p-5">
              <ErrorState message="We could not load the gallery." onRetry={load} />
            </div>
          )}

          {rows !== null && !loadError && filtered.length === 0 && (
            <EmptyState
              title="No images found"
              description="Adjust your filters or add a new image."
              action={
                <button type="button" onClick={openCreate} className="btn-primary text-sm">
                  <Plus className="h-4 w-4" /> Add image
                </button>
              }
            />
          )}

          {rows !== null && !loadError && filtered.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSort("title")}
                          className="inline-flex items-center gap-1 uppercase"
                        >
                          Image <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-5 py-3">Album</th>
                      <th className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSort("date")}
                          className="inline-flex items-center gap-1 uppercase"
                        >
                          Date <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSort("order")}
                          className="inline-flex items-center gap-1 uppercase"
                        >
                          Order <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pageRows.map((g) => (
                      <tr key={g.id} className="align-middle hover:bg-muted/40">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-muted text-muted-foreground">
                              <ImageIcon className="h-4 w-4" />
                            </span>
                            <div>
                              <span className="block font-medium text-foreground">{g.title}</span>
                              <span className="mt-0.5 block max-w-xs truncate text-xs text-muted-foreground">
                                {g.caption}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {g.album}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {g.date}
                        </td>
                        <td className="px-5 py-3">
                          <StatusPill status={g.status} />
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{g.order}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreview(g)}
                              aria-label={`Preview ${g.title}`}
                              className="btn-icon"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => move(g, "up")}
                              disabled={busyId === g.id}
                              aria-label={`Move ${g.title} up`}
                              className="btn-icon"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => move(g, "down")}
                              disabled={busyId === g.id}
                              aria-label={`Move ${g.title} down`}
                              className="btn-icon"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStatus(g)}
                              disabled={busyId === g.id}
                              className="btn-outline h-8 px-2.5 text-xs"
                            >
                              {g.status === "Active" ? "Disable" : "Enable"}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(g)}
                              aria-label={`Edit ${g.title}`}
                              className="btn-icon"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(g)}
                              aria-label={`Delete ${g.title}`}
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

      <Dialog open={!!draft} onOpenChange={(o) => !o && !saving && setDraft(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit image" : "Add image"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-5">
              <div className="border border-dashed border-border bg-muted/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center bg-primary/10 text-xs font-semibold text-primary">
                      <ImageIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Image file</p>
                      <p className="text-xs text-muted-foreground">
                        {draft.image || "JPG, PNG, or WebP, at least 1600 × 1000 px."}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, image: `gallery-${Date.now()}.jpg` })}
                      className="btn-outline h-9 px-3 text-sm"
                    >
                      <Upload className="h-4 w-4" /> Choose file
                    </button>
                    {draft.image && (
                      <button
                        type="button"
                        onClick={() => setDraft({ ...draft, image: "" })}
                        className="btn-outline h-9 px-3 text-sm text-destructive"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                {errors.image && <p className="mt-2 text-xs text-destructive">{errors.image}</p>}
              </div>
              <Field
                label="Title"
                value={draft.title}
                error={errors.title}
                onChange={(v) => setDraft({ ...draft, title: v })}
              />
              <TextAreaField
                label="Caption"
                value={draft.caption}
                rows={2}
                onChange={(v) => setDraft({ ...draft, caption: v })}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <SelectField
                  label="Album"
                  value={draft.album}
                  options={galleryAlbums}
                  onChange={(v) => setDraft({ ...draft, album: v })}
                />
                <Field
                  label="Date"
                  type="date"
                  value={draft.date}
                  error={errors.date}
                  onChange={(v) => setDraft({ ...draft, date: v })}
                />
                <SelectField
                  label="Status"
                  value={draft.status}
                  options={["Active", "Inactive"]}
                  onChange={(v) => setDraft({ ...draft, status: v as AdminGalleryItem["status"] })}
                />
              </div>
              <Field
                label="Tags"
                value={draft.tags}
                hint="Comma-separated, optional."
                onChange={(v) => setDraft({ ...draft, tags: v })}
              />

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

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-lg rounded-none">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-3">
              <div className="flex h-56 items-center justify-center border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
                {preview.image}
              </div>
              <p className="text-sm text-muted-foreground">{preview.caption}</p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="bg-muted px-2 py-1">{preview.album}</span>
                <span className="bg-muted px-2 py-1">{preview.date}</span>
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
            <AlertDialogTitle>Delete image?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.title} will be permanently removed from the gallery.
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
