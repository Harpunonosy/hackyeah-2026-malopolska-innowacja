/**
 * Pomiar trafności Swatki na data/swatka_zestaw_testowy.json (30 zapytań).
 * Metryki: Hit@3, Hit@5, MRR oraz poprawne oznaczenie braku dopasowania.
 *
 *   npx tsx scripts/eval-swatka.ts --lex            # tylko wyszukiwanie awaryjne, bez API
 *   npx tsx --env-file=.env.local scripts/eval-swatka.ts          # pełny potok z AI
 *   ... --limit 5                                   # tylko 5 pierwszych zapytań
 */
import { mkdirSync, writeFileSync } from "node:fs";
import zestaw from "../data/swatka_zestaw_testowy.json";
import { dopasuj } from "../lib/swatka";
import { szukaj } from "../lib/szukaj";

type Zapytanie = { id: string; typ: string; zapytanie: string; oczekiwane: string[] };

const args = process.argv.slice(2);
const tylkoLeksykalnie = args.includes("--lex");
const limit = Number(args[args.indexOf("--limit") + 1]) || Infinity;
const zapytania = (zestaw.zapytania as Zapytanie[]).slice(0, limit);

async function main() {
  const wiersze = [];
  const koszt = { wejscie: 0, wyjscie: 0, cacheZapis: 0, cacheOdczyt: 0 };
  for (const z of zapytania) {
    let ids: string[];
    let brak = false;
    let czas = 0;
    let tryb = "lex";
    if (tylkoLeksykalnie) {
      const t0 = Date.now();
      const trafienia = szukaj(z.zapytanie, 10).filter((t) => t.wynik >= 0.25);
      czas = Date.now() - t0;
      ids = trafienia.map((t) => t.id);
      brak = ids.length === 0;
    } else {
      const w = await dopasuj({ tekst: z.zapytanie, rola: "mieszkaniec", jezyk: "pl" });
      ids = w.dopasowania.map((d) => d.id);
      brak = w.brakDopasowania;
      czas = w.metryki.czasMs;
      tryb = w.tryb;
      if (w.metryki.uzycie) {
        koszt.wejscie += w.metryki.uzycie.wejscie;
        koszt.wyjscie += w.metryki.uzycie.wyjscie;
        koszt.cacheZapis += w.metryki.uzycie.cacheZapis;
        koszt.cacheOdczyt += w.metryki.uzycie.cacheOdczyt;
      }
    }
    const oczek = new Set(z.oczekiwane);
    const rangi = ids.map((id, i) => (oczek.has(id) ? i + 1 : 0)).filter(Boolean);
    const pierwsza = rangi[0] ?? 0;
    wiersze.push({
      id: z.id, typ: z.typ, zapytanie: z.zapytanie, oczekiwane: z.oczekiwane, zwrocone: ids.slice(0, 5),
      hit3: oczek.size > 0 && pierwsza > 0 && pierwsza <= 3,
      hit5: oczek.size > 0 && pierwsza > 0 && pierwsza <= 5,
      rr: oczek.size > 0 && pierwsza > 0 ? 1 / pierwsza : 0,
      brakOczekiwany: oczek.size === 0, brakZwrocony: brak, czasMs: czas, tryb,
    });
    const znak = oczek.size === 0 ? (brak ? "OK " : "BŁĄD") : pierwsza && pierwsza <= 3 ? "OK " : "MISS";
    console.log(`${z.id} ${znak} ${String(czas).padStart(6)} ms  ${z.zapytanie.slice(0, 60)}${znak === "MISS" ? `\n      oczekiwane: ${z.oczekiwane.join(", ")}\n      zwrócone:   ${ids.slice(0, 5).join(", ")}` : ""}`);
  }

  const z_wynikiem = wiersze.filter((w) => !w.brakOczekiwany);
  const n = z_wynikiem.length;
  const pct = (x: number) => `${((100 * x) / n).toFixed(1)}%`;
  const hit3 = z_wynikiem.filter((w) => w.hit3).length;
  const hit5 = z_wynikiem.filter((w) => w.hit5).length;
  const mrr = z_wynikiem.reduce((s, w) => s + w.rr, 0) / n;
  const bez = wiersze.filter((w) => w.brakOczekiwany);
  const bezOk = bez.filter((w) => w.brakZwrocony).length;
  const czasSr = Math.round(wiersze.reduce((s, w) => s + w.czasMs, 0) / wiersze.length);
  console.log(`\nTryb: ${tylkoLeksykalnie ? "tylko wyszukiwanie awaryjne" : "pełny potok z AI"}; zapytań z oczekiwanym wynikiem: ${n}`);
  console.log(`Hit@3 ${pct(hit3)} (${hit3}/${n}) | Hit@5 ${pct(hit5)} (${hit5}/${n}) | MRR ${mrr.toFixed(3)}`);
  console.log(`Brak dopasowania poprawnie wykryty: ${bezOk}/${bez.length} | średni czas ${czasSr} ms`);
  if (!tylkoLeksykalnie) console.log("Tokeny:", JSON.stringify(koszt));

  mkdirSync("docs/eval", { recursive: true });
  const nazwa = `docs/eval/swatka-${tylkoLeksykalnie ? "lex" : process.env.AI_MODEL || "ai"}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.json`;
  writeFileSync(nazwa, JSON.stringify({ hit3: hit3 / n, hit5: hit5 / n, mrr, wiersze, koszt }, null, 1));
  console.log("Zapisano", nazwa);
}

main();
