// Panel eksperta/mentora (moduł V). Konta demo: ekspert wybiera swój profil i podaje hasło demonstracyjne.
// Produkcyjnie: logowanie przez login.gov.pl lub Keycloak ROPS. Ekspert nie ma dostępu do Centrali.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./db";

const NAZWA = "splot_ekspert";
const WAZNOSC_S = 12 * 3600;
export const HASLO_DEMO_EKSPERTA = process.env.DEMO_EKSPERT_PASSWORD || (process.env.SPLOT_PUBLIC_DEMO === "1" ? "ekspert-demo" : "");

function sekret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") throw new Error("Brak SESSION_SECRET w środowisku produkcyjnym.");
  return "tylko-lokalnie-dev-sekret";
}
const podpis = (w: string) => createHmac("sha256", sekret()).update(w).digest("hex");

export function hasloEkspertaZgodne(podane: string): boolean {
  if (!HASLO_DEMO_EKSPERTA || !podane) return false;
  const a = Buffer.from(podane);
  const b = Buffer.from(HASLO_DEMO_EKSPERTA);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function ustawSesjeEksperta(id: string) {
  const wygasa = Math.floor(Date.now() / 1000) + WAZNOSC_S;
  const wartosc = `${id}.${wygasa}`;
  (await cookies()).set(NAZWA, `${wartosc}.${podpis(wartosc)}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: WAZNOSC_S });
}
export async function zakonczSesjeEksperta() {
  (await cookies()).delete(NAZWA);
}

export type Ekspert = { id: string; nazwa: string; obszary: string[]; dziedziny: string[] };

export async function aktualnyEkspert(): Promise<Ekspert | null> {
  const c = (await cookies()).get(NAZWA)?.value;
  if (!c) return null;
  const [id, wygasa, sig] = c.split(".");
  if (!id || !sig || Number(wygasa) < Date.now() / 1000) return null;
  const oczekiwany = podpis(`${id}.${wygasa}`);
  if (sig.length !== oczekiwany.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(oczekiwany))) return null;
  const { rows } = await db().query("select uzytkownik_id as id, nazwa, obszary, dziedziny from eksperci where uzytkownik_id=$1", [id]);
  return rows[0] ?? null;
}

/** Przydziela sprawę ekspertowi z pasującego obszaru (najmniej obciążonemu). Zwraca id eksperta albo null. */
export async function przypiszEksperta(zgloszenieId: string, obszar: string | null): Promise<string | null> {
  if (!obszar) return null;
  const { rows } = await db().query(
    `select e.uzytkownik_id as id from eksperci e where $1 = any(e.obszary)
     order by (select count(*) from zgloszenia z where z.ekspert_id = e.uzytkownik_id and z.status <> 'odpowiedz' and z.status <> 'zamkniete') limit 1`,
    [obszar],
  );
  if (!rows[0]) return null;
  await db().query("update zgloszenia set ekspert_id=$2 where id=$1 and ekspert_id is null", [zgloszenieId, rows[0].id]);
  return rows[0].id;
}
