import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import { faqs, submitContact } from "@/lib/mock-data";
import { getPublicCompany } from "@/lib/public-data";

export const Route = createFileRoute("/contact")({
  loader: async () => ({ company: await getPublicCompany() }),
  head: () => ({
    meta: [
      { title: "Contact | PT Batam Konektra Jaya" },
      {
        name: "description",
        content:
          "Talk to Konektra's sales and engineering team, send a message, call, or reach us on WhatsApp.",
      },
    ],
  }),
  component: ContactPage,
});

type Status = "idle" | "sending" | "sent" | "error";

function ContactPage() {
  const { company } = Route.useLoaderData();
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus("sending");
    try {
      const form = new FormData(formEl);
      // Simulate network with an artificial delay so users see the loading state.
      await new Promise((r) => setTimeout(r, 800));
      const res = await submitContact(Object.fromEntries(form.entries()));
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
      formEl.reset();
      setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    }
  }

  const whatsappHref = `https://wa.me/${company.whatsappNumber}?text=${encodeURIComponent(
    "Hello Konektra, I'd like to inquire about your products.",
  )}`;

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Contact Us"
        title="Talk to our sales and engineering team."
        description="Send us a message about your project. Our team replies within one business day, or reach us instantly via WhatsApp."
      />
      <Breadcrumb items={[{ label: "Contact" }]} />

      {/* Quick contact cards */}
      <section className="bg-background py-12 md:py-16">
        <div className="container-page grid gap-4 md:grid-cols-3">
          <QuickCard
            icon={Phone}
            label="Call sales"
            value={company.phone}
            href={`tel:${company.phone.replace(/\s/g, "")}`}
          />
          <QuickCard
            icon={MessageCircle}
            label="WhatsApp"
            value={company.whatsapp}
            href={whatsappHref}
            accent
          />
          <QuickCard
            icon={Mail}
            label="Email us"
            value={company.email}
            href={`mailto:${company.email}`}
          />
        </div>
      </section>

      {/* Info + Form */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="eyebrow">Company Information</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">Get in touch</h2>
              <p className="mt-3 text-muted-foreground">
                Our headquarters and manufacturing facility in Batam serve customers across
                Indonesia and Southeast Asia.
              </p>
            </div>

            <InfoRow icon={MapPin} label="Head Office" value={company.address} />
            <InfoRow icon={Phone} label="Phone" value={company.phone} />
            <InfoRow icon={Mail} label="Email" value={company.email} />

            {company.hoursDetail.length > 0 && (
              <div className="border-l-2 border-accent bg-card p-5">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-secondary" />
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Business Hours
                  </div>
                </div>
                <ul className="mt-4 divide-y divide-border text-sm">
                  {company.hoursDetail.map((h, i) => (
                    <li
                      key={`${h.day}-${i}`}
                      className="flex items-center justify-between gap-4 py-2"
                    >
                      <span className="text-muted-foreground">{h.day}</span>
                      {h.hours && <span className="font-semibold text-foreground">{h.hours}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="bg-card p-8 shadow-(--shadow-card) md:p-10"
            noValidate
          >
            <h2 className="text-2xl font-bold text-primary">Send a message</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              All fields are required. We respond within one business day.
            </p>

            {status === "sent" && (
              <div className="mt-6 flex items-start gap-3 border border-[oklch(0.5_0.15_145/0.3)] bg-[oklch(0.95_0.05_145)] p-4 text-sm text-[oklch(0.35_0.13_145)]">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Message sent successfully</p>
                  <p className="mt-0.5">
                    Thanks, our sales team will get back to you within one business day.
                  </p>
                </div>
              </div>
            )}
            {status === "error" && (
              <div className="mt-6 flex items-start gap-3 border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Something went wrong</p>
                  <p className="mt-0.5">
                    Please try again in a moment, or reach us directly on WhatsApp.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field name="name" label="Full name" required />
              <Field name="company" label="Company" required />
              <Field name="email" type="email" label="Work email" required />
              <Field name="phone" label="Phone" required />
            </div>
            <Field name="subject" label="Subject" required className="mt-4" />
            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Message
              </label>
              <textarea
                name="message"
                required
                rows={5}
                placeholder="Tell us about your project, required capacity, timeline, and location…"
                className="mt-1.5 w-full border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-primary mt-6 disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </section>

      {/* Map */}
      <section className="border-t border-border bg-background">
        <div className="container-page py-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Visit Us</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">Our headquarters in Batam</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{company.address}</p>
            </div>
            <a
              href={company.mapsLink}
              target="_blank"
              rel="noreferrer"
              className="btn-outline hidden sm:inline-flex"
            >
              Open in Google Maps
            </a>
          </div>
          {company.mapEmbed && (
            <div className="aspect-video w-full overflow-hidden border border-border bg-muted">
              <iframe
                title="Konektra headquarters map"
                src={company.mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
              />
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">Frequently asked questions</h2>
            <p className="mt-3 text-muted-foreground">
              Quick answers to what customers commonly ask before starting a project.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-3xl divide-y divide-border border border-border bg-card">
            {faqs.map((f, i) => (
              <FaqRow key={f.question} item={f} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp floating button */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.7_0.17_150)] text-white shadow-[0_12px_30px_-8px_rgb(0,0,0,0.3)] transition-transform hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </SiteLayout>
  );
}

function QuickCard({
  icon: Icon,
  label,
  value,
  href,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className={[
        "group flex items-center gap-4 border p-6 transition-all",
        accent
          ? "border-accent bg-accent/10 hover:bg-accent/20"
          : "border-border bg-card hover:border-primary hover:shadow-(--shadow-card-hover)",
      ].join(" ")}
    >
      <span
        className={[
          "grid h-12 w-12 place-items-center rounded-md",
          accent ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground",
        ].join(" ")}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-0.5 truncate text-base font-bold text-foreground">{value}</div>
      </div>
    </a>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4 border-l-2 border-accent bg-card p-5">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 text-sm text-foreground">{value}</div>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  className = "",
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1.5 w-full border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary/20"
      />
    </div>
  );
}

function FaqRow({
  item,
  defaultOpen = false,
}: {
  item: { question: string; answer: string };
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span className="text-sm font-semibold text-foreground md:text-base">{item.question}</span>
        <ChevronDown
          className={[
            "h-5 w-5 shrink-0 text-secondary transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{item.answer}</div>
      )}
    </div>
  );
}
