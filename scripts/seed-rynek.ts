/** Dane demonstracyjne Rynku: eksperci (opisani rolą, bez danych osobowych) i ogłoszenia partnerskie. */
import { db } from "../lib/db";

const EKSPERCI = [
  { nazwa: "Ekspertka ds. opieki nad seniorami", dziedziny: ["opieka długoterminowa", "dzienne domy pomocy", "demencja"], obszary: ["seniorzy", "zdrowie"], opis: "Doradza gminom przy tworzeniu usług opiekuńczych i dziennych form wsparcia.", dyzury: "czwartki 10:00-12:00, online" },
  { nazwa: "Ekspert ds. dostępności i niepełnosprawności", dziedziny: ["dostępność cyfrowa", "asystencja osobista", "autyzm"], obszary: ["niepelnosprawnosc"], opis: "Pomaga dostosować usługi do osób z niepełnosprawnościami i przygotować wnioski.", dyzury: "środy 14:00-16:00, online" },
  { nazwa: "Ekspertka ds. zdrowia psychicznego i rodziny", dziedziny: ["wsparcie psychologiczne", "piecza zastępcza", "młodzież"], obszary: ["zdrowie_psychiczne", "rodzina_piecza"], opis: "Konsultuje pomysły dotyczące wsparcia rodzin i młodzieży w kryzysie.", dyzury: "poniedziałki 12:00-14:00, online" },
  { nazwa: "Ekspert ds. finansowania i ekonomii społecznej", dziedziny: ["granty wdrożeniowe", "ekonomia społeczna", "partnerstwa"], obszary: ["ubostwo", "bezdomnosc", "cudzoziemcy"], opis: "Wskazuje źródła finansowania i pomaga zbudować partnerstwo międzysektorowe.", dyzury: "piątki 9:00-11:00, online" },
];
const PARTNERSTWA = [
  { tytul: "Szukamy kierowców-wolontariuszy do dowozu seniorów do lekarza", szuka: "taniej", obszar: "seniorzy", powiat: "powiat nowotarski", opis: "Dowóz seniorów ze wsi do przychodni jest dla nas za drogi. Szukamy gminy lub straży, która wspólnie z nami zorganizuje wolontaryjne kursy." },
  { tytul: "Jak dotrzeć do rodziców nastolatków w kryzysie?", szuka: "dotrzec", obszar: "zdrowie_psychiczne", powiat: "powiat suski", opis: "Mamy warsztaty dla młodzieży, ale rodzice do nas nie trafiają. Poszukujemy szkół i parafii do współpracy." },
  { tytul: "Chcemy dodać kawiarnię społeczną do zajęć dla dorosłych z autyzmem", szuka: "wartosc", obszar: "niepelnosprawnosc", powiat: "powiat proszowicki", opis: "Szukamy podmiotu ekonomii społecznej, który pomoże prowadzić miejsca pracy z wsparciem." },
];

async function main() {
  const c = db();
  if ((await c.query("select count(*)::int n from eksperci")).rows[0].n === 0) {
    for (const e of EKSPERCI) {
      const u = await c.query("insert into uzytkownicy (rola, nazwa) values ('ekspert', $1) returning id", [e.nazwa]);
      await c.query("insert into eksperci (uzytkownik_id, nazwa, dziedziny, obszary, opis, dyzury) values ($1,$2,$3,$4,$5,$6)", [u.rows[0].id, e.nazwa, e.dziedziny, e.obszary, e.opis, e.dyzury]);
    }
  }
  if ((await c.query("select count(*)::int n from partnerstwa")).rows[0].n === 0) {
    for (const p of PARTNERSTWA) {
      await c.query("insert into partnerstwa (tytul, szuka, obszar, powiat, opis, syntetyczne) values ($1,$2,$3,$4,$5,true)", [p.tytul, p.szuka, p.obszar, p.powiat, p.opis]);
    }
  }
  console.log("eksperci:", (await c.query("select count(*)::int n from eksperci")).rows[0].n, "partnerstwa:", (await c.query("select count(*)::int n from partnerstwa")).rows[0].n);
  await c.end();
}
main();
