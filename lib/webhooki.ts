// Webhooki: Splot powiadamia inne systemy Hubu (np. bazę grantową, CRM, kanał zespołu) o zdarzeniach.
// Każda wiadomość ma podpis HMAC-SHA256 z sekretu odbiorcy, więc odbiorca wie, że wysłał ją Splot.
// Treść zgłoszeń NIE wychodzi w webhooku: tylko numer sprawy, typ i link do Centrali.
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { after } from "next/server";
import { adresBazowy } from "./adres";
import { db } from "./db";
import type { TypPowiadomienia } from "./powiadomienia";

export const ZDARZENIA = ["sprawa.nowa", "pomysl.nowy", "nabor.zmiana", "wniosek.zmiana", "ogloszenie.nowe", "test.ping"] as const;
export type Zdarzenie = (typeof ZDARZENIA)[number];

export const OPISY_ZDARZEN: Record<Zdarzenie, string> = {
  "sprawa.nowa": "Nowe zgłoszenie (problem, pytanie, wniosek)",
  "pomysl.nowy": "Nowy pomysł z Kreatora",
  "nabor.zmiana": "Otwarcie, zmiana lub zamknięcie naboru",
  "wniosek.zmiana": "Etap oceny lub decyzja w sprawie wniosku (dla bazy grantowej)",
  "ogloszenie.nowe": "Nowe ogłoszenie na Rynku współpracy",
  "test.ping": "Wiadomość testowa",
};

const Z_POWIADOMIENIA: Partial<Record<TypPowiadomienia, Zdarzenie>> = {
  nowa_sprawa: "sprawa.nowa",
  nowy_pomysl: "pomysl.nowy",
  nabor_otwarty: "nabor.zmiana",
  nabor_zmiana: "nabor.zmiana",
  nabor_zamkniety: "nabor.zmiana",
  nowe_ogloszenie: "ogloszenie.nowe",
};

export const zdarzenieDlaPowiadomienia = (t: TypPowiadomienia) => Z_POWIADOMIENIA[t] ?? null;

export const nowySekret = () => `whsec_${randomBytes(24).toString("base64url")}`;

/** Podpis: HMAC-SHA256(sekret, `${czas}.${treść}`), nagłówek `X-Splot-Podpis: v1=<hex>`. Czas chroni przed powtórzeniem. */
export function podpisz(sekret: string, czas: string, tresc: string): string {
  return `v1=${createHmac("sha256", sekret).update(`${czas}.${tresc}`).digest("hex")}`;
}

/** Weryfikacja po stronie odbiorcy (ten sam kod jest w dokumentacji). Odrzuca wiadomości starsze niż 5 minut. */
export function sprawdzPodpis(sekret: string, czas: string, tresc: string, podpis: string): boolean {
  if (!/^\d+$/.test(czas) || Math.abs(Date.now() / 1000 - Number(czas)) > 300) return false;
  const a = Buffer.from(podpisz(sekret, czas, tresc));
  const b = Buffer.from(podpis);
  return a.length === b.length && timingSafeEqual(a, b);
}

export type DaneZdarzenia = { numerSprawy?: string | null; typ?: string; tytul?: string | null; link?: string | null };

async function dostarcz(w: { id: string; url: string; sekret: string }, zdarzenie: Zdarzenie, dane: DaneZdarzenia) {
  const czas = String(Math.floor(Date.now() / 1000));
  const tresc = JSON.stringify({ id: randomUUID(), zdarzenie, czas: new Date().toISOString(), zrodlo: "splot", dane });
  const start = Date.now();
  let status: number | null = null;
  let blad: string | null = null;
  try {
    const r = await fetch(w.url, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "Splot-Webhook/1", "x-splot-zdarzenie": zdarzenie, "x-splot-czas": czas, "x-splot-podpis": podpisz(w.sekret, czas, tresc) },
      body: tresc,
      signal: AbortSignal.timeout(5000),
      redirect: "manual",
    });
    status = r.status;
    if (!r.ok) blad = `HTTP ${r.status}`;
  } catch (e) {
    blad = e instanceof Error ? e.name === "TimeoutError" ? "Przekroczony czas 5 s" : e.message.slice(0, 120) : "błąd";
  }
  await db().query("insert into webhooki_dostawy (webhook_id, zdarzenie, status_http, czas_ms, blad) values ($1,$2,$3,$4,$5)", [w.id, zdarzenie, status, Date.now() - start, blad]);
  return { status, blad };
}

/** Wysyła zdarzenie do wszystkich aktywnych odbiorców. Po odpowiedzi dla użytkownika (after), więc nie spowalnia formularzy. */
export function wyslijZdarzenie(zdarzenie: Zdarzenie, dane: DaneZdarzenia) {
  const praca = async () => {
    try {
      const { rows } = await db().query("select id, url, sekret from webhooki where aktywny and $1 = any(zdarzenia)", [zdarzenie]);
      const pelne = { ...dane, link: dane.link ? (dane.link.startsWith("http") ? dane.link : `${adresBazowy()}${dane.link}`) : null };
      await Promise.allSettled(rows.map((w) => dostarcz(w, zdarzenie, pelne)));
    } catch (e) {
      console.error("Webhooki:", e instanceof Error ? e.message : "?");
    }
  };
  try {
    after(praca);
  } catch {
    void praca(); // poza żądaniem HTTP (np. skrypt)
  }
}

export async function wyslijTest(id: string) {
  const { rows } = await db().query("select id, url, sekret from webhooki where id=$1", [id]);
  if (!rows[0]) return null;
  return dostarcz(rows[0], "test.ping", { typ: "test", tytul: "Wiadomość testowa ze Splotu", link: `${adresBazowy()}/centrala/integracje` });
}
