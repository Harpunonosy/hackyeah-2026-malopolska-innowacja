import raw from "@/data/zrodla/biblioteka_innowacji_rops.json";

type Surowa = {
  id: string;
  kategoria: string;
  nazwa: string;
  na_czym_polega: string;
  problem: string;
  grupa_docelowa: string;
  kto_moze_skorzystac: string;
  czy_to_dziala: string;
  autor_organizacja?: string;
  upowszechniana_w_projekcie: string[];
  film: string[];
  folder_pdf: string[];
  materialy_zip: string[];
  url: string;
};

export type Innowacja = {
  id: string;
  nazwa: string;
  kategoria: string;
  naCzymPolega: string;
  problem: string;
  grupaDocelowa: string;
  ktoMozeSkorzystac: string;
  czyToDziala: string;
  autor: string;
  upowszechnianaW: string[];
  film: string[];
  folderPdf: string[];
  materialyZip: string[];
  url: string;
};

const spacje = (s: string) => s.replace(/\s+/g, " ").trim();

export function skroc(s: string, max: number): string {
  const t = spacje(s);
  if (t.length <= max) return t;
  return t.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export const innowacje: Innowacja[] = (raw as unknown as Surowa[])
  .map((r) => ({
    id: r.id,
    nazwa: spacje(r.nazwa),
    kategoria: r.kategoria,
    naCzymPolega: r.na_czym_polega.trim(),
    problem: r.problem.trim(),
    grupaDocelowa: r.grupa_docelowa.trim(),
    ktoMozeSkorzystac: r.kto_moze_skorzystac.trim(),
    czyToDziala: r.czy_to_dziala.trim(),
    autor: r.autor_organizacja ?? "",
    upowszechnianaW: r.upowszechniana_w_projekcie ?? [],
    film: r.film ?? [],
    folderPdf: r.folder_pdf ?? [],
    materialyZip: r.materialy_zip ?? [],
    url: r.url,
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

export const innowacjaPoId = new Map(innowacje.map((i) => [i.id, i]));

export const INNOWACJE_IDS = innowacje.map((i) => i.id) as [string, ...string[]];

export const KATEGORIE = [...new Set(innowacje.map((i) => i.kategoria))].sort((a, b) => a.localeCompare(b, "pl"));

// Katalog do promptu. Deterministyczny (stała kolejność i długości), żeby cache promptu się trafiał.
export function katalogDoPromptu(lista: Innowacja[] = innowacje): string {
  return lista
    .map((i) =>
      [
        i.id,
        i.nazwa,
        i.kategoria,
        skroc(i.naCzymPolega, 260),
        skroc(i.problem, 200),
        skroc(i.grupaDocelowa, 140),
        skroc(i.ktoMozeSkorzystac, 120),
      ].join(" | "),
    )
    .join("\n");
}
