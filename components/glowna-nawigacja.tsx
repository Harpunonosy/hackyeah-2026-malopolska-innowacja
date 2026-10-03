"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function GlownaNawigacja({ etykieta, linki }: { etykieta: string; linki: { href: string; etykieta: string }[] }) {
  const sciezka = usePathname();
  return (
    <nav aria-label={etykieta}>
      <ul className="flex flex-wrap gap-1">
        {linki.map((l) => {
          const aktywny = l.href === "/" ? sciezka === "/" : sciezka.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={aktywny ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-12 items-center rounded-full px-4 font-semibold no-underline transition-colors",
                  aktywny ? "bg-fg text-bg" : "text-fg hover:bg-soft",
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
