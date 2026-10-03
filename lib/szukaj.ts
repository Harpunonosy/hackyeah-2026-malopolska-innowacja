// Wyszukiwanie awaryjne i pomocnicze (bez AI): dopasowanie trigramowe (jak pg_trgm) z wagami pól i IDF.
// Odporne na polską odmianę ("leków" ~ "leki"). Działa w pamięci, 115 rekordów to kilka ms.
import { innowacje, type Innowacja } from "./biblioteka";

const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");

const STOP = new Set(
  ("oraz jest sie nie jak ale dla przy nad pod bez czy lub tez tylko bardzo mam mnie moj moja moje moim " +
    "mamy ktory ktora ktore ktorzy ktora jego jej ich nasz nasza to ten ta te tych tego tym zeby ze tam tu " +
    "juz jeszcze wiec albo wszystko cos kiedy gdzie jestem jestesmy byc byl byla bylo chce chcialbym chcialabym " +
    "potrzebuje szukam pomocy pomoc jak nie daje rady").split(" "),
);

// Potoczne słowa -> pojęcia występujące w opisach ROPS.
const SYNONIMY: string[][] = [
  ["samotnosc", "samotny", "samotna", "osamotnienie", "izolacja", "wycofanie"],
  ["senior", "starszy", "starsza", "starsze", "emeryt", "babcia", "dziadek", "starosc", "seniorow"],
  ["niepelnosprawnosc", "niepelnosprawny", "niepelnosprawna", "inwalida"],
  ["wozek", "wozku", "mobilnosc", "ruchowa", "ograniczona"],
  ["niewidomy", "niewidoma", "niewidomi", "niedowidzacy", "slepy", "wzrok"],
  ["gluchy", "glusi", "gluchoniemy", "niesłyszacy", "niesłyszacy", "sluch", "niedoslyszacy"],
  ["depresja", "smutek", "przygnebienie", "kryzys", "psychiczny", "psychiczne", "lek"],
  ["bezdomny", "bezdomnosc", "bezdomnosci", "noclegownia", "schronisko"],
  ["ukraina", "ukrainski", "cudzoziemiec", "cudzoziemcy", "uchodzca", "migrant", "obcokrajowiec"],
  ["opiekun", "opiekunka", "opieka", "opiekowac", "pielegnacja"],
  ["leki", "lekow", "lekach", "suplementy", "wielolekowosc", "organizer"],
  ["praca", "pracy", "zatrudnienie", "bezrobotny", "bezrobocie", "dorywcza", "dorywczej", "praca"],
  ["bieda", "ubostwo", "ubóstwo", "opal", "niedozywienie", "pieniedzy"],
  ["dziecko", "dzieci", "nastolatek", "mlodziez", "syn", "corka", "przedszkole"],
  ["demencja", "alzheimer", "pamiec", "otepienie"],
  ["autyzm", "autystyczny", "spektrum"],
  ["przemoc", "agresja", "bicie", "znecanie"],
];

const NIE_SLOWO = /[^a-z0-9]+/;

export function tokeny(s: string): string[] {
  return fold(s).split(NIE_SLOWO).filter((t) => t.length >= 3 && !STOP.has(t));
}

const cacheTri = new Map<string, Set<string>>();
function trigramy(t: string): Set<string> {
  let wynik = cacheTri.get(t);
  if (!wynik) {
    const p = `  ${t} `;
    wynik = new Set<string>();
    for (let i = 0; i < p.length - 2; i++) wynik.add(p.slice(i, i + 3));
    cacheTri.set(t, wynik);
  }
  return wynik;
}

function dice(a: string, b: string): number {
  if (a === b) return 1;
  const A = trigramy(a);
  const B = trigramy(b);
  let wspolne = 0;
  for (const x of A) if (B.has(x)) wspolne++;
  return (2 * wspolne) / (A.size + B.size);
}

const PROG_PODOBIENSTWA = 0.55;

type Pole = { waga: number; tokeny: string[] };
type Indeks = { innowacja: Innowacja; pola: Pole[] };

const indeks: Indeks[] = innowacje.map((i) => ({
  innowacja: i,
  pola: [
    { waga: 3, tokeny: [...new Set(tokeny(i.nazwa))] },
    { waga: 1.5, tokeny: [...new Set(tokeny(i.kategoria))] },
    { waga: 2, tokeny: [...new Set(tokeny(i.problem))] },
    { waga: 2, tokeny: [...new Set(tokeny(i.grupaDocelowa))] },
    { waga: 1, tokeny: [...new Set(tokeny(i.naCzymPolega))] },
    { waga: 0.5, tokeny: [...new Set(tokeny(i.ktoMozeSkorzystac))] },
  ],
}));

function rozszerz(zapytanie: string[]): string[] {
  const wynik = new Set(zapytanie);
  for (const grupa of SYNONIMY) {
    if (zapytanie.some((t) => grupa.some((g) => dice(t, fold(g)) >= 0.75))) {
      for (const g of grupa) wynik.add(fold(g));
    }
  }
  return [...wynik];
}

export type TrafienieLeksykalne = { id: string; wynik: number; slowa: string[] };

export function szukaj(tekst: string, limit = 8): TrafienieLeksykalne[] {
  // znaczniki po maskowaniu danych ([telefon], [adres]) nie są słowami opisu
  const oryginalne = [...new Set(tokeny(tekst.replace(/\[[^\]]*\]/g, " ")))];
  if (oryginalne.length === 0) return [];
  const pojecia = rozszerz(oryginalne);
  const jestOryginalne = new Set(oryginalne);

  // najlepsze podobieństwo pojęcia do każdego pola każdego dokumentu
  const dopasowania = indeks.map(({ pola }) =>
    pojecia.map((q) =>
      pola.map((p) => {
        let najlepsze = 0;
        let slowo = "";
        for (const t of p.tokeny) {
          const d = dice(q, t);
          if (d > najlepsze) {
            najlepsze = d;
            slowo = t;
          }
        }
        return najlepsze >= PROG_PODOBIENSTWA ? { d: najlepsze, slowo } : { d: 0, slowo: "" };
      }),
    ),
  );

  const N = indeks.length;
  const idf = pojecia.map((_, qi) => {
    const df = dopasowania.filter((doc) => doc[qi].some((m) => m.d > 0)).length;
    return Math.log(1 + N / (1 + df));
  });

  const maxWaga = 3;
  const idfOryginalnych = oryginalne.map((q) => idf[pojecia.indexOf(q)]).sort((a, b) => b - a);
  const wyniki: TrafienieLeksykalne[] = indeks.map(({ innowacja, pola }, di) => {
    let suma = 0;
    const slowa = new Set<string>();
    pojecia.forEach((q, qi) => {
      let najlepszy = 0;
      pola.forEach((p, pi) => {
        const m = dopasowania[di][qi][pi];
        const wartosc = m.d * p.waga;
        if (wartosc > najlepszy) najlepszy = wartosc;
      });
      // pojęcia dodane z synonimów liczą się mniej niż słowa użytkownika
      const mnoznik = jestOryginalne.has(q) ? 1 : 0.6;
      if (najlepszy > 0) {
        suma += idf[qi] * najlepszy * mnoznik;
        if (jestOryginalne.has(q)) slowa.add(q);
      }
    });
    // długie opisy nie mogą rozcieńczać wyniku: liczy się 5 najbardziej wyróżniających słów
    const mianownik = (idfOryginalnych.slice(0, 5).reduce((s, v) => s + v, 0) * maxWaga) || 1;
    return { id: innowacja.id, wynik: Math.min(1, suma / mianownik), slowa: [...slowa] };
  });

  return wyniki
    .filter((w) => w.wynik > 0)
    .sort((a, b) => b.wynik - a.wynik)
    .slice(0, limit);
}
