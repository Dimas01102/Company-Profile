import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
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
  Notice,
  ErrorState,
  FormSkeleton,
  EmptyState,
  StatusPill,
} from "@/components/admin/ui";
import {
  getCompanyProfile,
  updateCompanyProfile,
  getDefaultCompanyProfile,
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  reorderMilestone,
  type CompanyProfile,
  type Milestone,
  type CoreValue,
} from "@/lib/company-service";

export const Route = createFileRoute("/admin/company-profile")({
  head: () => ({
    meta: [
      { title: "Company Profile — Konektra Admin Console" },
      {
        name: "description",
        content:
          "Manage company information, story, vision and mission, core values, contact details, SEO, and milestones shown on the public website.",
      },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Company Profile — Konektra Admin Console" },
      {
        property: "og:description",
        content: "Company information management for PT Batam Konektra Jaya.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CompanyProfilePage,
});

const tabs = [
  { id: "general", label: "General" },
  { id: "story", label: "Company Story" },
  { id: "vision", label: "Vision & Mission" },
  { id: "values", label: "Core Values" },
  { id: "business", label: "Business Info" },
  { id: "social", label: "Social Media" },
  { id: "location", label: "Location" },
  { id: "seo", label: "SEO" },
  { id: "document", label: "Document" },
  { id: "milestones", label: "Milestones" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const iconOptions = [
  "ShieldCheck",
  "BadgeCheck",
  "Lightbulb",
  "Handshake",
  "Users",
  "Wrench",
  "Truck",
] as const;

function emptyMilestone(order: number): Omit<Milestone, "id"> {
  return { year: "", title: "", description: "", image: "", order, active: true };
}

function CompanyProfilePage() {
  const user = useAdminUser();

  const [tab, setTab] = useState<TabId>("general");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saved, setSaved] = useState<CompanyProfile | null>(null);
  const [form, setForm] = useState<CompanyProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[] | null>(null);
  const [milestoneError, setMilestoneError] = useState(false);
  const [milestoneDraft, setMilestoneDraft] = useState<
    (Omit<Milestone, "id"> & { id?: string }) | null
  >(null);
  const [milestoneErrors, setMilestoneErrors] = useState<Record<string, string>>({});
  const [milestoneBusy, setMilestoneBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Milestone | null>(null);

  function load() {
    setLoading(true);
    setLoadError(false);
    getCompanyProfile()
      .then((p) => {
        setSaved(p);
        setForm(p);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }

  function loadMilestones() {
    setMilestoneError(false);
    getMilestones()
      .then(setMilestones)
      .catch(() => setMilestoneError(true));
  }

  useEffect(() => {
    load();
    loadMilestones();
  }, []);

  const dirty = useMemo(
    () => !!form && !!saved && JSON.stringify(form) !== JSON.stringify(saved),
    [form, saved],
  );

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function set<K extends keyof CompanyProfile>(key: K, value: CompanyProfile[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  function validate(f: CompanyProfile) {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = "Company name is required.";
    if (!f.tagline.trim()) e.tagline = "Tagline is required.";
    if (!f.shortDescription.trim()) e.shortDescription = "Short description is required.";
    if (!/^\d{4}$/.test(f.foundedYear)) e.foundedYear = "Enter a 4-digit year.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email address.";
    if (!f.phone.trim()) e.phone = "Phone number is required.";
    if (!f.address.trim()) e.address = "Address is required.";
    if (f.metaTitle.length > 60) e.metaTitle = "Keep the meta title under 60 characters.";
    if (f.metaDescription.length > 160)
      e.metaDescription = "Keep the meta description under 160 characters.";
    for (const [key, url] of [
      ["facebook", f.facebook],
      ["instagram", f.instagram],
      ["linkedin", f.linkedin],
      ["youtube", f.youtube],
    ] as const) {
      if (url && !/^https?:\/\//.test(url)) e[key] = "Enter a full URL starting with https://";
    }
    return e;
  }

  async function handleSave() {
    if (!form) return;
    const e = validate(form);
    setErrors(e);
    setSaveError(null);
    if (Object.keys(e).length) {
      toast.error("Please fix the highlighted fields before saving.");
      return;
    }
    setSaving(true);
    try {
      const next = await updateCompanyProfile(form);
      setSaved(next);
      setForm(next);
      setEditing(false);
      toast.success("Company profile saved successfully.");
    } catch {
      setSaveError("Company profile could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (dirty) {
      setConfirmCancel(true);
      return;
    }
    setEditing(false);
    setErrors({});
  }

  function discard() {
    setForm(saved);
    setErrors({});
    setEditing(false);
    setConfirmCancel(false);
  }

  function handleReset() {
    setForm(getDefaultCompanyProfile());
    setConfirmReset(false);
    toast.success("Fields reset to the default content. Save to apply.");
  }

  // ---- core values ----
  function setValue(id: string, patch: Partial<CoreValue>) {
    setForm((f) =>
      f ? { ...f, coreValues: f.coreValues.map((v) => (v.id === id ? { ...v, ...patch } : v)) } : f,
    );
  }
  function addValue() {
    setForm((f) =>
      f
        ? {
            ...f,
            coreValues: [
              ...f.coreValues,
              {
                id: `cv-${Date.now()}`,
                name: "",
                description: "",
                icon: "ShieldCheck",
                order: f.coreValues.length + 1,
              },
            ],
          }
        : f,
    );
  }
  function removeValue(id: string) {
    setForm((f) => (f ? { ...f, coreValues: f.coreValues.filter((v) => v.id !== id) } : f));
  }

  // ---- milestones ----
  async function saveMilestone() {
    if (!milestoneDraft) return;
    const e: Record<string, string> = {};
    if (!/^\d{4}$/.test(milestoneDraft.year)) e.year = "Enter a 4-digit year.";
    if (!milestoneDraft.title.trim()) e.title = "Title is required.";
    if (!milestoneDraft.description.trim()) e.description = "Description is required.";
    setMilestoneErrors(e);
    if (Object.keys(e).length) return;

    setMilestoneBusy(true);
    try {
      if (milestoneDraft.id) {
        const { id, ...patch } = milestoneDraft;
        await updateMilestone(id, patch);
        toast.success("Milestone updated successfully.");
      } else {
        const { id: _ignored, ...input } = milestoneDraft;
        await createMilestone(input);
        toast.success("Milestone added successfully.");
      }
      setMilestoneDraft(null);
      loadMilestones();
    } catch {
      toast.error("Milestone could not be saved.");
    } finally {
      setMilestoneBusy(false);
    }
  }

  async function confirmDeleteMilestone() {
    if (!deleteTarget) return;
    setMilestoneBusy(true);
    try {
      await deleteMilestone(deleteTarget.id);
      toast.success("Milestone deleted successfully.");
      setDeleteTarget(null);
      loadMilestones();
    } catch {
      toast.error("Milestone could not be deleted.");
    } finally {
      setMilestoneBusy(false);
    }
  }

  async function toggleMilestone(m: Milestone) {
    setMilestones((list) =>
      list ? list.map((x) => (x.id === m.id ? { ...x, active: !x.active } : x)) : list,
    );
    await updateMilestone(m.id, { active: !m.active });
    toast.success(`Milestone ${!m.active ? "enabled" : "disabled"}.`);
  }

  async function move(m: Milestone, direction: "up" | "down") {
    const next = await reorderMilestone(m.id, direction);
    setMilestones(next);
  }

  const disabled = !editing;

  return (
    <>
      <AdminHeader
        user={user}
        title="Company Profile"
        subtitle="Information shown across the public website"
      />

      <div className="px-4 py-6 md:px-6 md:py-8">
        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-3 border border-border bg-surface px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-primary">
              {editing ? "Editing company information" : "Viewing company information"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {dirty
                ? "You have unsaved changes."
                : "Changes apply to the About and Contact pages once saved."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="btn-outline text-sm"
            >
              <Eye className="h-4 w-4" />
              Live preview
            </button>
            <a href="/about" target="_blank" rel="noreferrer" className="btn-outline text-sm">
              <ExternalLink className="h-4 w-4" />
              Preview website
            </a>
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="btn-primary text-sm"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="btn-outline text-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
                <button type="button" onClick={handleCancel} className="btn-outline text-sm">
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary text-sm disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {dirty && (
          <div className="mb-5">
            <Notice kind="error">
              Unsaved changes — leaving this page or cancelling will discard them.
            </Notice>
          </div>
        )}
        {saveError && (
          <div className="mb-5">
            <Notice kind="error">{saveError}</Notice>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-5 flex flex-wrap gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`-mb-px border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "border-accent text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loadError ? (
          <ErrorState message="Company profile could not be loaded." onRetry={load} />
        ) : loading || !form ? (
          <FormSkeleton rows={3} />
        ) : (
          <div className="space-y-6">
            {tab === "general" && (
              <Panel
                title="General information"
                description="Core identity used in the header, footer, and metadata."
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <Field
                    label="Company name"
                    value={form.name}
                    onChange={(v) => set("name", v)}
                    error={errors.name}
                    disabled={disabled}
                  />
                  <Field
                    label="Tagline"
                    value={form.tagline}
                    onChange={(v) => set("tagline", v)}
                    error={errors.tagline}
                    disabled={disabled}
                  />
                  <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
                    <UploadBox
                      label="Company logo"
                      fileName={form.logoName}
                      disabled={disabled}
                      onChange={(v) => set("logoName", v)}
                      hint="SVG or PNG, transparent background."
                    />
                    <UploadBox
                      label="Favicon"
                      fileName={form.faviconName}
                      disabled={disabled}
                      onChange={(v) => set("faviconName", v)}
                      hint="PNG, 512 × 512 px."
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <TextAreaField
                      label="Short description"
                      value={form.shortDescription}
                      onChange={(v) => set("shortDescription", v)}
                      rows={3}
                      error={errors.shortDescription}
                      disabled={disabled}
                      hint="Used in the footer and page introductions."
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <TextAreaField
                      label="Full company description"
                      value={form.fullDescription}
                      onChange={(v) => set("fullDescription", v)}
                      rows={7}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </Panel>
            )}

            {tab === "story" && (
              <Panel title="Company story" description="Shown in the About page introduction.">
                <div className="grid gap-5">
                  <div className="max-w-xs">
                    <Field
                      label="Founded year"
                      value={form.foundedYear}
                      onChange={(v) => set("foundedYear", v)}
                      error={errors.foundedYear}
                      disabled={disabled}
                    />
                  </div>
                  <TextAreaField
                    label="Company history"
                    value={form.history}
                    onChange={(v) => set("history", v)}
                    rows={6}
                    disabled={disabled}
                  />
                  <TextAreaField
                    label="Company background"
                    value={form.background}
                    onChange={(v) => set("background", v)}
                    rows={4}
                    disabled={disabled}
                  />
                </div>
              </Panel>
            )}

            {tab === "vision" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Vision">
                  <TextAreaField
                    label="Vision statement"
                    value={form.vision}
                    onChange={(v) => set("vision", v)}
                    rows={6}
                    disabled={disabled}
                  />
                </Panel>
                <Panel title="Mission">
                  <TextAreaField
                    label="Mission statement"
                    value={form.mission}
                    onChange={(v) => set("mission", v)}
                    rows={6}
                    disabled={disabled}
                    hint="Separate points with a semicolon."
                  />
                </Panel>
              </div>
            )}

            {tab === "values" && (
              <Panel
                title="Core values"
                description="Displayed as a grid on the About page."
                action={
                  <button
                    type="button"
                    onClick={addValue}
                    disabled={disabled}
                    className="btn-outline text-sm disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add value
                  </button>
                }
                padded={false}
              >
                {form.coreValues.length === 0 ? (
                  <EmptyState
                    title="No core values yet"
                    description="Add at least one value to display on the About page."
                  />
                ) : (
                  <ul className="divide-y divide-border">
                    {form.coreValues
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((v) => (
                        <li
                          key={v.id}
                          className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_2fr_180px_120px_auto] lg:items-start"
                        >
                          <Field
                            label="Value name"
                            value={v.name}
                            onChange={(val) => setValue(v.id, { name: val })}
                            disabled={disabled}
                          />
                          <TextAreaField
                            label="Description"
                            value={v.description}
                            onChange={(val) => setValue(v.id, { description: val })}
                            rows={2}
                            disabled={disabled}
                          />
                          <SelectField
                            label="Icon"
                            value={v.icon}
                            onChange={(val) => setValue(v.id, { icon: val })}
                            options={iconOptions}
                            disabled={disabled}
                          />
                          <Field
                            label="Order"
                            type="number"
                            value={String(v.order)}
                            onChange={(val) => setValue(v.id, { order: Number(val) || 0 })}
                            disabled={disabled}
                          />
                          <div className="lg:pt-8">
                            <button
                              type="button"
                              onClick={() => removeValue(v.id)}
                              disabled={disabled}
                              aria-label={`Remove ${v.name || "value"}`}
                              className="inline-flex h-10 w-10 items-center justify-center border border-border text-destructive hover:bg-destructive/5 disabled:opacity-40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </Panel>
            )}

            {tab === "business" && (
              <Panel
                title="Business information"
                description="Legal, industry, and contact details."
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <Field
                    label="Business type"
                    value={form.businessType}
                    onChange={(v) => set("businessType", v)}
                    disabled={disabled}
                  />
                  <Field
                    label="Industry"
                    value={form.industry}
                    onChange={(v) => set("industry", v)}
                    disabled={disabled}
                  />
                  <div className="lg:col-span-2">
                    <TextAreaField
                      label="Business scope"
                      value={form.businessScope}
                      onChange={(v) => set("businessScope", v)}
                      rows={3}
                      disabled={disabled}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Field
                      label="Address"
                      value={form.address}
                      onChange={(v) => set("address", v)}
                      error={errors.address}
                      disabled={disabled}
                    />
                  </div>
                  <Field
                    label="City"
                    value={form.city}
                    onChange={(v) => set("city", v)}
                    disabled={disabled}
                  />
                  <Field
                    label="Province"
                    value={form.province}
                    onChange={(v) => set("province", v)}
                    disabled={disabled}
                  />
                  <Field
                    label="Postal code"
                    value={form.postalCode}
                    onChange={(v) => set("postalCode", v)}
                    disabled={disabled}
                  />
                  <Field
                    label="Phone"
                    value={form.phone}
                    onChange={(v) => set("phone", v)}
                    error={errors.phone}
                    disabled={disabled}
                  />
                  <Field
                    label="WhatsApp"
                    value={form.whatsapp}
                    onChange={(v) => set("whatsapp", v)}
                    disabled={disabled}
                  />
                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(v) => set("email", v)}
                    error={errors.email}
                    disabled={disabled}
                  />
                  <div className="lg:col-span-2">
                    <Field
                      label="Business hours"
                      value={form.businessHours}
                      onChange={(v) => set("businessHours", v)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </Panel>
            )}

            {tab === "social" && (
              <Panel title="Social media" description="Links used in the footer and contact page.">
                <div className="grid gap-5 lg:grid-cols-2">
                  <Field
                    label="Facebook"
                    value={form.facebook}
                    onChange={(v) => set("facebook", v)}
                    error={errors.facebook}
                    disabled={disabled}
                  />
                  <Field
                    label="Instagram"
                    value={form.instagram}
                    onChange={(v) => set("instagram", v)}
                    error={errors.instagram}
                    disabled={disabled}
                  />
                  <Field
                    label="LinkedIn"
                    value={form.linkedin}
                    onChange={(v) => set("linkedin", v)}
                    error={errors.linkedin}
                    disabled={disabled}
                  />
                  <Field
                    label="YouTube"
                    value={form.youtube}
                    onChange={(v) => set("youtube", v)}
                    error={errors.youtube}
                    disabled={disabled}
                  />
                  <div className="lg:col-span-2">
                    <Field
                      label="Other social media"
                      value={form.otherSocial}
                      onChange={(v) => set("otherSocial", v)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </Panel>
            )}

            {tab === "location" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Location details">
                  <div className="grid gap-5">
                    <TextAreaField
                      label="Google Maps embed URL"
                      value={form.mapEmbed}
                      onChange={(v) => set("mapEmbed", v)}
                      rows={3}
                      disabled={disabled}
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="Latitude"
                        value={form.latitude}
                        onChange={(v) => set("latitude", v)}
                        disabled={disabled}
                      />
                      <Field
                        label="Longitude"
                        value={form.longitude}
                        onChange={(v) => set("longitude", v)}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                </Panel>
                <Panel title="Map preview" padded={false}>
                  <div className="aspect-[4/3] w-full bg-muted">
                    <iframe
                      title="Company location preview"
                      src={form.mapEmbed}
                      className="h-full w-full border-0"
                      loading="lazy"
                    />
                  </div>
                </Panel>
              </div>
            )}

            {tab === "seo" && (
              <Panel
                title="Search engine optimisation"
                description="Defaults used when a page has no specific metadata."
              >
                <div className="grid gap-5">
                  <Field
                    label="Meta title"
                    value={form.metaTitle}
                    onChange={(v) => set("metaTitle", v)}
                    error={errors.metaTitle}
                    hint={`${form.metaTitle.length}/60 characters`}
                    disabled={disabled}
                  />
                  <TextAreaField
                    label="Meta description"
                    value={form.metaDescription}
                    onChange={(v) => set("metaDescription", v)}
                    rows={3}
                    error={errors.metaDescription}
                    hint={`${form.metaDescription.length}/160 characters`}
                    disabled={disabled}
                  />
                  <TextAreaField
                    label="Keywords"
                    value={form.keywords}
                    onChange={(v) => set("keywords", v)}
                    rows={2}
                    hint="Separate keywords with commas."
                    disabled={disabled}
                  />
                  <div className="max-w-sm">
                    <UploadBox
                      label="Open Graph image"
                      fileName={form.ogImageName}
                      disabled={disabled}
                      onChange={(v) => set("ogImageName", v)}
                      hint="JPG, 1200 × 630 px."
                    />
                  </div>
                  <div className="border border-border bg-muted/50 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Search result preview
                    </p>
                    <p className="mt-2 text-base font-medium text-secondary">{form.metaTitle}</p>
                    <p className="text-xs text-[color:oklch(0.5_0.12_145)]">
                      www.batamkonektra.co.id
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{form.metaDescription}</p>
                  </div>
                </div>
              </Panel>
            )}

            {tab === "document" && (
              <Panel
                title="Company profile document"
                description="Downloadable PDF offered on the About and Contact pages."
              >
                {form.profilePdfName ? (
                  <div className="flex flex-col gap-4 border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center bg-muted text-destructive">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {form.profilePdfName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF · {form.profilePdfSize} · updated {form.profilePdfUpdatedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          toast.info(
                            `Previewing ${form.profilePdfName} isn't available in this demo — this action will open the file in a new tab once connected to the Laravel API.`,
                          )
                        }
                        className="btn-outline text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        Preview file
                      </button>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          set("profilePdfName", "Company-Profile-Konektra-2026-rev2.pdf");
                          set("profilePdfSize", "5.1 MB");
                          set("profilePdfUpdatedAt", "8 Sep 2026");
                        }}
                        className="btn-outline text-sm disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4" />
                        Replace
                      </button>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          set("profilePdfName", "");
                          set("profilePdfSize", "");
                          set("profilePdfUpdatedAt", "");
                        }}
                        className="btn-outline text-sm text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="No company profile document"
                    description="Upload a PDF so visitors can download the company profile."
                    action={
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          set("profilePdfName", "Company-Profile-Konektra-2026.pdf");
                          set("profilePdfSize", "4.8 MB");
                          set("profilePdfUpdatedAt", "8 Sep 2026");
                        }}
                        className="btn-primary text-sm disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4" />
                        Upload PDF
                      </button>
                    }
                  />
                )}
              </Panel>
            )}

            {tab === "milestones" && (
              <Panel
                title="Company milestones"
                description="Rendered as the timeline on the public About page."
                action={
                  <button
                    type="button"
                    onClick={() => {
                      setMilestoneErrors({});
                      setMilestoneDraft(emptyMilestone((milestones?.length ?? 0) + 1));
                    }}
                    className="btn-primary text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add milestone
                  </button>
                }
                padded={false}
              >
                {milestoneError ? (
                  <div className="p-5">
                    <ErrorState
                      message="Milestones could not be loaded."
                      onRetry={loadMilestones}
                    />
                  </div>
                ) : !milestones ? (
                  <FormSkeleton rows={2} />
                ) : milestones.length === 0 ? (
                  <EmptyState
                    title="No milestones yet"
                    description="Add company milestones to build the About page timeline."
                  />
                ) : (
                  <>
                    <ul className="divide-y divide-border">
                      {milestones.map((m, i) => (
                        <li
                          key={m.id}
                          className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center"
                        >
                          <span className="w-16 shrink-0 text-lg font-bold text-accent">
                            {m.year}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground">{m.title}</p>
                            <p className="text-xs text-muted-foreground">{m.description}</p>
                            <p className="mt-1 text-[11px] text-muted-foreground/70">
                              Order {m.order} · {m.image || "no image"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusPill status={m.active ? "Active" : "Inactive"} />
                            <button
                              type="button"
                              onClick={() => move(m, "up")}
                              disabled={i === 0}
                              aria-label="Move up"
                              className="inline-flex h-9 w-9 items-center justify-center border border-border text-muted-foreground hover:text-primary disabled:opacity-30"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => move(m, "down")}
                              disabled={i === milestones.length - 1}
                              aria-label="Move down"
                              className="inline-flex h-9 w-9 items-center justify-center border border-border text-muted-foreground hover:text-primary disabled:opacity-30"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleMilestone(m)}
                              className="border border-border px-3 py-2 text-xs font-semibold text-primary hover:bg-muted"
                            >
                              {m.active ? "Disable" : "Enable"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMilestoneErrors({});
                                setMilestoneDraft({ ...m });
                              }}
                              aria-label={`Edit ${m.title}`}
                              className="inline-flex h-9 w-9 items-center justify-center border border-border text-muted-foreground hover:text-primary"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(m)}
                              aria-label={`Delete ${m.title}`}
                              className="inline-flex h-9 w-9 items-center justify-center border border-border text-destructive hover:bg-destructive/5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-border bg-muted/40 p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Public timeline preview
                      </p>
                      <ol className="mt-4 space-y-4 border-l border-border pl-5">
                        {milestones
                          .filter((m) => m.active)
                          .map((m) => (
                            <li key={m.id} className="relative">
                              <span className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 bg-accent" />
                              <p className="text-sm font-bold text-primary">
                                {m.year} — {m.title}
                              </p>
                              <p className="text-sm text-muted-foreground">{m.description}</p>
                            </li>
                          ))}
                      </ol>
                    </div>
                  </>
                )}
              </Panel>
            )}
          </div>
        )}
      </div>

      {/* Milestone editor */}
      <Dialog open={!!milestoneDraft} onOpenChange={(o) => !o && setMilestoneDraft(null)}>
        <DialogContent className="max-w-lg rounded-none">
          <DialogHeader>
            <DialogTitle>{milestoneDraft?.id ? "Edit milestone" : "Add milestone"}</DialogTitle>
          </DialogHeader>
          {milestoneDraft && (
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Year"
                  value={milestoneDraft.year}
                  onChange={(v) => setMilestoneDraft({ ...milestoneDraft, year: v })}
                  error={milestoneErrors.year}
                />
                <Field
                  label="Display order"
                  type="number"
                  value={String(milestoneDraft.order)}
                  onChange={(v) => setMilestoneDraft({ ...milestoneDraft, order: Number(v) || 0 })}
                />
              </div>
              <Field
                label="Title"
                value={milestoneDraft.title}
                onChange={(v) => setMilestoneDraft({ ...milestoneDraft, title: v })}
                error={milestoneErrors.title}
              />
              <TextAreaField
                label="Description"
                value={milestoneDraft.description}
                onChange={(v) => setMilestoneDraft({ ...milestoneDraft, description: v })}
                rows={3}
                error={milestoneErrors.description}
              />
              <Field
                label="Image file name"
                value={milestoneDraft.image}
                onChange={(v) => setMilestoneDraft({ ...milestoneDraft, image: v })}
                hint="Upload handling arrives with the backend."
              />
              <SelectField
                label="Status"
                value={milestoneDraft.active ? "Active" : "Inactive"}
                onChange={(v) => setMilestoneDraft({ ...milestoneDraft, active: v === "Active" })}
                options={["Active", "Inactive"]}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMilestoneDraft(null)}
                  className="btn-outline text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveMilestone}
                  disabled={milestoneBusy}
                  className="btn-primary text-sm disabled:opacity-70"
                >
                  {milestoneBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save milestone
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Live preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>Public content preview</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-5 text-sm">
              <div>
                <p className="eyebrow">{form.tagline}</p>
                <h3 className="mt-1 text-xl font-bold text-primary">{form.name}</h3>
                <p className="mt-2 text-muted-foreground">{form.shortDescription}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Our story
                </p>
                <p className="mt-1 text-muted-foreground">{form.history}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Vision
                  </p>
                  <p className="mt-1 text-muted-foreground">{form.vision}</p>
                </div>
                <div className="border border-border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">
                    Mission
                  </p>
                  <p className="mt-1 text-muted-foreground">{form.mission}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Core values
                </p>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {form.coreValues.map((v) => (
                    <li key={v.id} className="border border-border p-3">
                      <p className="font-semibold text-primary">{v.name}</p>
                      <p className="text-xs text-muted-foreground">{v.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-border pt-4 text-muted-foreground">
                <p>
                  {form.address}, {form.city}, {form.province} {form.postalCode}
                </p>
                <p>
                  {form.phone} · {form.email}
                </p>
                <p>{form.businessHours}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all fields?</AlertDialogTitle>
            <AlertDialogDescription>
              Every field returns to the default company content. Nothing is published until you
              save.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="rounded-none">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your edits to the company profile will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={discard} className="rounded-none">
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-none">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete milestone?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.year} — {deleteTarget?.title}” will be removed from the public
              timeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMilestone} className="rounded-none">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function UploadBox({
  label,
  fileName,
  onChange,
  hint,
  disabled,
}: {
  label: string;
  fileName: string;
  onChange: (v: string) => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <div className="mt-2 flex items-center gap-3 border border-dashed border-border bg-muted/40 p-3">
        <span className="flex h-10 w-10 items-center justify-center bg-surface text-secondary">
          <Upload className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {fileName || "No file selected"}
          </p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            onChange(fileName ? "" : `${label.toLowerCase().replace(/\s+/g, "-")}-new.png`)
          }
          className="border border-border bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-muted disabled:opacity-50"
        >
          {fileName ? "Remove" : "Choose"}
        </button>
      </div>
    </div>
  );
}
