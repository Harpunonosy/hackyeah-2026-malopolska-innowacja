"use client";

import * as React from "react";
import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { nazwaObszaru } from "@/lib/obszary";
import type { Luka } from "@/lib/radar";

type Szkic = { temat: string; uzasadnienie: string; grupa_docelowa: string; kierunki: string[]; wskazniki_rezultatu: string[]; blad?: string };

function Wiersz({ l }: { l: Luka }) {
  const [stan, setStan] = React.useState<"" | "laduje" | "gotowe" | "blad">("");
  const [szkic, setSzkic] = React.useState<Szkic | null>(null);

  async function utworz() {
    setStan("laduje");
    try {
      const r = await fetch("/api/admin/temat-naboru", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ powiat: l.powiat, obszar: l.obszar }) });
      if (!r.ok) return setStan("blad");
      setSzkic(await r.json());
      setStan("gotowe");
    } catch {
      setStan("blad");
    }
  }

  return (
    <li className="space-y-3 karta p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-xl font-bold">{l.powiat.replace("powiat ", "")}: {nazwaObszaru(l.obszar)}</h3>
        <Chip>{l.n} zgłoszeń bez rozwiązania</Chip>
        <Chip>średnie dopasowanie {l.srednia}/100</Chip>
        <Chip>wynik luki {l.wynik.toLocaleString("pl-PL")}</Chip>
      </div>
      <p className="flex flex-wrap gap-2">
        {l.tagi.map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </p>
      <p className="text-muted">Przykład: „{l.przyklad}”</p>
      {stan !== "gotowe" && (
        <Button type="button" wariant="zloty" onClick={utworz} disabled={stan === "laduje"}>
          <FilePlus2 aria-hidden className="size-5" />
          {stan === "laduje" ? "Asystent AI pisze szkic…" : "Utwórz temat naboru"}
        </Button>
      )}
      <p role="status" className="font-semibold text-primary">{stan === "blad" && "Nie udało się utworzyć szkicu. Spróbuj ponownie."}</p>
      {szkic && (
        <article className="space-y-3 rounded-xl border-4 border-accent p-4" aria-live="polite">
          <p className="text-sm font-semibold">Szkic tematu naboru przygotowany z pomocą AI. Zapisano jako przykładowy nabór (nieaktywny).</p>
          <h4 className="text-2xl font-bold">{szkic.temat}</h4>
          <p>{szkic.uzasadnienie}</p>
          <p><strong>Grupa docelowa:</strong> {szkic.grupa_docelowa}</p>
          <div>
            <strong>Przykładowe kierunki rozwiązań</strong>
            <ul className="list-disc pl-6">{szkic.kierunki.map((k) => <li key={k}>{k}</li>)}</ul>
          </div>
          <div>
            <strong>Wskaźniki rezultatu</strong>
            <ul className="list-disc pl-6">{szkic.wskazniki_rezultatu.map((k) => <li key={k}>{k}</li>)}</ul>
          </div>
        </article>
      )}
    </li>
  );
}

export function ListaLuk({ luki }: { luki: Luka[] }) {
  return <ul className="space-y-4">{luki.map((l) => <Wiersz key={`${l.powiat}-${l.obszar}`} l={l} />)}</ul>;
}
