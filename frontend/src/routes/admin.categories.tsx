import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
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
import { WebsiteLocation } from "@/components/admin/WebsiteLocation";
import { FileImage } from "@/components/admin/FileImage";
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
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategory,
  categoryProductCount,
  emptyCategory,
  categoryIcons,
  slugify,
  type Category,
} from "@/lib/catalog-service";
import { getErrorMessage } from "@/lib/api-client";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Product Categories | Konektra Admin Console" },
      {
        name: "description",
        content: "Manage the product categories shown in the PT Batam Konektra Jaya catalog.",
      },
      { name: "robots", content: "noindex, nofollow" },
      {
        property: "og:title",
        content: "Product Categories, Konektra Admin Console",
      },
      {
        property: "og:description",
        content: "Category management for the industrial catalog.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CategoriesPage,
});

type Draft = Omit<Category, "id" | "productCount"> & { id?: string };
type SortKey = "order" | "name" | "products";

function CategoriesPage() {
  const user = useAdminUser();
  const [rows, setRows] = useState<Category[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [sortKey, setSortKey] = useState<SortKey>("order");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoadError(false);
    setRows(null);
    getCategories()
      .then(setRows)
      .catch(() => setLoadError(true));
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    let list = [...(rows ?? [])];
    const q = query.trim().toLowerCase();
    if (q)
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    if (statusFilter !== "All statuses") list = list.filter((c) => c.status === statusFilter);
    list.sort((a, b) => {
      let r = 0;
      if (sortKey === "order") r = a.order - b.order;
      else if (sortKey === "name") r = a.name.localeCompare(b.name);
      else r = categoryProductCount(a.name) - categoryProductCount(b.name);
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
      setSortAsc(true);
    }
  }

  function openCreate() {
    const nextOrder = (rows ?? []).reduce((m, c) => Math.max(m, c.order), 0) + 1;
    setErrors({});
    setImageFile(null);
    setDraft(emptyCategory(nextOrder));
  }

  function openEdit(category: Category) {
    setErrors({});
    setImageFile(null);
    setDraft({ ...category });
  }

  function validate(d: Draft) {
    const e: Record<string, string> = {};
    if (!d.name.trim()) e.name = "Category name is required.";
    if (!d.slug.trim()) e.slug = "Slug is required.";
    else if (!/^[a-z0-9-]+$/.test(d.slug)) e.slug = "Use lowercase letters, numbers, and dashes.";
    else if ((rows ?? []).some((c) => c.slug === d.slug && c.id !== d.id))
      e.slug = "This slug is already used by another category.";
    if (!d.description.trim()) e.description = "Description is required.";
    if (!Number.isFinite(d.order) || d.order < 1) e.order = "Display order must be 1 or higher.";
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
        const updated = await updateCategory(id, payload, imageFile ?? undefined);
        setRows((prev) => (prev ?? []).map((c) => (c.id === id ? updated : c)));
        toast.success("Category updated.");
      } else {
        const created = await createCategory(payload, imageFile ?? undefined);
        setRows((prev) => [...(prev ?? []), created]);
        toast.success("Category created.");
      }
      setDraft(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save the category. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      setRows((prev) => (prev ?? []).filter((c) => c.id !== deleteTarget.id));
      toast.success("Category deleted.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the category."));
    } finally {
      setDeleting(false);
    }
  }

  async function toggleStatus(category: Category) {
    setBusyId(category.id);
    const { id, ...rest } = category;
    try {
      const updated = await updateCategory(id, {
        ...rest,
        status: category.status === "Active" ? "Inactive" : "Active",
      });
      setRows((prev) => (prev ?? []).map((c) => (c.id === id ? updated : c)));
      toast.success(`Category ${updated.status === "Active" ? "enabled" : "disabled"}.`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not change the category status."));
    } finally {
      setBusyId(null);
    }
  }

  async function move(category: Category, direction: "up" | "down") {
    setBusyId(category.id);
    try {
      const next = await reorderCategory(category.id, direction);
      setRows(next);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not reorder the categories."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <AdminHeader
        user={user}
        title="Categories"
        subtitle="Product groups used across the public catalog"
      />

      <div className="space-y-6 p-5 lg:p-8">
        <WebsiteLocation feature="categories" />
        <Panel padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-primary">Product categories</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {(rows ?? []).length} categories ·{" "}
                {(rows ?? []).filter((c) => c.status === "Active").length} active
              </p>
            </div>
            <button type="button" onClick={openCreate} className="btn-primary text-sm">
              <Plus className="h-4 w-4" /> Add category
            </button>
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
                placeholder="Search name, slug, or description..."
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
              {["All statuses", "Active", "Inactive"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {rows === null && !loadError && <TableSkeleton rows={5} />}
          {loadError && (
            <div className="p-5">
              <ErrorState message="We could not load the categories." onRetry={load} />
            </div>
          )}

          {rows !== null && !loadError && filtered.length === 0 && (
            <EmptyState
              title="No categories found"
              description="Adjust your search or add a new product category."
              action={
                <button type="button" onClick={openCreate} className="btn-primary text-sm">
                  <Plus className="h-4 w-4" /> Add category
                </button>
              }
            />
          )}

          {rows !== null && !loadError && filtered.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-220 text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSort("name")}
                          className="inline-flex items-center gap-1 uppercase"
                        >
                          Category <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-5 py-3">Slug</th>
                      <th className="px-5 py-3">Icon</th>
                      <th className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => toggleSort("products")}
                          className="inline-flex items-center gap-1 uppercase"
                        >
                          Products <ArrowUpDown className="h-3 w-3" />
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
                    {pageRows.map((c) => (
                      <tr key={c.id} className="align-middle hover:bg-muted/40">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {c.image && (
                              <img
                                src={c.image}
                                alt=""
                                className="h-10 w-10 shrink-0 object-cover"
                              />
                            )}
                            <div>
                              <span className="block font-medium text-foreground">{c.name}</span>
                              <span className="mt-0.5 block max-w-md text-xs text-muted-foreground">
                                {c.description}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-muted-foreground">
                          {c.slug}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {c.icon}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {categoryProductCount(c.name)}
                        </td>
                        <td className="px-5 py-3">
                          <StatusPill status={c.status} />
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{c.order}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => move(c, "up")}
                              disabled={busyId === c.id}
                              aria-label={`Move ${c.name} up`}
                              className="btn-icon"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => move(c, "down")}
                              disabled={busyId === c.id}
                              aria-label={`Move ${c.name} down`}
                              className="btn-icon"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleStatus(c)}
                              disabled={busyId === c.id}
                              className="btn-outline h-8 px-2.5 text-xs"
                            >
                              {c.status === "Active" ? "Disable" : "Enable"}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(c)}
                              aria-label={`Edit ${c.name}`}
                              className="btn-icon"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(c)}
                              aria-label={`Delete ${c.name}`}
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
                    {[5, 10, 25].map((n) => (
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit category" : "Add category"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Category name"
                  value={draft.name}
                  error={errors.name}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      name: v,
                      slug: draft.id ? draft.slug : slugify(v),
                    })
                  }
                />
                <Field
                  label="Slug"
                  value={draft.slug}
                  error={errors.slug}
                  hint="Used in the public catalog URL."
                  onChange={(v) => setDraft({ ...draft, slug: v })}
                />
              </div>
              <TextAreaField
                label="Description"
                value={draft.description}
                error={errors.description}
                rows={3}
                onChange={(v) => setDraft({ ...draft, description: v })}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <SelectField
                  label="Icon"
                  value={draft.icon}
                  options={categoryIcons}
                  onChange={(v) => setDraft({ ...draft, icon: v })}
                />
                <Field
                  label="Display order"
                  type="number"
                  value={String(draft.order)}
                  error={errors.order}
                  onChange={(v) => setDraft({ ...draft, order: Number(v) })}
                />
                <SelectField
                  label="Status"
                  value={draft.status}
                  options={["Active", "Inactive"]}
                  onChange={(v) => setDraft({ ...draft, status: v as Category["status"] })}
                />
              </div>

              <div className="border border-dashed border-border bg-muted/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center overflow-hidden bg-primary/10 text-xs font-semibold text-primary">
                      {imageFile ? (
                        <FileImage file={imageFile} className="h-full w-full object-cover" />
                      ) : draft.image ? (
                        <img src={draft.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        "IMG"
                      )}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Category image</p>
                      <p className="text-xs text-muted-foreground">
                        {imageFile?.name || draft.image || "JPG or PNG, at least 1200 × 800 px."}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <label className="btn-outline h-9 cursor-pointer px-3 text-sm">
                      <Upload className="h-4 w-4" /> Choose file
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setImageFile(file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {(imageFile || draft.image) && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setDraft({ ...draft, image: "" });
                        }}
                        className="btn-outline h-9 px-3 text-sm text-destructive"
                      >
                        Remove
                      </button>
                    )}
                  </div>
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

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && !deleting && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} will be removed from the catalog navigation. Products in this
              category stay in the system and can be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
              className="rounded-none bg-destructive text-destructive-foreground"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
