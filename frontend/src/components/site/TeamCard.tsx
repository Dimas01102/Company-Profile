import { useState } from "react";
import { ArrowRight, Linkedin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PublicTeamMember } from "@/lib/public-data";

function Photo({ m, className }: { m: PublicTeamMember; className?: string }) {
  return m.photo ? (
    <img src={m.photo} alt={m.name} loading="lazy" className={className} />
  ) : (
    <div className="grid h-full w-full place-items-center text-3xl font-bold text-muted-foreground">
      {m.name.charAt(0)}
    </div>
  );
}

/** Team card with a profile dialog. Shared by the Home and About pages. */
export function TeamCard({
  member: m,
  showBio = false,
}: {
  member: PublicTeamMember;
  showBio?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <article className="group bg-card">
        <div className="aspect-4/5 overflow-hidden bg-muted">
          <Photo
            m={m}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="border-x border-b border-border p-5">
          <h3 className="text-base font-semibold text-foreground">{m.name}</h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-secondary">
            {m.position}
          </p>
          {showBio && m.bio && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.bio}</p>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary"
          >
            View profile
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </article>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{m.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden bg-muted">
                <Photo m={m} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary">{m.position}</p>
                {m.department && (
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {m.department}
                  </p>
                )}
              </div>
            </div>
            {(m.fullBio || m.bio) && (
              <p className="text-sm leading-relaxed text-muted-foreground">{m.fullBio || m.bio}</p>
            )}
            {m.responsibilities.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Responsibilities
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {m.responsibilities.map((r, i) => (
                    <li key={i} className="border-l-2 border-accent pl-3">
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {m.experience.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Career experience
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {m.experience.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            )}
            {m.linkedin && (
              <a
                href={m.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn profile
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
