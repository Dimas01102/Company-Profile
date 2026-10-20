import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  Eye,
  FileText,
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
import { ProductPreview } from "@/components/admin/ProductPreview";
import {
  Panel,
  Field,
  TextAreaField,
  SelectField,
  EmptyState,
  ErrorState,
  TableSkeleton,
} from "@/components/admin/ui";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  emptyProduct,
  computeAvailability,
  relatedFor,
  slugify,
  formatDate,
  brands,
  warehouses,
  productStatuses,
  availabilities,
  getCategories,
  type AdminProduct,
} from "@/lib/catalog-service";
import { getErrorMessage } from "@/lib/api-client";

export const Route = createFileRoute("/admin/products")({
  head: () => ({
    meta: [
      { title: "Products | Konektra Admin Console" },
      {
        name: "description",
        content:
          "Manage the industrial product catalog of PT Batam Konektra Jaya: specifications, media, and publication status.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Products | Konektra Admin Console" },
      {
        property: "og:description",
        content: "Industrial product catalog management.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProductsPage,
});

type Draft = Omit<AdminProduct, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};
type SortKey = "updated" | "created" | "name" | "stock";
const sortOptions = [
  "Recently updated",
  "Newest",
  "Oldest",
  "Name A–Z",
  "Name Z–A",
  "Stock",
] as const;

const formSections = [
  "Basic information",
  "Inventory",
  "Specifications",
  "Description",
  "Media",
  "SEO",
  "Related",
] as const;

function AvailabilityBadge({ value }: { value: string }) {
  const tone =
    value === "Available"
      ? "bg-[color:var(--success)]/12 text-[color:oklch(0.42_0.13_145)]"
      : value === "Limited Stock"
        ? "bg-accent/15 text-accent-foreground"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${tone}`}
    >
      {value}
    </span>
  );
}

function StatusBadge({ value }: { value: AdminProduct["status"] }) {
  const tone =
    value === "Published"
      ? "bg-secondary/12 text-secondary"
      : value === "Draft"
        ? "bg-accent/15 text-accent-foreground"
        : "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${tone}`}
    >
      {value}
    </span>
  );
}

function ProductsPage() {
  const user = useAdminUser();
  const [rows, setRows] = useState<AdminProduct[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [brand, setBrand] = useState("All brands");
  const [availability, setAvailability] = useState("All availability");
  const [status, setStatus] = useState("All statuses");
  const [sort, setSort] = useState<(typeof sortOptions)[number]>("Recently updated");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [section, setSection] = useState<(typeof formSections)[number]>("Basic information");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [datasheetFile, setDatasheetFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [removeGalleryIds, setRemoveGalleryIds] = useState<string[]>([]);
  const [preview, setPreview] = useState<Draft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoadError(false);
    setRows(null);
    getProducts()
      .then(setRows)
      .catch(() => setLoadError(true));
    getCategories()
      .then((cats) => setCategoryNames(cats.map((c) => c.name)))
      .catch(() => {
        // Category dropdown just stays empty if this fails; product
        // loading/error state above is unaffected.
      });
  }

  useEffect(load, []);

  const filtered = useMemo(() => {
    let list = [...(rows ?? [])];
    const q = query.trim().toLowerCase();
    if (q)
      list = list.filter((p) =>
        [p.name, p.sku, p.brand, p.model, p.productCode].join(" ").toLowerCase().includes(q),
      );
    if (category !== "All categories") list = list.filter((p) => p.category === category);
    if (brand !== "All brands") list = list.filter((p) => p.brand === brand);
    if (availability !== "All availability")
      list = list.filter((p) => computeAvailability(p.stock, p.minStock) === availability);
    if (status !== "All statuses") list = list.filter((p) => p.status === status);

    const key: Record<(typeof sortOptions)[number], [SortKey, boolean]> = {
      "Recently updated": ["updated", false],
      Newest: ["created", false],
      Oldest: ["created", true],
      "Name A–Z": ["name", true],
      "Name Z–A": ["name", false],
      Stock: ["stock", false],
    };
    const [sortKey, asc] = key[sort];
    list.sort((a, b) => {
      let r = 0;
      if (sortKey === "name") r = a.name.localeCompare(b.name);
      else if (sortKey === "stock") r = a.stock - b.stock;
      else if (sortKey === "created") r = a.createdAt.localeCompare(b.createdAt);
      else r = a.updatedAt.localeCompare(b.updatedAt);
      return asc ? r : -r;
    });
    return list;
  }, [rows, query, category, brand, availability, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice((current - 1) * perPage, current * perPage);

  function resetFileState() {
    setMainImageFile(null);
    setOgImageFile(null);
    setBrochureFile(null);
    setDatasheetFile(null);
    setGalleryFiles([]);
    setRemoveGalleryIds([]);
  }

  function openCreate() {
    setErrors({});
    setSection("Basic information");
    resetFileState();
    setDraft(emptyProduct(categoryNames[0] ?? ""));
  }

  function openEdit(p: AdminProduct) {
    setErrors({});
    setSection("Basic information");
    resetFileState();
    setDraft({
      ...p,
      specs: p.specs.map((s) => ({ ...s })),
      gallery: [...p.gallery],
      galleryIds: [...p.galleryIds],
      relatedIds: [...p.relatedIds],
    });
  }

  function validate(d: Draft) {
    const e: Record<string, string> = {};
    if (!d.name.trim()) e.name = "Product name is required.";
    if (!d.sku.trim()) e.sku = "SKU is required.";
    else if ((rows ?? []).some((p) => p.sku.toLowerCase() === d.sku.toLowerCase() && p.id !== d.id))
      e.sku = "This SKU is already used.";
    if (!d.slug.trim()) e.slug = "Slug is required.";
    else if (!/^[a-z0-9-]+$/.test(d.slug)) e.slug = "Use lowercase letters, numbers, and dashes.";
    else if ((rows ?? []).some((p) => p.slug === d.slug && p.id !== d.id))
      e.slug = "This slug is already used.";
    if (!d.brand.trim()) e.brand = "Brand is required.";
    if (!d.model.trim()) e.model = "Model is required.";
    if (!d.shortDescription.trim()) e.shortDescription = "Short description is required.";
    if (!Number.isFinite(d.stock) || d.stock < 0) e.stock = "Stock cannot be negative.";
    if (!Number.isFinite(d.minStock) || d.minStock < 0)
      e.minStock = "Minimum stock cannot be negative.";
    if (d.status === "Published" && !d.description.trim())
      e.description = "A full description is required before publishing.";
    if (d.status === "Published" && !d.mainImage && !mainImageFile)
      e.mainImage = "A main product image is required before publishing.";
    return e;
  }

  function sectionForError(e: Record<string, string>): (typeof formSections)[number] {
    if (e.description) return "Description";
    if (e.mainImage) return "Media";
    if (e.stock || e.minStock) return "Inventory";
    return "Basic information";
  }

  async function save(thenPreview = false) {
    if (!draft) return;
    const e = validate(draft);
    setErrors(e);
    if (Object.keys(e).length) {
      setSection(sectionForError(e));
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    const { id, ...payload } = draft;
    const files = {
      mainImageFile: mainImageFile ?? undefined,
      ogImageFile: ogImageFile ?? undefined,
      brochureFile: brochureFile ?? undefined,
      datasheetFile: datasheetFile ?? undefined,
      galleryFiles,
      removeGalleryIds,
    };
    try {
      if (id) {
        const updated = await updateProduct(id, payload, files);
        setRows((prev) => (prev ?? []).map((p) => (p.id === id ? updated : p)));
        toast.success("Product updated.");
        if (thenPreview) setPreview(updated);
      } else {
        const created = await createProduct(payload, files);
        setRows((prev) => [created, ...(prev ?? [])]);
        toast.success("Product created.");
        if (thenPreview) setPreview(created);
      }
      setDraft(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save the product. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setRows((prev) => (prev ?? []).filter((p) => p.id !== deleteTarget.id));
      toast.success("Product deleted.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete the product."));
    } finally {
      setDeleting(false);
    }
  }

  function handleGalleryFiles(files: FileList | null) {
    if (!files || !draft) return;
    const list = Array.from(files);
    setGalleryFiles((prev) => [...prev, ...list]);
  }

  const draftAvailability = draft ? computeAvailability(draft.stock, draft.minStock) : "Available";

  return (
    <>
      <AdminHeader
        user={user}
        title="Products"
        subtitle="Industrial catalog for information and inquiries"
      />

      <div className="space-y-6 p-5 lg:p-8">
        <WebsiteLocation feature="products" />
        <Panel padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-primary">Product catalog</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {(rows ?? []).length} products ·{" "}
                {(rows ?? []).filter((p) => p.status === "Published").length} published ·{" "}
                {(rows ?? []).filter((p) => p.stock === 0).length} out of stock
              </p>
            </div>
            <button type="button" onClick={openCreate} className="btn-primary text-sm">
              <Plus className="h-4 w-4" /> Add product
            </button>
          </div>
        </Panel>

        <Panel padded={false}>
          <div className="grid gap-3 border-b border-border p-5 lg:grid-cols-3">
            <div className="relative lg:col-span-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search product name, SKU, brand, or model..."
                className="h-10 w-full border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-secondary"
              />
            </div>
            {(
              [
                [category, setCategory, ["All categories", ...categoryNames]],
                [brand, setBrand, ["All brands", ...brands]],
                [availability, setAvailability, ["All availability", ...availabilities]],
                [status, setStatus, ["All statuses", ...productStatuses]],
                [sort, setSort, sortOptions],
              ] as const
            ).map(([value, setter, options], i) => (
              <select
                key={i}
                value={value}
                onChange={(e) => {
                  (setter as (v: string) => void)(e.target.value);
                  setPage(1);
                }}
                className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
              >
                {options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ))}
          </div>

          {rows === null && !loadError && <TableSkeleton rows={6} />}
          {loadError && (
            <div className="p-5">
              <ErrorState message="We could not load the products." onRetry={load} />
            </div>
          )}

          {rows !== null && !loadError && filtered.length === 0 && (
            <EmptyState
              title="No products found"
              description="Adjust the search or filters, or add a new product to the catalog."
              action={
                <button type="button" onClick={openCreate} className="btn-primary text-sm">
                  <Plus className="h-4 w-4" /> Add product
                </button>
              }
            />
          )}

          {rows !== null && !loadError && filtered.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-270 text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-3">Image</th>
                      <th className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => setSort(sort === "Name A–Z" ? "Name Z–A" : "Name A–Z")}
                          className="inline-flex items-center gap-1 uppercase"
                        >
                          Product <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Brand / Model</th>
                      <th className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => setSort("Stock")}
                          className="inline-flex items-center gap-1 uppercase"
                        >
                          Stock <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-5 py-3">Availability</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Updated</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pageRows.map((p) => (
                      <tr key={p.id} className="align-middle hover:bg-muted/40">
                        <td className="px-5 py-3">
                          <div className="h-10 w-10 overflow-hidden bg-muted">
                            {p.mainImage && (
                              <img
                                src={p.mainImage}
                                alt={p.name}
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="block max-w-xs font-medium text-foreground">
                            {p.name}
                          </span>
                          <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                            {p.sku}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {p.category}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {p.brand}
                          <span className="block text-xs">{p.model}</span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {p.stock}
                          <span className="block text-xs">min {p.minStock}</span>
                        </td>
                        <td className="px-5 py-3">
                          <AvailabilityBadge value={computeAvailability(p.stock, p.minStock)} />
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge value={p.status} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground">
                          {formatDate(p.updatedAt)}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreview(p)}
                              aria-label={`Preview ${p.name}`}
                              className="btn-icon"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(p)}
                              aria-label={`Edit ${p.name}`}
                              className="btn-icon"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(p)}
                              aria-label={`Delete ${p.name}`}
                              className="btn-icon text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

      {/* Add / edit product */}
      <Dialog open={!!draft} onOpenChange={(o) => !o && !saving && setDraft(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit product" : "Add product"}</DialogTitle>
          </DialogHeader>

          {draft && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-1 border-b border-border">
                {formSections.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSection(s)}
                    className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
                      section === s
                        ? "border-secondary text-secondary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {section === "Basic information" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Product name"
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
                      onChange={(v) => setDraft({ ...draft, slug: v })}
                    />
                    <Field
                      label="SKU"
                      value={draft.sku}
                      error={errors.sku}
                      placeholder="BKJ-0000"
                      onChange={(v) => setDraft({ ...draft, sku: v })}
                    />
                    <Field
                      label="Product code"
                      value={draft.productCode}
                      onChange={(v) => setDraft({ ...draft, productCode: v })}
                    />
                    <SelectField
                      label="Category"
                      value={draft.category}
                      options={categoryNames}
                      onChange={(v) => setDraft({ ...draft, category: v })}
                    />
                    <SelectField
                      label="Brand"
                      value={draft.brand}
                      options={brands}
                      onChange={(v) => setDraft({ ...draft, brand: v })}
                    />
                    <Field
                      label="Model"
                      value={draft.model}
                      error={errors.model}
                      onChange={(v) => setDraft({ ...draft, model: v })}
                    />
                  </div>
                  <TextAreaField
                    label="Short description"
                    value={draft.shortDescription}
                    error={errors.shortDescription}
                    rows={3}
                    onChange={(v) => setDraft({ ...draft, shortDescription: v })}
                  />
                </div>
              )}

              {section === "Inventory" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Stock quantity"
                      type="number"
                      value={String(draft.stock)}
                      error={errors.stock}
                      onChange={(v) => setDraft({ ...draft, stock: Number(v) })}
                    />
                    <Field
                      label="Minimum stock"
                      type="number"
                      value={String(draft.minStock)}
                      error={errors.minStock}
                      onChange={(v) => setDraft({ ...draft, minStock: Number(v) })}
                    />
                    <SelectField
                      label="Warehouse"
                      value={draft.warehouse}
                      options={warehouses}
                      onChange={(v) => setDraft({ ...draft, warehouse: v })}
                    />
                    <SelectField
                      label="Status"
                      value={draft.status}
                      options={productStatuses}
                      onChange={(v) =>
                        setDraft({
                          ...draft,
                          status: v as AdminProduct["status"],
                        })
                      }
                    />
                  </div>
                  <div className="border border-border bg-muted/40 p-4 text-sm">
                    <p className="font-semibold text-foreground">
                      Availability shown to visitors:{" "}
                      <AvailabilityBadge value={draftAvailability} />
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Availability follows the stock rule: 0 in stock shows Out of Stock, stock at
                      or below the minimum shows Limited Stock, above the minimum shows Available.
                      Draft and archived products never appear on the public catalog.
                    </p>
                  </div>
                </div>
              )}

              {section === "Specifications" && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Add any specification rows this product needs, different product lines use
                    different technical data.
                  </p>
                  <div className="space-y-2">
                    {draft.specs.map((spec, i) => (
                      <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                        <input
                          value={spec.label}
                          placeholder="Specification name (e.g. Voltage)"
                          onChange={(e) => {
                            const specs = [...draft.specs];
                            specs[i] = { ...specs[i]!, label: e.target.value };
                            setDraft({ ...draft, specs });
                          }}
                          className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
                        />
                        <input
                          value={spec.value}
                          placeholder="Value (e.g. 20 kV / 400 V)"
                          onChange={(e) => {
                            const specs = [...draft.specs];
                            specs[i] = { ...specs[i]!, value: e.target.value };
                            setDraft({ ...draft, specs });
                          }}
                          className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              specs: draft.specs.filter((_, x) => x !== i),
                            })
                          }
                          aria-label="Remove specification"
                          className="btn-icon h-10 w-10 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        specs: [...draft.specs, { label: "", value: "" }],
                      })
                    }
                    className="btn-outline h-9 px-3 text-sm"
                  >
                    <Plus className="h-4 w-4" /> Add specification row
                  </button>
                </div>
              )}

              {section === "Description" && (
                <div className="space-y-4">
                  <TextAreaField
                    label="Full description"
                    value={draft.description}
                    error={errors.description}
                    rows={6}
                    hint="Separate paragraphs with a blank line."
                    onChange={(v) => setDraft({ ...draft, description: v })}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextAreaField
                      label="Features"
                      value={draft.features}
                      rows={5}
                      hint="One feature per line."
                      onChange={(v) => setDraft({ ...draft, features: v })}
                    />
                    <TextAreaField
                      label="Applications"
                      value={draft.applications}
                      rows={5}
                      hint="One application per line."
                      onChange={(v) => setDraft({ ...draft, applications: v })}
                    />
                    <TextAreaField
                      label="Advantages"
                      value={draft.advantages}
                      rows={5}
                      hint="One advantage per line."
                      onChange={(v) => setDraft({ ...draft, advantages: v })}
                    />
                    <TextAreaField
                      label="Industries served"
                      value={draft.industries}
                      rows={5}
                      hint="One industry per line."
                      onChange={(v) => setDraft({ ...draft, industries: v })}
                    />
                  </div>
                  <TextAreaField
                    label="Standards / compliance"
                    value={draft.standards}
                    rows={4}
                    hint="One standard per line, e.g. IEC 60076."
                    onChange={(v) => setDraft({ ...draft, standards: v })}
                  />
                </div>
              )}

              {section === "Media" && (
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) {
                        setMainImageFile(file);
                        setDraft({ ...draft, mainImage: file.name });
                      }
                    }}
                    className={`border border-dashed p-5 ${
                      errors.mainImage ? "border-destructive" : "border-border"
                    } bg-muted/40`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 overflow-hidden bg-primary/10">
                          {mainImageFile ? (
                            <FileImage
                              file={mainImageFile}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            draft.mainImage && (
                              <img
                                src={draft.mainImage}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            )
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Main product image
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {mainImageFile?.name ||
                              draft.mainImage ||
                              "Drag & drop or choose a JPG/PNG, min 1200 × 900 px."}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <label className="btn-outline h-9 cursor-pointer px-3 text-sm">
                          <Upload className="h-4 w-4" />
                          {draft.mainImage ? "Replace" : "Choose file"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setMainImageFile(file);
                                setDraft({ ...draft, mainImage: file.name });
                              }
                              e.target.value = "";
                            }}
                          />
                        </label>
                        {(mainImageFile || draft.mainImage) && (
                          <button
                            type="button"
                            onClick={() => {
                              setMainImageFile(null);
                              setDraft({ ...draft, mainImage: "" });
                            }}
                            className="btn-outline h-9 px-3 text-sm text-destructive"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    {errors.mainImage && (
                      <p className="mt-2 text-xs text-destructive">{errors.mainImage}</p>
                    )}
                  </div>

                  <div className="border border-dashed border-border bg-muted/40 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Image gallery</p>
                        <p className="text-xs text-muted-foreground">
                          {draft.gallery.length - removeGalleryIds.length + galleryFiles.length}{" "}
                          additional images. New images are uploaded when you press Save.
                        </p>
                      </div>
                      <label className="btn-outline h-9 cursor-pointer px-3 text-sm">
                        <Upload className="h-4 w-4" />
                        Add images
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            handleGalleryFiles(e.target.files);
                            // Reset so the same files can be chosen again.
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                    {draft.gallery.length + galleryFiles.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-3">
                        {draft.gallery.map((url, i) =>
                          removeGalleryIds.includes(draft.galleryIds[i]) ? null : (
                            <div
                              key={draft.galleryIds[i]}
                              className="relative h-20 w-24 overflow-hidden border border-border bg-muted"
                            >
                              <img src={url} alt="" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() =>
                                  setRemoveGalleryIds((prev) => [...prev, draft.galleryIds[i]])
                                }
                                aria-label="Remove image"
                                className="absolute right-0 top-0 bg-destructive p-1 text-destructive-foreground"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ),
                        )}
                        {galleryFiles.map((file, i) => (
                          <div
                            key={`${file.name}-${file.size}-${i}`}
                            className="relative h-20 w-24 overflow-hidden border border-dashed border-secondary bg-muted"
                            title="New image"
                          >
                            <FileImage file={file} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() =>
                                setGalleryFiles((prev) => prev.filter((_, x) => x !== i))
                              }
                              aria-label="Remove new image"
                              className="absolute right-0 top-0 bg-destructive p-1 text-destructive-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        ["Brochure PDF", "brochure", draft.brochure, brochureFile, setBrochureFile],
                        [
                          "Technical datasheet PDF",
                          "datasheet",
                          draft.datasheet,
                          datasheetFile,
                          setDatasheetFile,
                        ],
                      ] as const
                    ).map(([label, field, value, file, setFile]) => (
                      <div
                        key={field}
                        className="border border-dashed border-border bg-muted/40 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-secondary" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{label}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {file?.name || value || "PDF up to 10 MB."}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <label className="btn-outline h-9 cursor-pointer px-3 text-sm">
                            <Upload className="h-4 w-4" />
                            {value ? "Replace" : "Upload"}
                            <input
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  setFile(f);
                                  setDraft({ ...draft, [field]: f.name });
                                }
                                e.target.value = "";
                              }}
                            />
                          </label>
                          {value && (
                            <button
                              type="button"
                              onClick={() => {
                                setFile(null);
                                setDraft({ ...draft, [field]: "" });
                              }}
                              className="btn-outline h-9 px-3 text-sm text-destructive"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {section === "SEO" && (
                <div className="space-y-4">
                  <Field
                    label="Meta title"
                    value={draft.metaTitle}
                    hint="Keep under 60 characters."
                    onChange={(v) => setDraft({ ...draft, metaTitle: v })}
                  />
                  <TextAreaField
                    label="Meta description"
                    value={draft.metaDescription}
                    rows={3}
                    hint="Keep under 160 characters."
                    onChange={(v) => setDraft({ ...draft, metaDescription: v })}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Keywords"
                      value={draft.keywords}
                      hint="Comma separated."
                      onChange={(v) => setDraft({ ...draft, keywords: v })}
                    />
                    <Field
                      label="Slug"
                      value={draft.slug}
                      error={errors.slug}
                      onChange={(v) => setDraft({ ...draft, slug: v })}
                    />
                  </div>
                  <div className="border border-dashed border-border bg-muted/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Open Graph image</p>
                        <p className="text-xs text-muted-foreground">
                          {ogImageFile?.name || draft.ogImage || "1200 × 630 px recommended."}
                        </p>
                      </div>
                      <label className="btn-outline h-9 cursor-pointer px-3 text-sm">
                        <Upload className="h-4 w-4" />
                        {draft.ogImage ? "Replace" : "Upload"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setOgImageFile(file);
                              setDraft({ ...draft, ogImage: file.name });
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="border border-border p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Search result preview
                    </p>
                    <p className="mt-2 text-sm text-secondary">
                      {draft.metaTitle || draft.name || "Product title"}
                    </p>
                    <p className="text-xs text-[oklch(0.55_0.12_145)]">
                      batamkonektra.co.id/products/
                      {draft.slug || "product-slug"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {draft.metaDescription ||
                        draft.shortDescription ||
                        "Meta description preview."}
                    </p>
                  </div>
                </div>
              )}

              {section === "Related" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Leave everything unselected to fall back to automatic suggestions by category
                    and brand.
                  </p>
                  <div className="max-h-72 divide-y divide-border overflow-y-auto border border-border">
                    {(rows ?? [])
                      .filter((p) => p.id !== draft.id)
                      .map((p) => {
                        const checked = draft.relatedIds.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm hover:bg-muted/40"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setDraft({
                                  ...draft,
                                  relatedIds: checked
                                    ? draft.relatedIds.filter((r) => r !== p.id)
                                    : [...draft.relatedIds, p.id],
                                })
                              }
                            />
                            <span className="flex-1">
                              <span className="block font-medium text-foreground">{p.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {p.category} · {p.brand}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}

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
                  onClick={() => setPreview(draft)}
                  className="btn-outline text-sm"
                >
                  <Eye className="h-4 w-4" /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => void save(true)}
                  disabled={saving}
                  className="btn-outline text-sm"
                >
                  <Eye className="h-4 w-4" /> Save & preview
                </button>
                <button
                  type="button"
                  onClick={() => void save(false)}
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

      {/* Public preview */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>Public product preview</DialogTitle>
          </DialogHeader>
          {preview && (
            <ProductPreview
              product={preview}
              related={relatedFor(
                { ...(preview as AdminProduct), id: preview.id ?? "draft" },
                (rows ?? []).filter((p) => p.id !== preview.id),
              )}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && !deleting && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} will be removed from the product catalog and from any related
              product lists.
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
