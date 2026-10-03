// Sieć liderów innowacji (PDF §9): autorzy innowacji z Biblioteki ROPS, organizacje, które dołączyły przez formularz,
// oraz instytucje przygotowujące wdrożenia (plany Krawca). Kontakt zawsze przez Hub (sprawa z numerem), bez publicznych e-maili.
import { z } from "zod";
import { db } from "./db";
import { katalog } from "./katalog";
import { OBSZAR_IDS, OBSZAR_KATEGORII, type ObszarId } from "./obszary";
import { normalizujPowiat } from "./powiaty";
import { TYPY_INSTYTUCJI, type TypInstytucji } from "./krawiec-stale";

import { idAutora, SEKTORY, type Sektor } from "./siec-stale";
export { SEKTORY, type Sektor };

/** Sektor z nazwy organizacji (poczwórna helisa: samorząd, NGO, nauka, biznes; plus ekonomia społeczna). */
export function sektorZNazwy(nazwa: string): Sektor {
  const n = nazwa.toLowerCase();
  if (/spółdzielnia socjaln|zakład aktywności|ekonomii społecznej|centrum integracji społecznej/.test(n)) return "es";
  if (/fundacja|stowarzyszenie|związek|towarzystwo|klub|federacja|caritas|kgw|koło gospodyń/.test(n)) return "ngo";
  if (/gmina|powiat|miasto|urząd|ośrodek pomocy|gops|mops|cus|centrum usług|starostwo|województwo|rops|szkoła|przedszkole|biblioteka|dom pomocy/.test(n)) return "samorzad";
  if (/politechnika|uniwersytet|akademia|uczelnia|szkoła wyższa|instytut badawczy/.test(n)) return "nauka";
  if (/sp\. z o\.o\.|s\.c\.|s\.a\.|spółka|sp\.j\.|firma/.test(n)) return "biznes";
  return "grupa";
}

export type Lider = {
  id: string;
  nazwa: string;
  sektor: Sektor;
  powiat: string | null;
  obszary: ObszarId[];
  innowacje: { id: string; nazwa: string }[];
  oferuje: string | null;
  szuka: string | null;
  zrodlo: "biblioteka" | "zgloszenie";
};

export type Wdrozenie = { powiat: string; instytucja: string; innowacja: string; innowacjaId: string; kiedy: string };


export async function liderzySieci(): Promise<{ liderzy: Lider[]; wdrozenia: Wdrozenie[] }> {
  const { lista } = await katalog();
  const autorzy = new Map<string, Lider>();
  for (const i of lista) {
    const nazwa = i.autor.trim();
    if (!nazwa) continue;
    // Grupujemy po identyfikatorze: ta sama organizacja bywa zapisana w Bibliotece na kilka sposobów.
    const id = idAutora(nazwa);
    const l = autorzy.get(id) ?? { id, nazwa, sektor: sektorZNazwy(nazwa), powiat: null, obszary: [], innowacje: [], oferuje: null, szuka: null, zrodlo: "biblioteka" as const };
    const o = OBSZAR_KATEGORII[i.kategoria];
    if (o && !l.obszary.includes(o)) l.obszary.push(o);
    if (!l.innowacje.some((x) => x.id === i.id)) l.innowacje.push({ id: i.id, nazwa: i.nazwa });
    autorzy.set(id, l);
  }
  let zgloszeni: Lider[] = [];
  let wdrozenia: Wdrozenie[] = [];
  try {
    const [z, p] = await Promise.all([
      db().query("select id, nazwa, sektor, powiat, obszary, oferuje, szuka from liderzy where status='zatwierdzony' order by created_at desc"),
      db().query("select innowacja_id, profil, created_at from plany_wdrozenia order by created_at desc limit 200"),
    ]);
    zgloszeni = z.rows.map((r) => ({ id: r.id, nazwa: r.nazwa, sektor: r.sektor, powiat: r.powiat, obszary: (r.obszary ?? []).filter((x: string) => (OBSZAR_IDS as readonly string[]).includes(x)), innowacje: [], oferuje: r.oferuje, szuka: r.szuka, zrodlo: "zgloszenie" as const }));
    const mapa = new Map(lista.map((i) => [i.id, i.nazwa]));
    wdrozenia = p.rows
      .filter((r) => r.profil?.powiat && mapa.has(r.innowacja_id))
      .map((r) => ({ powiat: normalizujPowiat(r.profil.powiat) ?? r.profil.powiat, instytucja: TYPY_INSTYTUCJI[r.profil.typ as TypInstytucji] ?? "Instytucja", innowacja: mapa.get(r.innowacja_id)!, innowacjaId: r.innowacja_id, kiedy: new Date(r.created_at).toISOString() }));
  } catch {
    /* baza chwilowo niedostępna: zostają autorzy z Biblioteki */
  }
  return { liderzy: [...zgloszeni, ...[...autorzy.values()].sort((a, b) => b.innowacje.length - a.innowacje.length || a.nazwa.localeCompare(b.nazwa, "pl"))], wdrozenia };
}

export const ZgloszenieLidera = z.object({
  nazwa: z.string().trim().min(3, "Podaj nazwę organizacji.").max(160),
  sektor: z.enum(SEKTORY),
  powiat: z.string().trim().max(60).optional(),
  obszary: z.array(z.enum(OBSZAR_IDS)).max(8).default([]),
  oferuje: z.string().trim().min(10, "Napisz, co możecie zaoferować.").max(600),
  szuka: z.string().trim().max(600).optional(),
  email: z.string().trim().email("Podaj poprawny adres e-mail.").max(120),
  zgoda: z.literal(true, { error: "Zaznacz zgodę na publikację opisu." }),
});

export const KontaktZLiderem = z.object({
  liderId: z.string().min(3).max(80),
  tresc: z.string().trim().min(10, "Napisz kilka słów o sprawie.").max(1200),
  email: z.string().trim().email("Podaj poprawny adres e-mail albo zostaw pole puste.").max(120).optional().or(z.literal("")),
});
