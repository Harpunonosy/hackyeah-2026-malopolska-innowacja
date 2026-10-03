"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUSY: [string, string][] = [["przeczytana", "Przeczytana"], ["w_ocenie", "W ocenie"], ["zaproszona_do_naboru", "Zaproś do naboru"], ["odrzucona", "Odrzuć"]];

export function StatusFiszki({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  return (
    <div role="group" aria-label="Zmień status pomysłu" className="flex flex-wrap gap-2">
      {STATUSY.map(([v, e]) => (
        <Button key={v} type="button" wariant="obrys" aria-pressed={status === v} className="aria-pressed:bg-fg aria-pressed:text-bg" onClick={async () => {
          await fetch(`/api/admin/fiszki/${id}/status`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: v }) });
          router.refresh();
        }}>{e}</Button>
      ))}
    </div>
  );
}

type Podsumowanie = { co_dziala: string[]; co_poprawic: string[]; cytaty: string[] };

export function PodsumujOpinie({ innowacjaId }: { innowacjaId: string }) {
  const [stan, setStan] = React.useState<"" | "pracuje" | "blad">("");
  const [p, setP] = React.useState<Podsumowanie | null>(null);
  return (
    <div className="space-y-3">
      {!p && (
        <Button type="button" wariant="zloty" disabled={stan === "pracuje"} onClick={async () => {
          setStan("pracuje");
          const r = await fetch("/api/admin/opinie/podsumowanie", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ innowacjaId }) });
          if (!r.ok) return setStan("blad");
          setP(await r.json());
          setStan("");
        }}>
          <Sparkles aria-hidden className="size-5" />
          {stan === "pracuje" ? "Podsumowuję…" : "Podsumuj opinie (AI)"}
        </Button>
      )}
      {stan === "blad" && <p role="alert" className="font-semibold text-primary">Nie udało się przygotować podsumowania.</p>}
      {p && (
        <div className="karta-mala grid gap-4 p-4 md:grid-cols-3" aria-live="polite">
          <div><p className="font-bold">Co działa</p><ul className="list-disc pl-5">{p.co_dziala.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><p className="font-bold">Co poprawić</p><ul className="list-disc pl-5">{p.co_poprawic.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><p className="font-bold">Cytaty</p><ul className="space-y-1">{p.cytaty.map((x) => <li key={x} className="italic">„{x}”</li>)}</ul><p className="mt-2 text-xs text-muted">Podsumowanie przygotowane z pomocą AI.</p></div>
        </div>
      )}
    </div>
  );
}
