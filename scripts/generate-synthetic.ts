/**
 * Generuje syntetyczne zgłoszenia (dane demonstracyjne, bez danych osobowych) do Radaru.
 * Rozkład obszarów i powiatów jest ważony wskaźnikami IOSS. Celowo zostawia kilka powiatów o wysokim
 * ryzyku i małej liczbie zgłoszeń (ciche potrzeby) oraz kilka tematów bez dopasowania (białe plamy).
 *   npx tsx --env-file=.env.local scripts/generate-synthetic.ts
 */
import { randomBytes } from "node:crypto";
import { db } from "../lib/db";
import { OBSZAR_IDS, type ObszarId } from "../lib/obszary";
import { wczytajIoss } from "../lib/radar";

function prng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const los = prng(20261003);
const wybierz = <T,>(a: readonly T[]) => a[Math.floor(los() * a.length)];
function wazony<T>(pozycje: readonly T[], wagi: number[]): T {
  const suma = wagi.reduce((a, b) => a + b, 0);
  let r = los() * suma;
  for (let i = 0; i < pozycje.length; i++) if ((r -= wagi[i]) <= 0) return pozycje[i];
  return pozycje[pozycje.length - 1];
}

type Szablon = { tekst: string; tagi: string[]; grupa: string };
const SZABLONY: Record<ObszarId, Szablon[]> = {
  seniorzy: [
    { tekst: "Mieszkam sama na wsi, dzieci wyjechały. Czuję się samotna i nikt do mnie nie zagląda.", tagi: ["samotność", "senior", "wieś"], grupa: "samotna osoba starsza" },
    { tekst: "Mama ma 82 lata i zapomina o lekach. Nie mamy kto jej pomagać w ciągu dnia.", tagi: ["leki", "opieka", "senior"], grupa: "osoba starsza i jej rodzina" },
    { tekst: "Tata po udarze potrzebuje opieki w ciągu dnia, a ja pracuję. Szukam dziennego domu pomocy.", tagi: ["dzienny dom pomocy", "opieka", "udar"], grupa: "opiekun rodzinny" },
    { tekst: "Boję się korzystać z bankomatu i paczkomatu, bo ciągle ktoś próbuje oszukać starszych.", tagi: ["bankomat", "oszustwa", "wykluczenie cyfrowe"], grupa: "osoba starsza" },
    { tekst: "Babcia często się przewraca w domu. Co zrobić, żeby było bezpieczniej?", tagi: ["upadki", "bezpieczeństwo", "senior"], grupa: "osoba starsza" },
    { tekst: "Dziadek zaczyna zapominać i gubi się na ulicy. Gdzie szukać pomocy?", tagi: ["demencja", "pamięć", "senior"], grupa: "osoba z demencją i rodzina" },
  ],
  niepelnosprawnosc: [
    { tekst: "Syn jest na wózku, w naszej gminie nie ma dojazdu do szkoły. Gdzie szukać wsparcia?", tagi: ["wózek", "dojazd", "edukacja"], grupa: "dziecko z niepełnosprawnością ruchową" },
    { tekst: "Jestem niewidoma i nie umiem korzystać z nowych biletomatów.", tagi: ["niewidomi", "transport"], grupa: "osoba niewidoma" },
    { tekst: "Córka z autyzmem źle znosi wizyty u lekarza. Czy są sposoby, żeby ją przygotować?", tagi: ["autyzm", "lekarz"], grupa: "osoba z autyzmem" },
    { tekst: "Niesłyszący brat nie usłyszy alarmu pożarowego. Czy są specjalne czujki?", tagi: ["głusi", "alarm", "bezpieczeństwo"], grupa: "osoba niesłysząca" },
    { tekst: "Brat z niepełnosprawnością intelektualną nie radzi sobie z urzędem. Kto mu pomoże?", tagi: ["urząd", "niepełnosprawność intelektualna"], grupa: "osoba z niepełnosprawnością intelektualną" },
  ],
  ubostwo: [
    { tekst: "Nie stać mnie na opał na zimę, mam niską rentę.", tagi: ["opał", "renta", "ubóstwo"], grupa: "osoba o niskim dochodzie" },
    { tekst: "Szukam dorywczej pracy na wsi, ale nie mam transportu.", tagi: ["praca dorywcza", "transport", "wieś"], grupa: "osoba bezrobotna" },
    { tekst: "Mamy długi i dzieci chodzą głodne do szkoły.", tagi: ["zadłużenie", "dożywianie"], grupa: "rodzina w ubóstwie" },
    { tekst: "Po stracie pracy nie wiem, gdzie szukać pomocy ani doradztwa.", tagi: ["bezrobocie", "doradztwo"], grupa: "osoba bezrobotna" },
  ],
  cudzoziemcy: [
    { tekst: "Jesteśmy z Ukrainy, dzieci mają trudności w szkole przez język.", tagi: ["Ukraina", "szkoła", "język"], grupa: "rodzina cudzoziemców" },
    { tekst: "Nie wiem, jak umówić się do lekarza w Polsce, nie znam systemu.", tagi: ["lekarz", "adaptacja"], grupa: "cudzoziemiec" },
    { tekst: "Szukam pracy i kursu polskiego dla dorosłych.", tagi: ["praca", "język polski"], grupa: "cudzoziemiec" },
  ],
  bezdomnosc: [
    { tekst: "Wychodzę z domu dziecka i nie mam gdzie mieszkać.", tagi: ["usamodzielnienie", "mieszkanie"], grupa: "młody dorosły w kryzysie mieszkaniowym" },
    { tekst: "W okolicy nie ma noclegowni, a ludzie śpią na klatkach.", tagi: ["noclegownia", "bezdomność"], grupa: "osoby w kryzysie bezdomności" },
    { tekst: "Nie mam gdzie się umyć ani wyprać ubrań.", tagi: ["higiena", "bezdomność"], grupa: "osoba w kryzysie bezdomności" },
  ],
  zdrowie_psychiczne: [
    { tekst: "Syn nastolatek zamknął się w sobie i całe dnie siedzi przy komputerze.", tagi: ["nastolatek", "depresja", "wycofanie"], grupa: "młodzież i rodzice" },
    { tekst: "Mam napady lęku i boję się wychodzić z domu. Gdzie szukać pomocy bez kolejek?", tagi: ["lęk", "terapia"], grupa: "osoba dorosła z lękiem" },
    { tekst: "Po wyjściu ze szpitala psychiatrycznego chcę wrócić do pracy, ale się boję.", tagi: ["powrót do pracy", "kryzys psychiczny"], grupa: "osoba po kryzysie psychicznym" },
    { tekst: "Mąż pije, a ja nie daję rady psychicznie.", tagi: ["alkoholizm", "współuzależnienie"], grupa: "rodzina osoby uzależnionej" },
  ],
  rodzina_piecza: [
    { tekst: "Jesteśmy rodziną zastępczą i potrzebujemy wsparcia przy trudnych zachowaniach dziecka.", tagi: ["rodzina zastępcza", "wsparcie"], grupa: "rodzina zastępcza" },
    { tekst: "Dziecko po traumie źle śpi i jest agresywne. Co możemy zrobić?", tagi: ["trauma", "dziecko"], grupa: "rodzice i dziecko" },
    { tekst: "W gminie nie ma świetlicy ani wsparcia dziennego dla dzieci.", tagi: ["świetlica", "wsparcie dzienne"], grupa: "dzieci i rodzice" },
  ],
  zdrowie: [
    { tekst: "Mama ma cukrzycę i nie radzi sobie z lekami i dietą.", tagi: ["cukrzyca", "dieta"], grupa: "osoba przewlekle chora" },
    { tekst: "Po szpitalu potrzebna rehabilitacja w domu, a kolejki są ogromne.", tagi: ["rehabilitacja", "kolejki"], grupa: "pacjent po leczeniu" },
    { tekst: "Dziecko ma nadwagę, szukamy programu w przedszkolu.", tagi: ["otyłość", "dzieci"], grupa: "rodzice dzieci z nadwagą" },
  ],
};

const MOTYWY_LUK: { obszar: ObszarId; ile: number; szablony: Szablon[] }[] = [
  { obszar: "seniorzy", ile: 14, szablony: [
    { tekst: "Samotny mężczyzna po 60 na wsi, nie mam jak dojechać do lekarza, autobus nie kursuje.", tagi: ["samotność", "mężczyźni 60+", "transport do lekarza", "wieś"], grupa: "samotny mężczyzna 60+" },
    { tekst: "Mój ojciec, 68 lat, mieszka sam w wiosce. Nie ma transportu do przychodni i unika ludzi.", tagi: ["samotność", "mężczyźni 60+", "transport do lekarza"], grupa: "samotny mężczyzna 60+" },
    { tekst: "Starszy kawaler na wsi nie wychodzi z domu i nie ma jak dostać się na badania.", tagi: ["mężczyźni 60+", "transport do lekarza", "wieś"], grupa: "samotny mężczyzna 60+" } ] },
  { obszar: "zdrowie_psychiczne", ile: 11, szablony: [
    { tekst: "Córka po kryzysie psychicznym potrzebuje psychiatry dziecięcego, a najbliższy jest 100 km stąd.", tagi: ["psychiatra dziecięcy", "kryzys młodzieży", "brak dostępu"], grupa: "młodzież w kryzysie" },
    { tekst: "Nastolatek po próbie samookaleczenia czeka miesiącami na wizytę u psychiatry.", tagi: ["psychiatra dziecięcy", "kryzys młodzieży", "kolejki"], grupa: "młodzież w kryzysie" } ] },
  { obszar: "niepelnosprawnosc", ile: 10, szablony: [
    { tekst: "Dorosły syn z autyzmem skończył 25 lat i nie ma dla niego żadnych zajęć ani mieszkania wspomaganego.", tagi: ["autyzm dorośli", "mieszkanie wspomagane", "brak zajęć"], grupa: "dorośli z autyzmem" },
    { tekst: "Po ukończeniu szkoły specjalnej brat zostaje w domu, bez żadnego wsparcia dziennego.", tagi: ["autyzm dorośli", "brak zajęć", "wsparcie dzienne"], grupa: "dorośli z niepełnosprawnością intelektualną" } ] },
  { obszar: "rodzina_piecza", ile: 9, szablony: [
    { tekst: "Jesteśmy rodziną zastępczą nastolatka z FASD, w powiecie nie ma żadnych specjalistów.", tagi: ["FASD", "specjaliści", "rodzina zastępcza"], grupa: "rodzina zastępcza" } ] },
];

async function main() {
  const ioss = await wczytajIoss();
  const miasta = (p: string) => p.includes(" m. ");
  const wiejskie = ioss.powiaty.filter((p) => !miasta(p));
  const poRyzyku = (o: ObszarId) => [...wiejskie].sort((a, b) => ioss.ryzyko[o][b] - ioss.ryzyko[o][a]);
  const senior = poRyzyku("seniorzy");
  const psych = poRyzyku("zdrowie_psychiczne");
  const wyciszone = new Map<ObszarId, string[]>([["seniorzy", senior.slice(0, 2)], ["zdrowie_psychiczne", psych.slice(0, 1)]]);
  const powiatLuki: Partial<Record<ObszarId, string>> = {
    seniorzy: senior[2],
    zdrowie_psychiczne: psych[1] === wyciszone.get("zdrowie_psychiczne")![0] ? psych[2] : psych[1],
    niepelnosprawnosc: wybierz(wiejskie.filter((p) => p !== senior[0] && p !== senior[1])),
    rodzina_piecza: wybierz(wiejskie.filter((p) => p !== senior[0] && p !== senior[1])),
  };
  console.log("Ciche potrzeby (celowo mało zgłoszeń):", [...wyciszone].map(([o, p]) => `${o}: ${p.join(", ")}`).join(" | "));
  console.log("Białe plamy:", Object.entries(powiatLuki).map(([o, p]) => `${o}: ${p}`).join(" | "));

  const WAGI_OBSZAROW: Record<ObszarId, number> = { seniorzy: 30, zdrowie_psychiczne: 16, niepelnosprawnosc: 14, ubostwo: 12, rodzina_piecza: 10, zdrowie: 8, cudzoziemcy: 6, bezdomnosc: 4 };
  const dzien = 86400000;
  const teraz = Date.now();
  const czas = (obszar: ObszarId, pozno: boolean) => {
    const wTygodniach = pozno ? los() * 10 : obszar === "zdrowie_psychiczne" && los() < 0.5 ? los() * 4 : 26 * Math.pow(los(), 1.25);
    return new Date(teraz - wTygodniach * 7 * dzien - los() * dzien);
  };

  type Wiersz = { obszar: ObszarId; powiat: string; szablon: Szablon; najlepsze: number; data: Date };
  const wiersze: Wiersz[] = [];
  for (let i = 0; i < 205; i++) {
    const obszar = wazony(OBSZAR_IDS, OBSZAR_IDS.map((o) => WAGI_OBSZAROW[o]));
    const wagi = ioss.powiaty.map((p) => {
      let w = ioss.ludnosc[p] * (1 + 0.6 * Math.max(-1, Math.min(2, ioss.ryzyko[obszar][p])));
      if (wyciszone.get(obszar)?.includes(p)) w *= 0.03;
      if (powiatLuki[obszar] === p) w *= 0.5; // luki dostają zgłoszenia z klastrów poniżej
      return Math.max(w, 1);
    });
    const powiat = wazony(ioss.powiaty, wagi);
    const niski = los() < 0.05; // pojedyncze słabe dopasowania, które nie tworzą białej plamy
    const najlepsze = Math.round(niski ? 30 + los() * 22 : Math.min(97, Math.max(58, 80 + (los() + los() + los() - 1.5) * 18)));
    wiersze.push({ obszar, powiat, szablon: wybierz(SZABLONY[obszar]), najlepsze, data: czas(obszar, false) });
  }
  for (const m of MOTYWY_LUK) {
    for (let i = 0; i < m.ile; i++) {
      wiersze.push({ obszar: m.obszar, powiat: powiatLuki[m.obszar]!, szablon: wybierz(m.szablony), najlepsze: Math.round(28 + los() * 24), data: czas(m.obszar, true) });
    }
  }

  const c = await db().connect();
  try {
    await c.query("begin");
    await c.query("delete from zgloszenia where syntetyczne");
    for (const w of wiersze) {
      const numer = "SPL-" + randomBytes(5).toString("hex").slice(0, 8).toUpperCase();
      const starsze = teraz - w.data.getTime() > 14 * dzien;
      const status = starsze ? "zamkniete" : los() < 0.6 ? "zamkniete" : los() < 0.7 ? "odpowiedz" : "w_analizie";
      await c.query(
        `insert into zgloszenia (numer, kanal, tresc_zamaskowana, obszar, tagi, grupa_docelowa, powiat, priorytet, kryzys, status,
           termin_sla, najlepsze_dopasowanie, zgoda_kontakt, syntetyczne, streszczenie, created_at, updated_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8,false,$9,$10,$11,false,true,$3,$10,$10)`,
        [numer, wazony(["web", "asystowane", "glos"] as const, [70, 20, 10]), w.szablon.tekst, w.obszar, w.szablon.tagi, w.szablon.grupa, w.powiat,
          los() < 0.12 ? 1 : 2, status, w.data, w.najlepsze],
      );
    }
    await c.query("commit");
    console.log(`Wstawiono ${wiersze.length} zgłoszeń demonstracyjnych.`);
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
    await db().end();
  }
}
main();
