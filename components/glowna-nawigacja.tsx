"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function GlownaNawigacja({ etykieta, linki }: { etykieta: string; linki: { href: string; etykieta: string }[] }) {
  const sciezka = usePathname();
  return (
    <nav aria-label={etykieta} className="w-full sm:w-auto">
      <ul className="grid grid-cols-2 gap-1 sm:flex sm:flex-wrap">
        {linki.map((l) => {
          const aktywny = l.href === "/" ? sciezka === "/" : sciezka.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={aktywny ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center justify-center rounded-xl px-3 sm:rounded-full sm:px-4 text-center font-semibold leading-tight no-underline transition-colors",
                  aktywny ? "bg-fg text-bg" : "bg-soft text-fg hover:bg-line-soft sm:bg-transparent sm:hover:bg-soft",
                )}
              >
                {l.etykieta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
