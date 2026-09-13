import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

type Props = { children: ReactNode; transparentHeader?: boolean };

export function SiteLayout({ children, transparentHeader = false }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader transparentOnTop={transparentHeader} />
      <main className={transparentHeader ? "" : "pt-16 md:pt-20"}>{children}</main>
      <SiteFooter />
    </div>
  );
}
