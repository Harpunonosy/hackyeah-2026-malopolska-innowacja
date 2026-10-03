// Kontekst do wyników Swatki: zanonimizowane podobne sprawy i "co pomogło innym".
// Prywatność: pokazujemy tylko streszczenia (nie treść zgłoszeń), bez spraw kryzysowych i tylko gdy w obszarze jest co najmniej 5 spraw.
import { db } from "./db";
import { normalizujPowiat } from "./powiaty";

export type PodobnePrzypadki = {
  liczba: number;
  wTymPowiecie: number | null;
  zakres: string;
  przyklady: { streszczenie: string; powiat: string | null }[];
  demo: boolean;
};
export type CoPomoglo = { id: string; nazwa: string; pomoglo: number; demo: boolean }[];

const MIN_SPRAW = 5;

export async function podobnePrzypadki(obszar: string, powiat: string | undefined, potrzeby: string[], tagi: string[]): Promise<PodobnePrzypadki | null> {
  try {
    const p = normalizujPowiat(powiat);
    const tekst = potrzeby.join(" ").slice(0, 300);
    const { rows } = await db().query(
      `select streszczenie, powiat, syntetyczne,
              coalesce(cardinality(array(select unnest(tagi) intersect select unnest($3::text[]))), 0) as wspolne,
              similarity(coalesce(streszczenie,''), $2) as podobienstwo
       from zgloszenia
       where obszar=$1 and typ='problem' and not kryzys and streszczenie is not null and created_at > now() - interval '12 months'`,
      [obszar, tekst, tagi.map((t) => t.toLowerCase())],
    );
    const pasujace = rows.filter((r) => r.wspolne > 0 || r.podobienstwo > 0.14);
    const baza = pasujace.length >= MIN_SPRAW ? pasujace : rows.length >= MIN_SPRAW ? rows : [];
    if (baza.length < MIN_SPRAW) return null;
    const wPowiecie = p ? baza.filter((r) => r.powiat === p).length : null;
    const waga = (r: { wspolne: number; podobienstwo: number; powiat: string | null }) => r.wspolne + r.podobienstwo * 6 + (r.powiat === p ? 0.5 : 0);
    const unikalne = new Map<string, (typeof baza)[number]>();
    for (const r of [...baza].sort((a, b) => waga(b) - waga(a))) if (!unikalne.has(r.streszczenie)) unikalne.set(r.streszczenie, r);
    const najlepsze = [...unikalne.values()].slice(0, 3);
    return {
      liczba: baza.length,
      wTymPowiecie: wPowiecie !== null && wPowiecie >= MIN_SPRAW ? wPowiecie : null,
      zakres: pasujace.length >= MIN_SPRAW ? "o podobnym temacie" : "w tym obszarze",
      przyklady: najlepsze.map((r) => ({ streszczenie: r.streszczenie, powiat: r.powiat ? String(r.powiat).replace("powiat ", "") : null })),
      demo: baza.some((r) => r.syntetyczne),
    };
  } catch {
    return null;
  }
}

/** Rozwiązania, które mieszkańcy w tym obszarze najczęściej oznaczyli jako pomocne (od 3 reakcji). */
export async function coPomoglo(obszar: string, nazwy: Map<string, string>): Promise<CoPomoglo> {
  try {
    const { rows } = await db().query(
      `select innowacja_id, count(*) filter (where wartosc=1)::int as tak, bool_or(syntetyczne) as demo
       from reakcje where obszar=$1 group by innowacja_id having count(*) filter (where wartosc=1) >= 3 order by tak desc limit 3`,
      [obszar],
    );
    return rows.filter((r) => nazwy.has(r.innowacja_id)).map((r) => ({ id: r.innowacja_id, nazwa: nazwy.get(r.innowacja_id)!, pomoglo: r.tak, demo: r.demo }));
  } catch {
    return [];
  }
}
