import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAdminUser } from "@/components/admin/admin-context";
import {
  Panel,
  Field,
  TextAreaField,
  ErrorState,
  FormSkeleton,
  Notice,
} from "@/components/admin/ui";
import { getSettings, updateSettings, type WebsiteSettings } from "@/lib/settings-service";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Website Settings — Konektra Admin Console" },
      {
        name: "description",
        content: "Configure the homepage and footer of the PT Batam Konektra Jaya website.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SettingsPage,
});

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 border border-border p-4">
      <span>
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>
      </span>
      <span className="relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-5 w-9 bg-muted transition-colors peer-checked:bg-secondary" />
        <span className="absolute left-0.5 h-4 w-4 -translate-y-1/2 top-1/2 bg-white transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

function SettingsPage() {
  const user = useAdminUser();
  const [saved, setSaved] = useState<WebsiteSettings | null>(null);
  const [draft, setDraft] = useState<WebsiteSettings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function load() {
    setLoadError(false);
    setSaved(null);
    setDraft(null);
    getSettings()
      .then((s) => {
        setSaved(s);
        setDraft(s);
      })
      .catch(() => setLoadError(true));
  }

  useEffect(load, []);

  const dirty = !!draft && !!saved && JSON.stringify(draft) !== JSON.stringify(saved);

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function validate(d: WebsiteSettings) {
    const e: Record<string, string> = {};
    if (!d.heroTitle.trim()) e.heroTitle = "Hero title is required.";
    if (!d.heroCtaText.trim()) e.heroCtaText = "CTA text is required.";
    if (!d.heroCtaUrl.trim()) e.heroCtaUrl = "CTA URL is required.";
    if (!d.copyrightText.trim()) e.copyrightText = "Copyright text is required.";
    d.footerLinks.forEach((link, i) => {
      if (!link.label.trim()) e[`footerLink-${i}-label`] = "Link label is required.";
      if (!link.url.trim()) e[`footerLink-${i}-url`] = "Link URL is required.";
    });
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
    try {
      const updated = await updateSettings(draft);
      setSaved(updated);
      setDraft(updated);
      toast.success("Settings saved.");
    } catch {
      toast.error("Could not save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function cancel() {
    if (!saved) return;
    setDraft(saved);
    setErrors({});
  }

  function addFooterLink() {
    if (!draft) return;
    setDraft({
      ...draft,
      footerLinks: [...draft.footerLinks, { id: `fl-${Date.now()}`, label: "", url: "" }],
    });
  }

  function updateFooterLink(id: string, patch: Partial<{ label: string; url: string }>) {
    if (!draft) return;
    setDraft({
      ...draft,
      footerLinks: draft.footerLinks.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  }

  function removeFooterLink(id: string) {
    if (!draft) return;
    setDraft({ ...draft, footerLinks: draft.footerLinks.filter((l) => l.id !== id) });
  }

  return (
    <>
      <AdminHeader user={user} title="Website Settings" subtitle="Homepage content and footer" />

      <div className="space-y-6 p-5 lg:p-8">
        {dirty && (
          <Notice kind="error">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> You have unsaved changes. Save before leaving
              this page or they will be lost.
            </span>
          </Notice>
        )}

        {loadError && <ErrorState message="We could not load website settings." onRetry={load} />}
        {!loadError && !draft && <FormSkeleton rows={4} />}

        {!loadError && draft && (
          <>
            <Panel
              title="Homepage — Hero"
              description="The main banner shown at the top of the homepage."
            >
              <div className="space-y-4">
                <Field
                  label="Hero title"
                  value={draft.heroTitle}
                  error={errors.heroTitle}
                  onChange={(v) => setDraft({ ...draft, heroTitle: v })}
                />
                <TextAreaField
                  label="Hero subtitle"
                  value={draft.heroSubtitle}
                  rows={2}
                  onChange={(v) => setDraft({ ...draft, heroSubtitle: v })}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="CTA text"
                    value={draft.heroCtaText}
                    error={errors.heroCtaText}
                    onChange={(v) => setDraft({ ...draft, heroCtaText: v })}
                  />
                  <Field
                    label="CTA URL"
                    value={draft.heroCtaUrl}
                    error={errors.heroCtaUrl}
                    onChange={(v) => setDraft({ ...draft, heroCtaUrl: v })}
                  />
                </div>
              </div>
            </Panel>

            <Panel
              title="Homepage — Section visibility"
              description="Show or hide sections on the public homepage."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle
                  label="Stats bar"
                  description="Key company figures below the hero."
                  checked={draft.showStats}
                  onChange={(v) => setDraft({ ...draft, showStats: v })}
                />
                <Toggle
                  label="Why Choose Us"
                  description="Value proposition highlights."
                  checked={draft.showWhyChooseUs}
                  onChange={(v) => setDraft({ ...draft, showWhyChooseUs: v })}
                />
                <Toggle
                  label="Featured products"
                  description="Highlighted catalog items."
                  checked={draft.showFeaturedProducts}
                  onChange={(v) => setDraft({ ...draft, showFeaturedProducts: v })}
                />
                <Toggle
                  label="Latest news"
                  description="Most recent published articles."
                  checked={draft.showLatestNews}
                  onChange={(v) => setDraft({ ...draft, showLatestNews: v })}
                />
                <Toggle
                  label="Final call-to-action"
                  description="Closing banner before the footer."
                  checked={draft.showFinalCta}
                  onChange={(v) => setDraft({ ...draft, showFinalCta: v })}
                />
              </div>
            </Panel>

            <Panel
              title="Footer"
              description="Content and links shown in the site footer."
              action={
                <button type="button" onClick={addFooterLink} className="btn-outline text-sm">
                  <Plus className="h-4 w-4" /> Add link
                </button>
              }
            >
              <div className="space-y-4">
                <TextAreaField
                  label="Footer description"
                  value={draft.footerDescription}
                  rows={2}
                  onChange={(v) => setDraft({ ...draft, footerDescription: v })}
                />
                <Field
                  label="Copyright text"
                  value={draft.copyrightText}
                  error={errors.copyrightText}
                  onChange={(v) => setDraft({ ...draft, copyrightText: v })}
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">Footer links</p>
                  <div className="mt-2 space-y-2">
                    {draft.footerLinks.length === 0 && (
                      <p className="text-xs text-muted-foreground">No footer links yet.</p>
                    )}
                    {draft.footerLinks.map((link, i) => (
                      <div
                        key={link.id}
                        className="flex flex-wrap items-start gap-2 sm:flex-nowrap"
                      >
                        <div className="w-full sm:w-1/3">
                          <input
                            value={link.label}
                            placeholder="Label"
                            onChange={(e) => updateFooterLink(link.id, { label: e.target.value })}
                            className={`h-10 w-full border bg-background px-3 text-sm outline-none focus:border-secondary ${
                              errors[`footerLink-${i}-label`]
                                ? "border-destructive"
                                : "border-input"
                            }`}
                          />
                        </div>
                        <div className="w-full flex-1">
                          <input
                            value={link.url}
                            placeholder="/path or https://..."
                            onChange={(e) => updateFooterLink(link.id, { url: e.target.value })}
                            className={`h-10 w-full border bg-background px-3 text-sm outline-none focus:border-secondary ${
                              errors[`footerLink-${i}-url`] ? "border-destructive" : "border-input"
                            }`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFooterLink(link.id)}
                          aria-label={`Remove ${link.label || "footer link"}`}
                          className="btn-icon text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={cancel}
                disabled={!dirty || saving}
                className="btn-outline text-sm"
              >
                <RotateCcw className="h-4 w-4" /> Reset
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
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
