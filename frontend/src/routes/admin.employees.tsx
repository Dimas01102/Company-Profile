import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpDown,
  Eye,
  Linkedin,
  Loader2,
  Mail,
  Pencil,
  Phone,
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
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  emptyEmployee,
  departments,
  type Employee,
} from "@/lib/employee-service";
import { getErrorMessage } from "@/lib/api-client";

export const Route = createFileRoute("/admin/employees")({
  head: () => ({
    meta: [
      { title: "Employees | Konektra Admin Console" },
      {
        name: "description",
        content:
          "Manage the management team and personnel profiles published on the PT Batam Konektra Jaya website.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Employees | Konektra Admin Console" },
      {
        property: "og:description",
        content: "Public personnel profile management.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmployeesPage,
});

type SortKey = "order" | "name" | "position" | "department";
type Draft = Omit<Employee, "id"> & { id?: string };

function initials(name: string) {
  return name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function Avatar({
  employee,
  size = 40,
}: {
  employee: { photo: string; name: string };
  size?: number;
}) {
  if (employee.photo) {
    return (
      <img
        src={employee.photo}
        alt={employee.name}
        loading="lazy"
        style={{ width: size, height: size }}
        className="shrink-0 object-cover"
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center bg-primary text-xs font-bold text-primary-foreground"
    >
      {initials(employee.name) || "-"}
    </span>
  );
}

function EmployeesPage() {
  const user = useAdminUser();

  const [rows, setRows] = useState<Employee[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState("All positions");
  const [department, setDepartment] = useState("All departments");
  const [status, setStatus] = useState("All statuses");
  const [sortKey, setSortKey] = useState<SortKey>("order");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  // The two list fields are edited as raw text. Splitting on every keystroke
  // would delete the new empty line, so pressing Enter would do nothing.
  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [experienceText, setExperienceText] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<Employee | Draft | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoadError(false);
    setRows(null);
    getEmployees()
      .then(setRows)
      .catch(() => setLoadError(true));
  }

  useEffect(load, []);

  // Preview URL for a photo that was just picked (revoked when replaced).
  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview("");
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const positions = useMemo(
    () => ["All positions", ...Array.from(new Set((rows ?? []).map((r) => r.position)))],
    [rows],
  );

  const filtered = useMemo(() => {
    let list = rows ?? [];
    const q = query.trim().toLowerCase();
    if (q)
      list = list.filter((r) =>
        [r.name, r.position, r.department, r.email, r.employeeId].some((v) =>
          v.toLowerCase().includes(q),
        ),
      );
    if (position !== "All positions") list = list.filter((r) => r.position === position);
    if (department !== "All departments") list = list.filter((r) => r.department === department);
    if (status !== "All statuses") list = list.filter((r) => r.status === status);

    return [...list].sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortKey === "order") return (a.order - b.order) * dir;
      return a[sortKey].localeCompare(b[sortKey]) * dir;
    });
  }, [rows, query, position, department, status, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  useEffect(() => setPage(1), [query, position, department, status, perPage]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function openCreate() {
    setFormErrors({});
    setPhotoFile(null);
    setResponsibilitiesText("");
    setExperienceText("");
    setDraft(emptyEmployee((rows?.length ?? 0) + 1));
  }

  function openEdit(e: Employee) {
    setFormErrors({});
    setPhotoFile(null);
    setResponsibilitiesText(e.responsibilities.join("\n"));
    setExperienceText(e.experience.join("\n"));
    setDraft({ ...e });
  }

  function validate(d: Draft) {
    const e: Record<string, string> = {};
    if (!d.name.trim()) e.name = "Full name is required.";
    if (!d.employeeId.trim()) e.employeeId = "Employee ID is required.";
    else if (
      (rows ?? []).some(
        (r) => r.employeeId.toLowerCase() === d.employeeId.trim().toLowerCase() && r.id !== d.id,
      )
    )
      e.employeeId = "This employee ID is already used.";
    if (!d.position.trim()) e.position = "Position is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = "Enter a valid email address.";
    if (!d.phone.trim()) e.phone = "Phone number is required.";
    if (!d.shortBio.trim()) e.shortBio = "Short biography is required.";
    if (d.linkedin && !/^https?:\/\//.test(d.linkedin))
      e.linkedin = "Enter a full URL starting with https://";
    return e;
  }

  async function save(thenPreview = false) {
    if (!draft) return;
    const e = validate(draft);
    setFormErrors(e);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    const toList = (text: string) =>
      text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    const content = {
      ...draft,
      responsibilities: toList(responsibilitiesText),
      experience: toList(experienceText),
    };
    try {
      let saved: Employee;
      if (content.id) {
        const { id, ...patch } = content;
        saved = await updateEmployee(id, patch, photoFile ?? undefined);
        toast.success("Employee updated successfully.");
      } else {
        const { id: _ignored, ...input } = content;
        saved = await createEmployee(input, photoFile ?? undefined);
        toast.success("Employee created successfully.");
      }
      setDraft(null);
      setPhotoFile(null);
      load();
      // Preview the saved record (it carries the real photo URL).
      if (thenPreview) setPreview(saved);
    } catch (err) {
      toast.error(getErrorMessage(err, "Employee could not be saved. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      toast.success("Employee deleted successfully.");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Employee could not be deleted."));
    } finally {
      setDeleting(false);
    }
  }

  const filtersActive =
    !!query.trim() ||
    position !== "All positions" ||
    department !== "All departments" ||
    status !== "All statuses";

  return (
    <>
      <AdminHeader
        user={user}
        title="Employees"
        subtitle="Management and personnel profiles on the public website"
      />

      <div className="px-4 pt-6 md:px-6 md:pt-8">
        <WebsiteLocation feature="employees" />
      </div>

      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="mb-5 flex flex-col gap-3 border border-border bg-surface px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-primary">Personnel profiles</h2>
            <p className="text-xs text-muted-foreground">
              {rows
                ? `${rows.length} profiles · ${rows.filter((r) => r.status === "Active").length} published`
                : "Loading profiles…"}
            </p>
          </div>
          <button type="button" onClick={openCreate} className="btn-primary text-sm">
            <Plus className="h-4 w-4" />
            Add employee
          </button>
        </div>

        <Panel padded={false}>
          <div className="grid gap-3 border-b border-border p-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, position, email, or ID…"
                className="h-10 w-full border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-secondary"
              />
            </div>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="h-10 border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
            >
              {positions.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-10 border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
            >
              {["All departments", ...departments].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 border border-input bg-background px-3 text-sm outline-none focus:border-secondary"
            >
              {["All statuses", "Active", "Inactive"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {loadError ? (
            <div className="p-5">
              <ErrorState message="Employee profiles could not be loaded." onRetry={load} />
            </div>
          ) : !rows ? (
            <TableSkeleton rows={5} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={filtersActive ? "No employees match your filters" : "No employee profiles yet"}
              description={
                filtersActive
                  ? "Try a different search term or clear the filters."
                  : "Add your first personnel profile to display it on the public website."
              }
              action={
                filtersActive ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setPosition("All positions");
                      setDepartment("All departments");
                      setStatus("All statuses");
                    }}
                    className="btn-outline text-sm"
                  >
                    Clear filters
                  </button>
                ) : (
                  <button type="button" onClick={openCreate} className="btn-primary text-sm">
                    <Plus className="h-4 w-4" />
                    Add employee
                  </button>
                )
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-225 text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-5 py-2.5 font-semibold">Photo</th>
                      {(
                        [
                          ["name", "Name"],
                          ["position", "Position"],
                          ["department", "Department"],
                        ] as [SortKey, string][]
                      ).map(([key, label]) => (
                        <th key={key} className="px-5 py-2.5 font-semibold">
                          <button
                            type="button"
                            onClick={() => toggleSort(key)}
                            className="inline-flex items-center gap-1 hover:text-primary"
                          >
                            {label}
                            <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </th>
                      ))}
                      <th className="px-5 py-2.5 font-semibold">Contact</th>
                      <th className="px-5 py-2.5 font-semibold">Status</th>
                      <th className="px-5 py-2.5 font-semibold">
                        <button
                          type="button"
                          onClick={() => toggleSort("order")}
                          className="inline-flex items-center gap-1 hover:text-primary"
                        >
                          Order
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="px-5 py-2.5 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {pageRows.map((e) => (
                      <tr key={e.id} className="hover:bg-muted/40">
                        <td className="px-5 py-3">
                          <Avatar employee={e} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-3">
                          <span className="block font-medium text-foreground">{e.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {e.employeeId}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {e.position}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                          {e.department}
                        </td>
                        <td className="px-5 py-3">
                          <span className="block text-xs text-muted-foreground">{e.email}</span>
                          <span className="block text-xs text-muted-foreground">{e.phone}</span>
                        </td>
                        <td className="px-5 py-3">
                          <StatusPill status={e.status} />
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{e.order}</td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreview(e)}
                              aria-label={`View ${e.name}`}
                              className="inline-flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:text-secondary"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(e)}
                              aria-label={`Edit ${e.name}`}
                              className="inline-flex h-8 w-8 items-center justify-center border border-border text-muted-foreground hover:text-primary"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(e)}
                              aria-label={`Delete ${e.name}`}
                              className="inline-flex h-8 w-8 items-center justify-center border border-border text-destructive hover:bg-destructive/5"
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

              <div className="flex flex-col gap-3 border-t border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Rows per page</span>
                  <select
                    value={perPage}
                    onChange={(e) => setPerPage(Number(e.target.value))}
                    className="h-8 border border-input bg-background px-2 text-xs outline-none focus:border-secondary"
                  >
                    {[5, 10, 25].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span>
                    · {(currentPage - 1) * perPage + 1}–
                    {Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border border-border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-muted disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(i + 1)}
                      className={`h-8 w-8 border text-xs font-semibold ${
                        currentPage === i + 1
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-primary hover:bg-muted"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border border-border px-3 py-1.5 text-xs font-semibold text-primary hover:bg-muted disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </Panel>
      </div>

      {/* Add / edit form */}
      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit employee" : "Add employee"}</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 border border-dashed border-border bg-muted/40 p-4">
                <Avatar employee={{ ...draft, photo: photoPreview || draft.photo }} size={56} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Profile photo</p>
                  <p className="text-xs text-muted-foreground">
                    {photoFile?.name || "Square JPG or PNG, at least 600 × 600 px."}
                  </p>
                </div>
                {(draft.photo || photoFile) && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setDraft({ ...draft, photo: "" });
                    }}
                    className="border border-border bg-surface px-3 py-2 text-xs font-semibold text-destructive hover:bg-muted"
                  >
                    Remove photo
                  </button>
                )}
                <label className="cursor-pointer border border-border bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-muted">
                  <Upload className="mr-1.5 inline h-3.5 w-3.5" />
                  Choose file
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPhotoFile(file);
                        setDraft({ ...draft, photo: file.name });
                      }
                      // Allow picking the same file again after removing it.
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Full name"
                  value={draft.name}
                  onChange={(v) => setDraft({ ...draft, name: v })}
                  error={formErrors.name}
                />
                <Field
                  label="Employee ID"
                  value={draft.employeeId}
                  onChange={(v) => setDraft({ ...draft, employeeId: v })}
                  error={formErrors.employeeId}
                  placeholder="BKJ-0000"
                />
                <Field
                  label="Position"
                  value={draft.position}
                  onChange={(v) => setDraft({ ...draft, position: v })}
                  error={formErrors.position}
                />
                <SelectField
                  label="Department"
                  value={draft.department}
                  onChange={(v) => setDraft({ ...draft, department: v })}
                  options={departments}
                />
                <Field
                  label="Email"
                  type="email"
                  value={draft.email}
                  onChange={(v) => setDraft({ ...draft, email: v })}
                  error={formErrors.email}
                />
                <Field
                  label="Phone"
                  value={draft.phone}
                  onChange={(v) => setDraft({ ...draft, phone: v })}
                  error={formErrors.phone}
                />
              </div>

              <TextAreaField
                label="Short biography"
                value={draft.shortBio}
                onChange={(v) => setDraft({ ...draft, shortBio: v })}
                rows={2}
                error={formErrors.shortBio}
                hint="Shown on the team card."
              />
              <TextAreaField
                label="Full biography"
                value={draft.fullBio}
                onChange={(v) => setDraft({ ...draft, fullBio: v })}
                rows={5}
              />
              <TextAreaField
                label="Responsibilities"
                value={responsibilitiesText}
                onChange={setResponsibilitiesText}
                rows={4}
                hint="One responsibility per line."
              />
              <TextAreaField
                label="Career experience"
                value={experienceText}
                onChange={setExperienceText}
                rows={4}
                hint="One entry per line."
              />

              <div className="grid gap-5 sm:grid-cols-3">
                <Field
                  label="LinkedIn URL"
                  value={draft.linkedin}
                  onChange={(v) => setDraft({ ...draft, linkedin: v })}
                  error={formErrors.linkedin}
                />
                <Field
                  label="Display order"
                  type="number"
                  value={String(draft.order)}
                  onChange={(v) => setDraft({ ...draft, order: Number(v) || 0 })}
                />
                <SelectField
                  label="Status"
                  value={draft.status}
                  onChange={(v) => setDraft({ ...draft, status: v as Employee["status"] })}
                  options={["Active", "Inactive"]}
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setDraft(null)}
                  className="btn-outline text-sm"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => save(true)}
                  disabled={saving}
                  className="btn-outline text-sm disabled:opacity-70"
                >
                  <Eye className="h-4 w-4" />
                  Save &amp; preview
                </button>
                <button
                  type="button"
                  onClick={() => save(false)}
                  disabled={saving}
                  className="btn-primary text-sm disabled:opacity-70"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Public preview */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>Public profile preview</DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar employee={preview} size={96} />
                <div>
                  <h3 className="text-lg font-bold text-primary">{preview.name}</h3>
                  <p className="text-sm font-semibold text-secondary">{preview.position}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {preview.department}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{preview.fullBio || preview.shortBio}</p>

              {preview.responsibilities.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Responsibilities
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {preview.responsibilities.map((r) => (
                      <li key={r} className="border-l-2 border-accent pl-3">
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {preview.experience.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Career experience
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {preview.experience.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid gap-2 border-t border-border pt-4 text-sm text-muted-foreground sm:grid-cols-2">
                <p className="text-xs italic sm:col-span-2">
                  Shown on the website: Home (first 4 active employees) and About (all active
                  employees), ordered by Display order. Email and phone below are internal only and
                  are not shown to visitors.
                </p>
                <span className="inline-flex items-center gap-2">
                  <Mail className="h-4 w-4 text-secondary" />
                  {preview.email} (internal)
                </span>
                <span className="inline-flex items-center gap-2">
                  <Phone className="h-4 w-4 text-secondary" />
                  {preview.phone} (internal)
                </span>
                {preview.linkedin && (
                  <a
                    href={preview.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 font-semibold text-secondary hover:text-primary"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn profile
                  </a>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This employee profile will be removed from the public website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting} className="rounded-none">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
