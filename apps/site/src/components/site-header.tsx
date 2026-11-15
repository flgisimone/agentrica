"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NavDepartment = { code: string; name: string; slug: string };

const link = "inline-flex min-h-11 items-center rounded-lg px-3.5 text-[0.9375rem] font-medium text-muted-foreground hover:bg-muted hover:text-foreground";
// Pannelli con la Popover API: Esc e clic fuori li chiudono senza codice; un clic su un link li chiude a mano (navigazione client).
const panel = "m-0 rounded-xl border bg-popover p-2 text-popover-foreground shadow-card";
const close = (e: React.MouseEvent<HTMLElement>) => {
  if ((e.target as HTMLElement).closest("a")) e.currentTarget.hidePopover();
};

function DepartmentLinks({ departments, pathname }: { departments: readonly NavDepartment[]; pathname: string }) {
  return (
    <ul className="grid">
      {departments.map((d) => {
        const href = `/reparti/${d.slug}`;
        return (
          <li key={d.code} data-dept={d.code}>
            <Link
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className="grid min-h-11 grid-cols-[auto_1fr] items-center gap-x-3 rounded-lg px-3 py-2 hover:bg-muted aria-[current=page]:bg-muted"
            >
              <span aria-hidden className="row-span-2 size-2 rounded-full bg-dept" />
              <span className="font-mono text-xs font-bold text-dept">{d.code}</span>
              <span className="text-[0.9375rem]">{d.name}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Header comune a tutte le pagine: marchio, menu dei reparti, sezioni della landing; su mobile un pannello unico. */
export function SiteHeader({ departments }: { departments: readonly NavDepartment[] }) {
  const pathname = usePathname();

  return (
    <header
      style={{ viewTransitionName: "site-header" }}
      className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md"
    >
      <div className="wrap flex h-17 items-center gap-6">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 text-xl font-extrabold tracking-tight">
          <BrandMark className="size-7" />
          Agentrica
        </Link>

        <nav aria-label="Principale" className="ml-auto hidden items-center gap-1 md:flex">
          <button type="button" popoverTarget="menu-reparti" className={cn(link, "cursor-pointer gap-1")}>
            Reparti
            <ChevronDownIcon aria-hidden className="size-4" />
          </button>
          <div
            id="menu-reparti"
            popover="auto"
            onClick={close}
            className={cn(panel, "inset-auto top-19 right-[max(1rem,calc((100vw-76rem)/2))] w-88")}
          >
            <DepartmentLinks departments={departments} pathname={pathname} />
          </div>
          <Link href="/#metodo" className={link}>
            Come lavoriamo
          </Link>
        </nav>
        <Link href="/#mcp" className={cn(buttonVariants(), "hidden h-10 rounded-lg px-4 font-semibold md:inline-flex")}>
          Usa gli agenti
        </Link>

        <button
          type="button"
          popoverTarget="menu-mobile"
          aria-label="Apri il menu"
          className={cn(buttonVariants({ variant: "outline" }), "ml-auto size-11 md:hidden")}
        >
          <MenuIcon aria-hidden className="size-5" />
        </button>
        <div
          id="menu-mobile"
          popover="auto"
          onClick={close}
          className={cn(panel, "inset-x-4 top-19 max-h-[calc(100dvh-6rem)] overflow-y-auto md:hidden")}
        >
          <nav aria-label="Menu">
            <div className="flex items-center justify-between px-3 pt-1">
              <p className="eyebrow">Reparti</p>
              <button
                type="button"
                popoverTarget="menu-mobile"
                popoverTargetAction="hide"
                aria-label="Chiudi il menu"
                className="grid size-11 cursor-pointer place-items-center rounded-lg hover:bg-muted"
              >
                <XIcon aria-hidden className="size-5" />
              </button>
            </div>
            <DepartmentLinks departments={departments} pathname={pathname} />
            <div className="mt-2 grid border-t pt-2">
              <Link href="/#metodo" className={link}>
                Come lavoriamo
              </Link>
              <Link href="/#mcp" className={link}>
                Server MCP
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
