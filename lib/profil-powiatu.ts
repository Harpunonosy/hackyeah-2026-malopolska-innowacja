import { sprawdzWersjeIoss } from "./ioss-import-cache";
// Profil powiatu: diagnoza w minutę dla gmin, CUS i OPS. Dane IOSS na tle regionu opisane prostym językiem.
// Wyłącznie dane publiczne (IOSS, Biblioteka ROPS). Trendy zgłoszeń mieszkańców są tylko w Centrali.
import { czyWdrazalna } from "./swatka";
import { katalog } from "./katalog";
import { nazwaObszaru, OBSZAR_KATEGORII, type ObszarId } from "./obszary";
import { POWIATY_IOSS } from "./powiaty";
import { szukaj } from "./szukaj";
import { wskaznikiDoMapy } from "./wiedza";
import { zapamietaj } from "./pamiec";
import { wczytajIoss } from "./radar";

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");
export const slugPowiatu = (p: string) => fold(p.replace(/^powiat\s+/, "")).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const powiatZeSluga = (slug: string) => POWIATY_IOSS.find((p) => slugPowiatu(p) === slug) ?? null;
export const nazwaPowiatu = (p: string) => p.replace(/^powiat\s+/, "");

const SLOWA_OBSZARU: Record<ObszarId, string> = {
  seniorzy: "senior samotność opieka", niepelnosprawnosc: "niepełnosprawność dostępność", ubostwo: "ubóstwo praca aktywizacja", bezdomnosc: "bezdomność schronisko",
  zdrowie_psychiczne: "zdrowie psychiczne depresja kryzys", rodzina_piecza: "rodzina piecza zastępcza dzieci", zdrowie: "zdrowie choroba profilaktyka", cudzoziemcy: "cudzoziemcy integracja",
};

export type Wyzwanie = { obszar: ObszarId; obszarNazwa: string; nazwa: string; wartosc: number; srednia: number; miejsce: number; z: number; opis: string };
export type ProfilPowiatu = {
  powiat: string;
  ludnosc: number | null;
  wyzwania: Wyzwanie[];
  innowacje: { obszar: ObszarId; obszarNazwa: string; lista: { id: string; nazwa: string; kategoria: string }[] }[];
};

const zaokr = (x: number) => Math.round(x * 100) / 100;
const liczba = (x: number) => x.toLocaleString("pl-PL", { maximumFractionDigits: 2 });

/** Profil zależy tylko od danych IOSS i katalogu, więc liczymy go raz na 2 minuty dla każdego powiatu. */
export async function profilPowiatu(powiat: string): Promise<ProfilPowiatu> {
  await sprawdzWersjeIoss();
  return zapamietaj(`profil-powiatu:${powiat}`, 120_000, () => policzProfil(powiat));
}

async function policzProfil(powiat: string): Promise<ProfilPowiatu> {
  const [mapa, ioss, { lista }] = await Promise.all([wskaznikiDoMapy(), wczytajIoss(), katalog()]);
  const wszystkie: Wyzwanie[] = [];
  for (const [obszar, wskazniki] of Object.entries(mapa.obszary)) {
    for (const w of wskazniki) {
      const v = w.wartosci[powiat];
      if (v === undefined) continue;
      const wart = Object.values(w.wartosci);
      const sr = wart.reduce((a, b) => a + b, 0) / wart.length;
      const sd = Math.sqrt(wart.reduce((a, b) => a + (b - sr) ** 2, 0) / wart.length) || 1;
      const z = ((v - sr) / sd) * w.kierunek;
      const gorsze = wart.filter((x) => ((x - sr) / sd) * w.kierunek > z).length;
      const miejsce = gorsze + 1;
      const nazwa = w.nazwa.replace(/ \(na 10 tys\. mieszkańców\)/, "");
      const jednostka = w.nazwa.includes("na 10 tys.") ? " na 10 tys. mieszkańców" : "";
      const opis = w.kierunek === 1
        ? `${nazwa}: ${liczba(v)}${jednostka} (średnia regionu ${liczba(sr)}). ${miejsce <= 3 ? `To ${miejsce}. najwyższy wynik w regionie.` : miejsce <= 8 ? "Wynik wyższy niż w większości powiatów." : "Wynik w granicach średniej."}`
        : `${nazwa}: ${liczba(v)}${jednostka} (średnia regionu ${liczba(sr)}). ${miejsce <= 3 ? `To ${miejsce}. najniższy wynik w regionie.` : miejsce <= 8 ? "Wynik niższy niż w większości powiatów." : "Wynik w granicach średniej."}`;
      wszystkie.push({ obszar: obszar as ObszarId, obszarNazwa: nazwaObszaru(obszar as ObszarId), nazwa, wartosc: zaokr(v), srednia: zaokr(sr), miejsce, z, opis });
    }
  }
  wszystkie.sort((a, b) => b.z - a.z);
  const wyzwania = wszystkie.slice(0, 6);
  const obszary = [...new Set(wyzwania.map((w) => w.obszar))].slice(0, 4);
  const innowacje = obszary.map((o) => {
    let kandydaci = lista.filter((i) => OBSZAR_KATEGORII[i.kategoria] === o && czyWdrazalna(i));
    if (kandydaci.length < 3) {
      const dodatkowe = szukaj(SLOWA_OBSZARU[o], 12).filter((t) => t.wynik >= 0.3).map((t) => lista.find((i) => i.id === t.id)).filter((i): i is NonNullable<typeof i> => !!i && czyWdrazalna(i));
      kandydaci = [...new Map([...kandydaci, ...dodatkowe].map((i) => [i.id, i])).values()];
    }
    return { obszar: o, obszarNazwa: nazwaObszaru(o), lista: kandydaci.slice(0, 3).map((i) => ({ id: i.id, nazwa: i.nazwa, kategoria: i.kategoria })) };
  });
  return { powiat, ludnosc: ioss.ludnosc[powiat] ?? null, wyzwania, innowacje };
}
