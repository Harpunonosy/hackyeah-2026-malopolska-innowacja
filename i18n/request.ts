import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { COOKIE_JEZYK } from "@/lib/dostepnosc";
import pl from "../messages/pl.json";

export const JEZYKI = ["pl", "uk", "en"] as const;
export type Jezyk = (typeof JEZYKI)[number];

type Dane = { [k: string]: string | Dane };
// Brakujące tłumaczenia wracają do polskiego, więc strona nigdy nie pokazuje pustych kluczy.
function scal(baza: Dane, nadpis: Dane): Dane {
  const wynik: Dane = { ...baza };
  for (const [k, v] of Object.entries(nadpis)) wynik[k] = typeof v === "object" && typeof baza[k] === "object" ? scal(baza[k] as Dane, v as Dane) : v;
  return wynik;
}

export default getRequestConfig(async () => {
  const z = (await cookies()).get(COOKIE_JEZYK)?.value;
  const locale: Jezyk = (JEZYKI as readonly string[]).includes(z ?? "") ? (z as Jezyk) : "pl";
  const nadpis = locale === "pl" ? {} : ((await import(`../messages/${locale}.json`).catch(() => ({ default: {} }))).default as Dane);
  return { locale, messages: scal(pl as unknown as Dane, nadpis) };
});
