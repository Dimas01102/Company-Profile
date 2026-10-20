import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { AppearsOn, FullPreview, TabPreview } from "@/components/admin/CompanyTabPreview";
import { getErrorMessage } from "@/lib/api-client";
import { coordinateEmbedUrl, parseMapInput } from "@/lib/company-display";
import {
  getCompanyProfile,
  updateCompanyProfile,
  getDefaultCompanyProfile,
  getMilestones,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  reorderMilestone,
  resolveMapLink,
  type CompanyProfile,
  type Milestone,
  type CoreValue,
} from "@/lib/company-service";

export const Route = createFileRoute("/admin/company-profile")({
  head: () => ({
    meta: [
      { title: "Company Profile | Konektra Admin Console" },
      {
        name: "description",
        content:
          "Manage company information, story, vision and mission, core values, contact details, SEO, and milestones shown on the public website.",
      },
      { name: "robots", content: "noindex, nofollow" },
      {
        property: "og:title",
        content: "Company Profile, Konektra Admin Console",
      },
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
  return {
    year: "",
    title: "",
    description: "",
    image: "",
    order,
    active: true,
  };
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [profilePdfFile, setProfilePdfFile] = useState<File | null>(null);
  const logoUrl = useFileUrl(logoFile, form?.logoName ?? "");
  const ogImageUrl = useFileUrl(ogImageFile, form?.ogImageName ?? "");
  const pdfUrl = useFileUrl(profilePdfFile, form?.profilePdfName ?? "");

  // Location: the pasted Google Maps link is converted to an embed URL and
  // coordinates as soon as it is understood.
  const [mapInput, setMapInput] = useState("");
  const [mapStatus, setMapStatus] = useState<{
    kind: "busy" | "ok" | "error";
    text: string;
  } | null>(null);
  const mapTimer = useRef<number | null>(null);
  const latestMapInput = useRef("");

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[] | null>(null);
  const [milestoneError, setMilestoneError] = useState(false);
  const [milestoneDraft, setMilestoneDraft] = useState<
    (Omit<Milestone, "id"> & { id?: string }) | null
  >(null);
  const [milestoneErrors, setMilestoneErrors] = useState<Record<string, string>>({});
  const [milestoneBusy, setMilestoneBusy] = useState(false);
  const [milestoneImageFile, setMilestoneImageFile] = useState<File | null>(null);
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
    // Same limits as the API, so the error shows on the right tab before saving.
    const maxLengths: [keyof CompanyProfile, number, string][] = [
      ["name", 255, "Company name"],
      ["tagline", 255, "Tagline"],
      ["address", 255, "Address"],
      ["phone", 30, "Phone"],
      ["postalCode", 10, "Postal code"],
      ["keywords", 255, "Keywords"],
    ];
    for (const [key, max, label] of maxLengths) {
      if (String(f[key]).length > max && !e[key])
        e[key] = `${label} is too long (max ${max} characters).`;
    }
    if (f.whatsapp.length > 30) e.whatsapp = "WhatsApp is too long (max 30 characters).";
    if (f.city.length > 100) e.city = "City is too long (max 100 characters).";
    if (f.province.length > 100) e.province = "Province is too long (max 100 characters).";
    if (f.businessHours.length > 1000)
      e.businessHours = "Business hours are too long (max 1000 characters).";

    const lat = f.latitude.trim();
    const lng = f.longitude.trim();
    if (lat && !(Number.isFinite(Number(lat)) && Math.abs(Number(lat)) <= 90))
      e.latitude = "Latitude must be a number between -90 and 90.";
    if (lng && !(Number.isFinite(Number(lng)) && Math.abs(Number(lng)) <= 180))
      e.longitude = "Longitude must be a number between -180 and 180.";
    if (!e.latitude && !e.longitude && !!lat !== !!lng)
      e[lat ? "longitude" : "latitude"] =
        "Fill in both latitude and longitude, or leave both empty.";

    for (const v of f.coreValues) {
      if (!v.name.trim()) e[`value-${v.id}`] = "Value name is required (or remove this row).";
      else if (v.description.length > 500)
        e[`value-${v.id}`] = "Description is too long (max 500 characters).";
    }
    if (f.metaTitle.length > 255) e.metaTitle = "Meta title is too long (max 255 characters).";
    if (f.metaDescription.length > 500)
      e.metaDescription = "Meta description is too long (max 500 characters).";
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
      // Errors may sit on a tab that isn't visible, jump to the first one.
      const tabOf: Record<string, TabId> = {
        name: "general",
        tagline: "general",
        shortDescription: "general",
        foundedYear: "story",
        address: "business",
        phone: "business",
        email: "business",
        facebook: "social",
        instagram: "social",
        linkedin: "social",
        youtube: "social",
        businessHours: "business",
        postalCode: "business",
        whatsapp: "business",
        city: "business",
        province: "business",
        keywords: "seo",
        latitude: "location",
        longitude: "location",
        metaTitle: "seo",
        metaDescription: "seo",
      };
      const firstKey = Object.keys(e)[0];
      if (firstKey.startsWith("value-")) setTab("values");
      else if (tabOf[firstKey]) setTab(tabOf[firstKey]);
      toast.error(`Please fix the highlighted fields before saving. ${e[firstKey]}`);
      return;
    }
    setSaving(true);
    try {
      const next = await updateCompanyProfile(form, {
        logoFile: logoFile ?? undefined,
        ogImageFile: ogImageFile ?? undefined,
        profilePdfFile: profilePdfFile ?? undefined,
      });
      setSaved(next);
      setForm(next);
      setEditing(false);
      setLogoFile(null);
      setOgImageFile(null);
      setProfilePdfFile(null);
      resetMapInput();
      toast.success("Company profile saved successfully.");
    } catch (err) {
      const message = getErrorMessage(err, "Please try again.");
      setSaveError(`Company profile could not be saved. ${message}`);
      toast.error(message);
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
    resetMapInput();
  }

  function discard() {
    setForm(saved);
    setErrors({});
    setEditing(false);
    setConfirmCancel(false);
    setLogoFile(null);
    setOgImageFile(null);
    setProfilePdfFile(null);
    resetMapInput();
  }

  function handleReset() {
    setForm(getDefaultCompanyProfile());
    setConfirmReset(false);
    toast.success("Fields reset to the default content. Save to apply.");
  }

  // ---- location ----
  function resetMapInput() {
    if (mapTimer.current) window.clearTimeout(mapTimer.current);
    latestMapInput.current = "";
    setMapInput("");
    setMapStatus(null);
  }

  function applyMap(embedUrl: string, latitude: string, longitude: string) {
    setForm((f) =>
      f
        ? {
            ...f,
            mapEmbed: embedUrl,
            ...(latitude && longitude ? { latitude, longitude } : {}),
          }
        : f,
    );
    setMapStatus({
      kind: "ok",
      text:
        latitude && longitude
          ? `Link accepted. Latitude ${latitude}, longitude ${longitude} filled in automatically.`
          : "Link accepted, but it holds no coordinates. Type latitude and longitude below if you want an exact pin.",
    });
  }

  function handleMapInput(raw: string) {
    setMapInput(raw);
    latestMapInput.current = raw;
    if (mapTimer.current) window.clearTimeout(mapTimer.current);
    const value = raw.trim();
    if (!value) {
      setMapStatus(null);
      return;
    }

    // Normal links, embed links, <iframe> snippets and "lat, lng" text are
    // understood instantly in the browser.
    const parsed = parseMapInput(value);
    if (parsed) {
      applyMap(parsed.embedUrl, parsed.latitude, parsed.longitude);
      return;
    }

    // Short links (maps.app.goo.gl) can only be expanded by the server.
    if (/^https?:\/\//i.test(value)) {
      setMapStatus({ kind: "busy", text: "Reading the link..." });
      mapTimer.current = window.setTimeout(async () => {
        try {
          const r = await resolveMapLink(value);
          if (latestMapInput.current !== raw) return;
          applyMap(r.embedUrl, r.latitude, r.longitude);
        } catch (err) {
          if (latestMapInput.current !== raw) return;
          setMapStatus({
            kind: "error",
            text: getErrorMessage(err, "The link could not be read."),
          });
        }
      }, 450);
      return;
    }

    setMapStatus({
      kind: "error",
      text: "This is not a Google Maps link. Paste the link from Google Maps (Share > Copy link), an embed code, or type latitude and longitude below.",
    });
  }

  function setCoordinate(key: "latitude" | "longitude", value: string) {
    setForm((f) => {
      if (!f) return f;
      const next = { ...f, [key]: value };
      const lat = next.latitude.trim();
      const lng = next.longitude.trim();
      const ok =
        lat &&
        lng &&
        Number.isFinite(Number(lat)) &&
        Number.isFinite(Number(lng)) &&
        Math.abs(Number(lat)) <= 90 &&
        Math.abs(Number(lng)) <= 180;
      // Typing valid coordinates also moves the map pin.
      return ok ? { ...next, mapEmbed: coordinateEmbedUrl(lat, lng) } : next;
    });
  }

  // ---- core values ----
  function setValue(id: string, patch: Partial<CoreValue>) {
    setForm((f) =>
      f
        ? {
            ...f,
            coreValues: f.coreValues.map((v) => (v.id === id ? { ...v, ...patch } : v)),
          }
        : f,
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
  function openMilestone(draft: Omit<Milestone, "id"> & { id?: string }) {
    setMilestoneErrors({});
    setMilestoneImageFile(null);
    setMilestoneDraft(draft);
  }

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
        const { id, ...milestone } = milestoneDraft;
        await updateMilestone(id, milestone, milestoneImageFile ?? undefined);
        toast.success("Milestone updated successfully.");
      } else {
        const { id: _ignored, ...input } = milestoneDraft;
        await createMilestone(input, milestoneImageFile ?? undefined);
        toast.success("Milestone added successfully.");
      }
      setMilestoneDraft(null);
      setMilestoneImageFile(null);
      loadMilestones();
    } catch (err) {
      toast.error(getErrorMessage(err, "Milestone could not be saved."));
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
    } catch (err) {
      toast.error(getErrorMessage(err, "Milestone could not be deleted."));
    } finally {
      setMilestoneBusy(false);
    }
  }

  async function toggleMilestone(m: Milestone) {
    setMilestones((list) =>
      list ? list.map((x) => (x.id === m.id ? { ...x, active: !x.active } : x)) : list,
    );
    try {
      // The API validates the whole milestone on update, so send all of it,
      // a bare `{ active }` is rejected (year and title are required).
      const { id, ...milestone } = m;
      await updateMilestone(id, { ...milestone, active: !m.active });
      toast.success(`Milestone ${!m.active ? "enabled" : "disabled"}.`);
    } catch (err) {
      // Roll the optimistic switch back so the list matches the database.
      setMilestones((list) => (list ? list.map((x) => (x.id === m.id ? m : x)) : list));
      toast.error(getErrorMessage(err, "Milestone could not be updated."));
    }
  }

  async function move(m: Milestone, direction: "up" | "down") {
    try {
      const next = await reorderMilestone(m.id, direction);
      setMilestones(next);
    } catch (err) {
      toast.error(getErrorMessage(err, "Milestones could not be reordered."));
    }
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
              Unsaved changes, leaving this page or cancelling will discard them.
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
            <AppearsOn tab={tab} />
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
                  <div className="max-w-md lg:col-span-2">
                    <UploadBox
                      label="Company logo"
                      fileName={form.logoName}
                      file={logoFile}
                      disabled={disabled}
                      onChange={(v) => set("logoName", v)}
                      onFileSelect={setLogoFile}
                      accept="image/svg+xml,image/png,image/jpeg,image/webp"
                      hint="SVG or PNG, transparent background."
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
                      hint="Shown in the footer and as the subtitle at the top of the About page."
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
                            error={errors[`value-${v.id}`]}
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
                    error={errors.city}
                    disabled={disabled}
                  />
                  <Field
                    label="Province"
                    value={form.province}
                    onChange={(v) => set("province", v)}
                    error={errors.province}
                    disabled={disabled}
                  />
                  <Field
                    label="Postal code"
                    value={form.postalCode}
                    onChange={(v) => set("postalCode", v)}
                    error={errors.postalCode}
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
                    error={errors.whatsapp}
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
                    <TextAreaField
                      label="Business hours"
                      value={form.businessHours}
                      onChange={(v) => set("businessHours", v)}
                      rows={4}
                      error={errors.businessHours}
                      disabled={disabled}
                      hint="One row per line, written as: Label: hours. Example: Monday - Friday: 08:00 - 17:00 WIB"
                    />
                  </div>
                </div>
              </Panel>
            )}

            {tab === "social" && (
              <Panel
                title="Social media"
                description="Links shown as icons in the website footer. Leave a field empty to hide that icon."
              >
                <div className="grid gap-5 lg:grid-cols-2">
                  <Field
                    label="Facebook"
                    value={form.facebook}
                    onChange={(v) => set("facebook", v)}
                    error={errors.facebook}
                    disabled={disabled}
                    placeholder="https://facebook.com/your-page"
                  />
                  <Field
                    label="Instagram"
                    value={form.instagram}
                    onChange={(v) => set("instagram", v)}
                    error={errors.instagram}
                    disabled={disabled}
                    placeholder="https://instagram.com/your-account"
                  />
                  <Field
                    label="LinkedIn"
                    value={form.linkedin}
                    onChange={(v) => set("linkedin", v)}
                    error={errors.linkedin}
                    disabled={disabled}
                    placeholder="https://linkedin.com/company/your-company"
                  />
                  <Field
                    label="YouTube"
                    value={form.youtube}
                    onChange={(v) => set("youtube", v)}
                    error={errors.youtube}
                    disabled={disabled}
                    placeholder="https://youtube.com/@your-channel"
                  />
                </div>
              </Panel>
            )}

            {tab === "location" && (
              <Panel
                title="Location details"
                description="Paste a Google Maps link and the map and coordinates are filled in for you."
              >
                <div className="grid gap-5">
                  <div>
                    <TextAreaField
                      label="Google Maps link"
                      value={mapInput}
                      onChange={handleMapInput}
                      rows={2}
                      disabled={disabled}
                      placeholder="https://www.google.com/maps/place/... or https://maps.app.goo.gl/..."
                      hint="In Google Maps open your place, press Share, then Copy link. A normal link, a short maps.app.goo.gl link or the embed code all work."
                    />
                    {mapStatus && (
                      <p
                        className={`mt-2 text-sm ${
                          mapStatus.kind === "error"
                            ? "text-destructive"
                            : mapStatus.kind === "ok"
                              ? "text-success"
                              : "text-muted-foreground"
                        }`}
                      >
                        {mapStatus.text}
                      </p>
                    )}
                    <p className="mt-2 break-all text-xs text-muted-foreground">
                      Saved map: {form.mapEmbed || "none"}
                    </p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Latitude"
                      value={form.latitude}
                      onChange={(v) => setCoordinate("latitude", v)}
                      error={errors.latitude}
                      disabled={disabled}
                      placeholder="1.0451"
                    />
                    <Field
                      label="Longitude"
                      value={form.longitude}
                      onChange={(v) => setCoordinate("longitude", v)}
                      error={errors.longitude}
                      disabled={disabled}
                      placeholder="104.0305"
                    />
                  </div>
                </div>
              </Panel>
            )}

            {tab === "seo" && (
              <Panel
                title="Search engine optimisation"
                description="Title and description for the home page, and the defaults for pages without their own."
              >
                <div className="grid gap-5">
                  <Field
                    label="Meta title"
                    value={form.metaTitle}
                    onChange={(v) => set("metaTitle", v)}
                    error={errors.metaTitle}
                    hint={`${form.metaTitle.length} characters. About 60 or fewer displays fully on Google.`}
                    disabled={disabled}
                  />
                  <TextAreaField
                    label="Meta description"
                    value={form.metaDescription}
                    onChange={(v) => set("metaDescription", v)}
                    rows={3}
                    error={errors.metaDescription}
                    hint={`${form.metaDescription.length} characters. About 160 or fewer displays fully on Google.`}
                    disabled={disabled}
                  />
                  <TextAreaField
                    label="Keywords"
                    value={form.keywords}
                    onChange={(v) => set("keywords", v)}
                    error={errors.keywords}
                    rows={2}
                    hint="Separate keywords with commas."
                    disabled={disabled}
                  />
                  <div className="max-w-sm">
                    <UploadBox
                      label="Open Graph image"
                      fileName={form.ogImageName}
                      file={ogImageFile}
                      disabled={disabled}
                      onChange={(v) => set("ogImageName", v)}
                      onFileSelect={setOgImageFile}
                      accept="image/jpeg,image/png,image/webp"
                      hint="JPG, 1200 × 630 px."
                    />
                  </div>
                </div>
              </Panel>
            )}

            {tab === "document" && (
              <Panel
                title="Company profile document"
                description="Downloadable PDF offered on the About page."
              >
                {form.profilePdfName ? (
                  <div className="flex flex-col gap-4 border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center bg-muted text-destructive">
                        <FileText className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {displayFileName(form.profilePdfName)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF · {form.profilePdfSize} · updated {form.profilePdfUpdatedAt}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (/^https?:\/\//.test(form.profilePdfName)) {
                            window.open(form.profilePdfName, "_blank", "noopener,noreferrer");
                          } else if (profilePdfFile) {
                            const url = URL.createObjectURL(profilePdfFile);
                            window.open(url, "_blank", "noopener,noreferrer");
                          } else {
                            toast.info("Save the profile first to open the uploaded document.");
                          }
                        }}
                        className="btn-outline text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        Preview file
                      </button>
                      <label className="btn-outline cursor-pointer text-sm">
                        <Upload className="h-4 w-4" />
                        Replace
                        <input
                          type="file"
                          accept="application/pdf"
                          disabled={disabled}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setProfilePdfFile(file);
                            set("profilePdfName", file.name);
                            set("profilePdfSize", `${(file.size / 1024 / 1024).toFixed(1)} MB`);
                            set("profilePdfUpdatedAt", new Date().toLocaleDateString("en-GB"));
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          setProfilePdfFile(null);
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
                      <label className="btn-primary cursor-pointer text-sm">
                        <Upload className="h-4 w-4" />
                        Upload PDF
                        <input
                          type="file"
                          accept="application/pdf"
                          disabled={disabled}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setProfilePdfFile(file);
                            set("profilePdfName", file.name);
                            set("profilePdfSize", `${(file.size / 1024 / 1024).toFixed(1)} MB`);
                            set("profilePdfUpdatedAt", new Date().toLocaleDateString("en-GB"));
                          }}
                        />
                      </label>
                    }
                  />
                )}
              </Panel>
            )}

            {tab === "milestones" && (
              <Panel
                title="Company milestones"
                description="Shown as the company timeline on the About page. Only active milestones are shown."
                action={
                  <button
                    type="button"
                    onClick={() => openMilestone(emptyMilestone((milestones?.length ?? 0) + 1))}
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
                              Order {m.order} · {m.image ? "with image" : "no image"}
                            </p>
                          </div>
                          {m.image && (
                            <img
                              src={m.image}
                              alt=""
                              className="h-12 w-16 shrink-0 border border-border object-cover"
                            />
                          )}
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
                              onClick={() => openMilestone({ ...m })}
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
                  </>
                )}
              </Panel>
            )}
            <TabPreview
              tab={tab}
              form={form}
              milestones={milestones}
              assets={{ logo: logoUrl, ogImage: ogImageUrl, pdf: pdfUrl }}
            />
          </div>
        )}
      </div>

      {/* Milestone editor */}
      <Dialog open={!!milestoneDraft} onOpenChange={(o) => !o && setMilestoneDraft(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto overflow-x-hidden rounded-none">
          <DialogHeader>
            <DialogTitle>{milestoneDraft?.id ? "Edit milestone" : "Add milestone"}</DialogTitle>
          </DialogHeader>
          {milestoneDraft && (
            <div className="grid min-w-0 grid-cols-1 gap-4">
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
                  onChange={(v) =>
                    setMilestoneDraft({
                      ...milestoneDraft,
                      order: Number(v) || 0,
                    })
                  }
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
              <UploadBox
                label="Milestone image (optional)"
                fileName={milestoneDraft.image}
                file={milestoneImageFile}
                onChange={(v) => setMilestoneDraft({ ...milestoneDraft, image: v })}
                onFileSelect={setMilestoneImageFile}
                accept="image/jpeg,image/png,image/webp"
                hint="JPG, PNG or WebP."
              />
              <SelectField
                label="Status"
                value={milestoneDraft.active ? "Active" : "Inactive"}
                onChange={(v) =>
                  setMilestoneDraft({
                    ...milestoneDraft,
                    active: v === "Active",
                  })
                }
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

      {/* Live preview of the whole website content */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>Website preview</DialogTitle>
          </DialogHeader>
          {form && (
            <FullPreview
              form={form}
              milestones={milestones}
              assets={{ logo: logoUrl, ogImage: ogImageUrl, pdf: pdfUrl }}
            />
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
              “{deleteTarget?.year} | {deleteTarget?.title}” will be removed from the public
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

/** URL to preview a file: the just-picked upload, otherwise the stored URL. */
function useFileUrl(file: File | null, stored: string): string {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url || (/^https?:\/\//.test(stored) ? stored : "");
}

/** Last path segment of a stored file URL, decoded, or the name as-is. */
function displayFileName(value: string): string {
  if (!/^https?:\/\//.test(value)) return value;
  try {
    const last = new URL(value).pathname.split("/").filter(Boolean).pop() ?? value;
    return decodeURIComponent(last);
  } catch {
    return value;
  }
}

const IMAGE_URL = /\.(png|jpe?g|webp|gif|svg|ico)(\?.*)?$/i;

function UploadBox({
  label,
  fileName,
  file,
  onChange,
  onFileSelect,
  accept,
  hint,
  disabled,
}: {
  label: string;
  fileName: string;
  /** The File picked in this session (not yet saved), used for the preview. */
  file?: File | null;
  onChange: (v: string) => void;
  onFileSelect?: (file: File | null) => void;
  accept?: string;
  hint?: string;
  disabled?: boolean;
}) {
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setLocalUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setLocalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const previewUrl =
    localUrl ?? (/^https?:\/\//.test(fileName) && IMAGE_URL.test(fileName) ? fileName : null);

  return (
    <div className="min-w-0">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      <div className="mt-2 flex items-center gap-3 border border-dashed border-border bg-muted/40 p-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden bg-surface text-secondary">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-full w-full object-contain" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {fileName ? displayFileName(fileName) : "No file selected"}
          </p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {fileName ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange("");
              onFileSelect?.(null);
            }}
            className="border border-border bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-muted disabled:opacity-50"
          >
            Remove
          </button>
        ) : (
          <label className="cursor-pointer border border-border bg-surface px-3 py-2 text-xs font-semibold text-primary hover:bg-muted">
            Choose
            <input
              type="file"
              accept={accept}
              disabled={disabled}
              className="hidden"
              onChange={(e) => {
                const picked = e.target.files?.[0];
                if (picked) {
                  onChange(picked.name);
                  onFileSelect?.(picked);
                }
                // Allow picking the same file again after removing it.
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}
