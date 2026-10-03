// Prosta sesja administratora na demo: hasło + podpisane cookie. Produkcyjnie: login.gov.pl / Keycloak.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const NAZWA = "splot_admin";
const WAZNOSC_S = 12 * 3600;

function sekret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") throw new Error("Brak SESSION_SECRET (min. 16 znaków) w środowisku produkcyjnym.");
  return "tylko-lokalnie-dev-sekret";
}

function podpis(wartosc: string): string {
  return createHmac("sha256", sekret()).update(wartosc).digest("hex");
}

export function haslaZgodne(podane: string): boolean {
  const oczekiwane = process.env.DEMO_ADMIN_PASSWORD;
  if (!oczekiwane || !podane) return false;
  const a = Buffer.from(podane);
  const b = Buffer.from(oczekiwane);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function ustawSesjeAdmina() {
  const wygasa = Math.floor(Date.now() / 1000) + WAZNOSC_S;
  const wartosc = `admin.${wygasa}`;
  (await cookies()).set(NAZWA, `${wartosc}.${podpis(wartosc)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WAZNOSC_S,
  });
}

export async function zakonczSesje() {
  (await cookies()).delete(NAZWA);
}

export async function czyAdmin(): Promise<boolean> {
  const c = (await cookies()).get(NAZWA)?.value;
  if (!c) return false;
  const [rola, wygasa, sig] = c.split(".");
  if (rola !== "admin" || !sig || Number(wygasa) < Date.now() / 1000) return false;
  const oczekiwany = podpis(`${rola}.${wygasa}`);
  return sig.length === oczekiwany.length && timingSafeEqual(Buffer.from(sig), Buffer.from(oczekiwany));
}
