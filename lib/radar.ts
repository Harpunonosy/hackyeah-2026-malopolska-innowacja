// Radar (tylko dla administratora): białe plamy, ciche potrzeby i trendy.
// Wzory opisane w PLAN.md, rozdz. 8.
import { db } from "./db";
import { OBSZAR_IDS, type ObszarId } from "./obszary";

export const PROG_BIALEJ_PLAMY = 55;
export const OKRES_TYGODNI = 26;
// Ryzyko to średni z-score wskaźników IOSS dla obszaru (uśrednianie rozcieńcza wartości, więc próg to 0,5).
export const PROG_RYZYKA = 0.5;

type Wskaznik = { id: number; kierunek: 1 | -1; na10k?: boolean };

// kierunek 1: wyższa wartość = większe ryzyko; -1: wyższa wartość = lepsza dostępność (ryzyko odwracamy).
// na10k: wskaźnik jest liczbą placówek lub osób, więc przeliczamy na 10 tys. mieszkańców (wskaźnik 186).
export const WSKAZNIKI_OBSZARU: Record<ObszarId, Wskaznik[]> = {
  seniorzy: [{ id: 285, kierunek: 1 }, { id: 273, kierunek: 1 }, { id: 268, kierunek: -1 }, { id: 245, kierunek: -1, na10k: true }, { id: 227, kierunek: -1, na10k: true }, { id: 253, kierunek: -1, na10k: true }],
  niepelnosprawnosc: [{ id: 215, kierunek: 1 }, { id: 37, kierunek: 1 }, { id: 244, kierunek: -1, na10k: true }, { id: 252, kierunek: -1, na10k: true }],
  ubostwo: [{ id: 31, kierunek: 1 }, { id: 175, kierunek: 1 }, { id: 25, kierunek: 1 }, { id: 65, kierunek: -1 }, { id: 17, kierunek: 1 }],
  bezdomnosc: [{ id: 34, kierunek: 1 }, { id: 247, kierunek: -1, na10k: true }],
  zdrowie_psychiczne: [{ id: 42, kierunek: 1 }, { id: 40, kierunek: 1 }, { id: 243, kierunek: -1, na10k: true }, { id: 228, kierunek: -1, na10k: true }],
  rodzina_piecza: [{ id: 38, kierunek: 1 }, { id: 36, kierunek: 1 }, { id: 259, kierunek: 1 }, { id: 258, kierunek: -1 }, { id: 249, kierunek: -1, na10k: true }],
  zdrowie: [{ id: 39, kierunek: 1 }, { id: 121, kierunek: 1 }],
  cudzoziemcy: [{ id: 99, kierunek: 1 }],
};

export const NAZWY_WSKAZNIKOW: Record<number, string> = {
  285: "udział osób 65+", 273: "podwójne starzenie", 268: "potencjał pielęgnacyjny", 245: "dzienne domy pomocy", 227: "usługi opiekuńcze",
  253: "uniwersytety trzeciego wieku", 215: "osoby z niepełnosprawnościami", 37: "powód pomocy: niepełnosprawność", 244: "środowiskowe domy samopomocy",
  252: "zakłady aktywności zawodowej", 31: "powód pomocy: ubóstwo", 175: "dożywianie", 25: "bezrobocie", 65: "wynagrodzenia", 17: "beneficjenci pomocy społecznej",
  34: "powód pomocy: bezdomność", 247: "noclegownie i schroniska", 42: "sytuacja kryzysowa", 40: "alkoholizm", 243: "ośrodki interwencji kryzysowej",
  228: "usługi dla osób z zaburzeniami psychicznymi", 38: "bezradność opiekuńczo-wychowawcza", 36: "przemoc domowa", 259: "intensywność pieczy zastępczej",
  258: "deinstytucjonalizacja pieczy", 249: "placówki wsparcia dziennego", 39: "długotrwała choroba", 121: "zgony z chorób krążenia", 99: "saldo migracji zagranicznych",
};

const srednia = (x: number[]) => (x.length ? x.reduce((a, b) => a + b, 0) / x.length : 0);
const odchylenie = (x: number[]) => {
  const m = srednia(x);
  return Math.sqrt(srednia(x.map((v) => (v - m) ** 2)));
};

export type DanePowiatow = {
  powiaty: string[];
  ludnosc: Record<string, number>;
  /** ryzyko (średni z-score) dla każdej pary powiat-obszar */
  ryzyko: Record<ObszarId, Record<string, number>>;
  /** wartości surowe wskaźników: wskaznik_id -> powiat -> wartość */
  wartosci: Record<number, Record<string, number>>;
};

export async function wczytajIoss(): Promise<DanePowiatow> {
  const ids = [186, ...new Set(Object.values(WSKAZNIKI_OBSZARU).flat().map((w) => w.id))];
  const { rows } = await db().query(
    `select distinct on (wskaznik_id, powiat) wskaznik_id, powiat, wartosc::float8 as wartosc from ioss
     where wskaznik_id = any($1) and wartosc is not null order by wskaznik_id, powiat, rok desc`,
    [ids],
  );
  const wartosci: DanePowiatow["wartosci"] = {};
  for (const r of rows) (wartosci[r.wskaznik_id] ??= {})[r.powiat] = r.wartosc;
  const powiaty = Object.keys(wartosci[186] ?? {}).sort((a, b) => a.localeCompare(b, "pl"));
  const ludnosc = wartosci[186] ?? {};

  const ryzyko = {} as DanePowiatow["ryzyko"];
  for (const obszar of OBSZAR_IDS) {
    const zscory: Record<string, number[]> = Object.fromEntries(powiaty.map((p) => [p, []]));
    for (const w of WSKAZNIKI_OBSZARU[obszar]) {
      const wart = powiaty
        .filter((p) => wartosci[w.id]?.[p] !== undefined)
        .map((p) => [p, w.na10k ? (wartosci[w.id][p] / ludnosc[p]) * 10000 : wartosci[w.id][p]] as const);
      const m = srednia(wart.map(([, v]) => v));
      const s = odchylenie(wart.map(([, v]) => v)) || 1;
      for (const [p, v] of wart) zscory[p].push(w.kierunek * ((v - m) / s));
    }
    ryzyko[obszar] = Object.fromEntries(powiaty.map((p) => [p, srednia(zscory[p])]));
  }
  return { powiaty, ludnosc, ryzyko, wartosci };
}

type Zgloszenie = { powiat: string | null; obszar: ObszarId | null; najlepsze: number | null; tagi: string[]; tresc: string; created_at: Date };

export async function wczytajZgloszenia(): Promise<Zgloszenie[]> {
  const { rows } = await db().query(
    `select powiat, obszar, najlepsze_dopasowanie as najlepsze, coalesce(tagi,'{}') as tagi, tresc_zamaskowana as tresc, created_at
     from zgloszenia where created_at > now() - ($1 || ' weeks')::interval and obszar is not null and powiat is not null`,
    [String(OKRES_TYGODNI)],
  );
  return rows;
}

export type Luka = { powiat: string; obszar: ObszarId; n: number; srednia: number; wynik: number; tagi: string[]; przyklad: string };
export type Cicha = { powiat: string; obszar: ObszarId; ryzyko: number; aktywnosc: number; stopaRegionu: number; zgloszen: number; wskazniki: { nazwa: string; wartosc: number }[] };
export type Trend = { obszar: ObszarId; tygodnie: number[]; ostatnie4: number; poprzednie4: number; zmianaProc: number | null; nowyTrend: boolean };
export type RadarDane = {
  powiaty: string[];
  /** liczba zgłoszeń na 10 tys. mieszkańców, per obszar ("wszystkie" = suma) */
  aktywnosc: Record<string, Record<string, number>>;
  ryzyko: Record<string, Record<string, number>>;
  lukiPoPowiatach: Record<string, Record<string, number>>;
  luki: Luka[];
  ciche: Cicha[];
  trendy: Trend[];
  kpi: { zgloszen: number; bezDopasowania: number; procentBez: number; bialePlamy: number; cichePotrzeby: number };
};

export async function policzRadar(): Promise<RadarDane> {
  const [ioss, zgl] = await Promise.all([wczytajIoss(), wczytajZgloszenia()]);
  const { powiaty, ludnosc } = ioss;
  const na10k = (p: string, n: number) => (ludnosc[p] ? (n / ludnosc[p]) * 10000 : 0);

  const aktywnosc: RadarDane["aktywnosc"] = { wszystkie: {} };
  const lukiPoPowiatach: RadarDane["lukiPoPowiatach"] = { wszystkie: {} };
  const ryzykoWarstwa: RadarDane["ryzyko"] = { wszystkie: {} };
  for (const p of powiaty) {
    aktywnosc.wszystkie[p] = na10k(p, zgl.filter((z) => z.powiat === p).length);
    ryzykoWarstwa.wszystkie[p] = srednia(OBSZAR_IDS.map((o) => ioss.ryzyko[o][p]));
    lukiPoPowiatach.wszystkie[p] = 0;
  }

  const luki: Luka[] = [];
  const ciche: Cicha[] = [];
  for (const obszar of OBSZAR_IDS) {
    aktywnosc[obszar] = {};
    lukiPoPowiatach[obszar] = {};
    ryzykoWarstwa[obszar] = ioss.ryzyko[obszar];
    const wObszarze = zgl.filter((z) => z.obszar === obszar);
    const akt = powiaty.map((p) => na10k(p, wObszarze.filter((z) => z.powiat === p).length));
    powiaty.forEach((p, i) => (aktywnosc[obszar][p] = akt[i]));
    const sumaLudnosci = powiaty.reduce((a, p) => a + ludnosc[p], 0);
    const stopa = (wObszarze.length / sumaLudnosci) * 10000;

    for (const [i, p] of powiaty.entries()) {
      const wPowiecie = wObszarze.filter((z) => z.powiat === p);
      const slabe = wPowiecie.filter((z) => z.najlepsze !== null && z.najlepsze < PROG_BIALEJ_PLAMY);
      lukiPoPowiatach[obszar][p] = 0;
      if (slabe.length >= 3) {
        const sr = srednia(slabe.map((z) => z.najlepsze as number));
        const wynik = slabe.length * (1 - sr / 100);
        const licznik = new Map<string, number>();
        slabe.forEach((z) => z.tagi.forEach((t) => licznik.set(t, (licznik.get(t) ?? 0) + 1)));
        const tagi = [...licznik.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
        luki.push({ powiat: p, obszar, n: slabe.length, srednia: Math.round(sr), wynik: Math.round(wynik * 10) / 10, tagi, przyklad: slabe[0].tresc });
        lukiPoPowiatach[obszar][p] = wynik;
        lukiPoPowiatach.wszystkie[p] += wynik;
      }
      // cicha potrzeba: ryzyko podwyższone, a zgłoszeń na mieszkańca mniej niż połowa średniej regionalnej (przy dość licznej próbie)
      const r = ioss.ryzyko[obszar][p];
      if (r >= PROG_RYZYKA && wObszarze.length >= 20 && akt[i] <= 0.5 * stopa) {
        const wsk = WSKAZNIKI_OBSZARU[obszar]
          .map((w) => ({ nazwa: NAZWY_WSKAZNIKOW[w.id], wartosc: ioss.wartosci[w.id]?.[p] }))
          .filter((w): w is { nazwa: string; wartosc: number } => w.wartosc !== undefined)
          .slice(0, 3);
        ciche.push({ powiat: p, obszar, ryzyko: Math.round(r * 100) / 100, aktywnosc: Math.round(akt[i] * 100) / 100, stopaRegionu: Math.round(stopa * 100) / 100, zgloszen: wPowiecie.length, wskazniki: wsk });
      }
    }
  }
  luki.sort((a, b) => b.wynik - a.wynik);
  ciche.sort((a, b) => b.ryzyko - a.ryzyko);

  // trendy tygodniowe (ostatnie 12 tygodni, najnowszy na końcu)
  const teraz = Date.now();
  const tydzien = 7 * 86400000;
  const trendy: Trend[] = OBSZAR_IDS.map((obszar) => {
    const tyg = Array<number>(12).fill(0);
    for (const z of zgl) {
      if (z.obszar !== obszar) continue;
      const k = Math.floor((teraz - z.created_at.getTime()) / tydzien);
      if (k >= 0 && k < 12) tyg[11 - k]++;
    }
    const ostatnie4 = tyg.slice(8).reduce((a, b) => a + b, 0);
    const poprzednie4 = tyg.slice(4, 8).reduce((a, b) => a + b, 0);
    const baza = tyg.slice(3, 11);
    const s = odchylenie(baza);
    const nowyTrend = tyg[11] > srednia(baza) + 2 * (s || 1) && tyg[11] >= 4;
    return { obszar, tygodnie: tyg, ostatnie4, poprzednie4, zmianaProc: poprzednie4 ? Math.round(((ostatnie4 - poprzednie4) / poprzednie4) * 100) : null, nowyTrend };
  });

  const bez = zgl.filter((z) => z.najlepsze !== null && z.najlepsze < PROG_BIALEJ_PLAMY).length;
  return {
    powiaty,
    aktywnosc,
    ryzyko: ryzykoWarstwa,
    lukiPoPowiatach,
    luki: luki.slice(0, 10),
    ciche: ciche.slice(0, 10),
    trendy,
    kpi: { zgloszen: zgl.length, bezDopasowania: bez, procentBez: zgl.length ? Math.round((100 * bez) / zgl.length) : 0, bialePlamy: luki.length, cichePotrzeby: ciche.length },
  };
}

/** Wskaźniki IOSS dla powiatu w danym obszarze, na tle średniej regionu (do uzasadnień lokalnych). */
export async function wskaznikiPowiatu(obszar: ObszarId, powiat: string) {
  const ioss = await wczytajIoss();
  return WSKAZNIKI_OBSZARU[obszar]
    .map((w) => {
      const wart = ioss.powiaty.map((p) => ioss.wartosci[w.id]?.[p]).filter((x): x is number => x !== undefined);
      const wartosc = ioss.wartosci[w.id]?.[powiat];
      if (wartosc === undefined) return null;
      return { nazwa: NAZWY_WSKAZNIKOW[w.id], wartosc, sredniaRegionu: Math.round((wart.reduce((a, b) => a + b, 0) / wart.length) * 100) / 100 };
    })
    .filter((x): x is { nazwa: string; wartosc: number; sredniaRegionu: number } => x !== null);
}
