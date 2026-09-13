import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowRight,
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
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanner,
  emptyBanner,
  type Banner,
} from "@/lib/banner-service";

export const Route = createFileRoute("/admin/banners")({
  head: () => ({
    meta: [
      { title: "Banners — Konektra Admin Console" },
      {
        name: "description",
        content: "Manage homepage hero banners for the PT Batam Konektra Jaya website.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BannersPage,
});

type Draft = Omit<Banner, "id"> & { id?: string };

function BannersPage() {
  const user = useAdminUser();
  const [rows, setRows] = useState<Banner[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Banner | null>(null);

  function load() {
    setLoadError(false);
    setRows(null);
    getBanners()
      .then(setRows)
      .catch(() => setLoadError(true));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    let list = [...(rows ?? [])].sort((a, b) => a.order - b.order);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((b) => b.title.toLowerCase().includes(q));
    if (statusFilter !== "All statuses") list = list.filter((b) => b.status === statusFilter);
    return list;
  }, [rows, query, statusFilter]);

  function openCreate() {
    const nextOrder = (rows ?? []).reduce((m, b) => Math.max(m, b.order), 0) + 1;
    setErrors({});
    setDraft(emptyBanner(nextOrder));
  }

  function openEdit(banner: Banner) {
    setErrors({});
    setDraft({ ...banner });
  }

  function validate(d: Draft) {
    const e: Record<string, string> = {};
    if (!d.title.trim()) e.title = "Title is required.";
    if (!d.image.trim()) e.image = "An image is required.";
    if (!d.ctaText.trim()) e.ctaText = "CTA text is required.";
    if (!d.ctaUrl.trim()) e.ctaUrl = "CTA URL is required.";
    if (d.endDate && d.startDate && d.endDate < d.startDate)
      e.endDate = "End date must be after the start date.";
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
        const updated = await updateBanner(id, payload);
        setRows((prev) => (prev ?? []).map((b) => (b.id === id ? updated : b)));
        toast.success("Banner updated.");
      } else {
        const created = await createBanner(payload);
        setRows((prev) => [...(prev ?? []), created]);
        toast.success("Banner created.");
      }
      setDraft(null);
    } catch {
      toast.error("Could not save the banner.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBanner(deleteTarget.id);
      setRows((prev) => (prev ?? []).filter((b) => b.id !== deleteTarget.id));
      toast.success("Banner deleted.");
      setDeleteTarget(null);
    } catch {
      toast.error("Could not delete the banner.");
    } finally {
      setDeleting(false);
    }
  }

  async function toggleStatus(banner: Banner) {
    setBusyId(banner.id);
    const { id, ...rest } = banner;
    try {
      const updated = await updateBanner(id, {
        ...rest,
        status: banner.status === "Active" ? "Inactive" : "Active",
      });
      setRows((prev) => (prev ?? []).map((b) => (b.id === id ? updated : b)));
      toast.success(`Banner ${updated.status === "Active" ? "enabled" : "disabled"}.`);
    } catch {
      toast.error("Could not change the banner status.");
    } finally {
      setBusyId(null);
    }
  }

  async function move(banner: Banner, direction: "up" | "down") {
    setBusyId(banner.id);
    try {
      const next = await reorderBanner(banner.id, direction);
      setRows(next);
    } catch {
      toast.error("Could not reorder the banners.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AdminHeader
        user={user}
        title="Banners"
        subtitle="Homepage hero slides and campaign banners"
      />

      <div className="space-y-6 p-5 lg:p-8">
        <Panel padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-primary">Homepage banners</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {(rows ?? []).length} banners ·{" "}
                {(rows ?? []).filter((b) => b.status === "Active").length} active
              </p>
            </div>
            <button type="button" onClick={openCreate} className="btn-primary text-sm">
              <Plus className="h-4 w-4" /> Add banner
            </button>
          </div>
        </Panel>

        <Panel padded={false}>
          <div className="grid gap-3 border-b border-border p-5 sm:grid-cols-[1fr_200px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title..."
                className="h-10 w-full border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-secondary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
            >
              {["All statuses", "Active", "Inactive"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {rows === null && !loadError && <TableSkeleton rows={4} />}
          {loadError && (
            <div className="p-5">
              <ErrorState message="We could not load the banners." onRetry={load} />
            </div>
          )}

          {rows !== null && !loadError && filtered.length === 0 && (
            <EmptyState
              title="No banners found"
              description="Adjust your filters or add a new homepage banner."
              action={
                <button type="button" onClick={openCreate} className="btn-primary text-sm">
                  <Plus className="h-4 w-4" /> Add banner
                </button>
              }
            />
          )}

          {rows !== null && !loadError && filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3">Banner</th>
                    <th className="px-5 py-3">CTA</th>
                    <th className="px-5 py-3">Schedule</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 uppercase">
                        Order <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((b) => (
                    <tr key={b.id} className="align-middle hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <span className="block font-medium text-foreground">{b.title}</span>
                        <span className="mt-0.5 block max-w-xs truncate text-xs text-muted-foreground">
                          {b.subtitle}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          {b.ctaText} <ArrowRight className="h-3 w-3" />
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground">
                        {b.startDate || "—"} → {b.endDate || "No end date"}
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill status={b.status} />
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{b.order}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPreview(b)}
                            aria-label={`Preview ${b.title}`}
                            className="btn-icon"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => move(b, "up")}
                            disabled={busyId === b.id}
                            aria-label={`Move ${b.title} up`}
                            className="btn-icon"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => move(b, "down")}
                            disabled={busyId === b.id}
                            aria-label={`Move ${b.title} down`}
                            className="btn-icon"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStatus(b)}
                            disabled={busyId === b.id}
                            className="btn-outline h-8 px-2.5 text-xs"
                          >
                            {b.status === "Active" ? "Disable" : "Enable"}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(b)}
                            aria-label={`Edit ${b.title}`}
                            className="btn-icon"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(b)}
                            aria-label={`Delete ${b.title}`}
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
          )}
        </Panel>
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && !saving && setDraft(null)}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit banner" : "Add banner"}</DialogTitle>
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
                      <p className="text-sm font-semibold text-foreground">Banner image</p>
                      <p className="text-xs text-muted-foreground">
                        {draft.image || "JPG or PNG, at least 1920 × 800 px."}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, image: `banner-${Date.now()}.jpg` })}
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
                label="Subtitle"
                value={draft.subtitle}
                rows={2}
                onChange={(v) => setDraft({ ...draft, subtitle: v })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="CTA text"
                  value={draft.ctaText}
                  error={errors.ctaText}
                  onChange={(v) => setDraft({ ...draft, ctaText: v })}
                />
                <Field
                  label="CTA URL"
                  value={draft.ctaUrl}
                  error={errors.ctaUrl}
                  onChange={(v) => setDraft({ ...draft, ctaUrl: v })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="Start date"
                  type="date"
                  value={draft.startDate}
                  onChange={(v) => setDraft({ ...draft, startDate: v })}
                />
                <Field
                  label="End date"
                  type="date"
                  value={draft.endDate}
                  error={errors.endDate}
                  hint="Optional — leave blank to run indefinitely."
                  onChange={(v) => setDraft({ ...draft, endDate: v })}
                />
                <SelectField
                  label="Status"
                  value={draft.status}
                  options={["Active", "Inactive"]}
                  onChange={(v) => setDraft({ ...draft, status: v as Banner["status"] })}
                />
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

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-xl rounded-none">
          <DialogHeader>
            <DialogTitle className="sr-only">Banner preview</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="relative flex h-64 flex-col justify-end overflow-hidden border border-border bg-primary p-6 text-primary-foreground">
              <div className="absolute inset-0 flex items-center justify-center text-xs text-primary-foreground/40">
                {preview.image}
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold">{preview.title}</h3>
                <p className="mt-1 max-w-md text-sm text-primary-foreground/80">
                  {preview.subtitle}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
                  {preview.ctaText} <ArrowRight className="h-4 w-4" />
                </span>
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
            <AlertDialogTitle>Delete banner?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.title} will be removed from the homepage rotation.
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
