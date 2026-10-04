"use client";

import { useTrybProsty } from "@/components/a11y/tryb-prosty";

/** W trybie prostym chowa długą treść pod jednym przyciskiem. Nic nie znika: wystarczy rozwinąć. */
export function ZwijanePrzyProstym({ tytul, id, children }: { tytul: string; id?: string; children: React.ReactNode }) {
  const prosty = useTrybProsty();
  if (!prosty) return <>{children}</>;
  return (
    <details id={id} className="karta group">
      <summary className="flex min-h-14 cursor-pointer items-center rounded-[1.25rem] px-6 text-xl font-bold hover:bg-soft">{tytul}</summary>
      <div className="space-y-5 border-t border-line-soft p-4 sm:p-6">{children}</div>
    </details>
  );
}
