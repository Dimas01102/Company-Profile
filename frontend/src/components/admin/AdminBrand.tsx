export function AdminBrand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-accent text-sm font-bold text-accent-foreground">
        BK
      </div>
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-primary-foreground">
            Batam Konektra Jaya
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/60">
            Admin Console
          </p>
        </div>
      )}
    </div>
  );
}
