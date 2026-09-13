type Props = { eyebrow?: string; title: string; description?: string };

export function PageHero({ eyebrow, title, description }: Props) {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container-page py-16 md:py-24">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-primary-foreground md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
