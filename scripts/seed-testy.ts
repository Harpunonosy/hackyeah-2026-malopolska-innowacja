/** Dane demonstracyjne Próbowni: otwarte testy. npx tsx --env-file=.env.local scripts/seed-testy.ts */
import { db } from "../lib/db";

const TESTY = [
  { inn: "inteligentny-organizer-do-lekow", tytul: "Test organizera do leków w domach seniorów", opis: "Szukamy seniorów i opiekunów, którzy przez 4 tygodnie wypróbują inteligentny organizer do leków i opowiedzą, czy pomaga pamiętać o dawkach.", kogo: "Osoby 65+ przyjmujące co najmniej 3 leki oraz ich opiekunowie", powiat: "powiat olkuski", termin: "listopad 2026, 4 tygodnie", miejsca: 10, dostepnosc: "Spotkanie instruktażowe w klubie seniora, pomoc przy obsłudze" },
  { inn: "merkury", tytul: "Test symulatora bankomatu i paczkomatu", opis: "Dwugodzinne warsztaty z symulatorem Merkury. Po zajęciach pytamy, czy seniorzy czują się pewniej przy bankomacie.", kogo: "Seniorzy, którzy boją się korzystać z bankomatu lub paczkomatu", powiat: "powiat tarnowski", termin: "wtorki i czwartki w listopadzie", miejsca: 12, dostepnosc: "Sala bez barier, możliwy dojazd organizowany przez gminę" },
  { inn: "bez-presji-z-depresji", tytul: "Test warsztatów dla nastolatków i rodziców", opis: "Wypróbuj warsztaty o emocjach i wycofaniu. Zbieramy opinie młodzieży i rodziców, co jest zrozumiałe, a co trzeba zmienić.", kogo: "Młodzież 14-18 lat i ich rodzice", powiat: "powiat nowotarski", termin: "sobota 14 listopada, godz. 10-13", miejsca: 15, dostepnosc: "Możliwy udział online, materiały w tekście łatwym do czytania" },
];

async function main() {
  const c = db();
  const { rows } = await c.query("select count(*)::int as n from testy");
  if (rows[0].n === 0) {
    for (const t of TESTY) {
      await c.query(
        `insert into testy (innowacja_id, tytul, opis, kogo_szukamy, powiat, termin, liczba_miejsc, dostepnosc, status) values ($1,$2,$3,$4,$5,$6,$7,$8,'otwarty')`,
        [t.inn, t.tytul, t.opis, JSON.stringify({ opis: t.kogo }), t.powiat, t.termin, t.miejsca, t.dostepnosc],
      );
    }
  }
  console.log("testów w bazie:", (await c.query("select count(*)::int as n from testy")).rows[0].n);
  await c.end();
}
main();
