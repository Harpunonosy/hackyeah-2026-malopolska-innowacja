import kondycja from "@/data/kondycja_malopolski.json";
import type { ObszarId } from "./obszary";

export type Fakt = { tekst: string; zrodlo: string; strona: number | null };

type SurowyFakt = { temat: string; tekst: string; zrodlo: string; strona?: number | null };

const ZRODLA: Record<string, string> = {
  diagnoza_2025: "Diagnoza ROPS 2025",
  przewodnik_2019: "Przewodnik po innowacjach społecznych, ROPS 2019",
  gus_prognoza: "GUS, prognoza demograficzna",
  nik_2025: "NIK 2025",
};

const TEMATY_OBSZARU: Record<ObszarId, string[]> = {
  seniorzy: ["seniorzy", "usługi opiekuńcze", "dzienna opieka", "opiekunowie rodzinni", "demografia"],
  zdrowie: ["usługi opiekuńcze", "opiekunowie rodzinni"],
  niepelnosprawnosc: ["opiekunowie rodzinni", "dzienna opieka"],
  zdrowie_psychiczne: ["zdrowie psychiczne", "kryzys"],
  rodzina_piecza: ["dzieci", "rodzina"],
  bezdomnosc: ["bezdomność", "mieszkalnictwo"],
  ubostwo: ["wykluczenie cyfrowe"],
  cudzoziemcy: ["wykluczenie cyfrowe"],
};

export function faktyDlaObszaru(obszar: ObszarId, limit = 2): Fakt[] {
  const tematy = TEMATY_OBSZARU[obszar];
  return (kondycja.fakty as SurowyFakt[])
    .filter((f) => tematy.includes(f.temat))
    .slice(0, limit)
    .map((f) => ({ tekst: f.tekst, zrodlo: ZRODLA[f.zrodlo] ?? f.zrodlo, strona: f.strona ?? null }));
}
