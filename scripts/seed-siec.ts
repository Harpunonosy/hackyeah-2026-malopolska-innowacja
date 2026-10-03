/** Dane demo sieci liderów (syntetyczne, oznaczone „demo”). Uruchom: npx tsx --env-file=.env.local scripts/seed-siec.ts */
import { db } from "../lib/db";

const LIDERZY = [
  { nazwa: "Gminny Ośrodek Pomocy Społecznej w Wolbromiu (demo)", sektor: "samorzad", powiat: "powiat olkuski", obszary: ["seniorzy", "niepelnosprawnosc"], oferuje: "Dostęp do seniorów z małych wsi, salę w ośrodku i pracowników socjalnych do pilotażu.", szuka: "Organizacji z gotowym modelem wsparcia samotnych seniorów, którą moglibyśmy zatrudnić w zleceniu zadania." },
  { nazwa: "Stowarzyszenie Sąsiedzi Razem (demo)", sektor: "ngo", powiat: "powiat nowotarski", obszary: ["seniorzy", "zdrowie_psychiczne"], oferuje: "30 wolontariuszy, doświadczenie w telefonach wsparcia i dowozach do lekarza.", szuka: "Gminy, która sfinansuje transport i pomoże dotrzeć do osób samotnych." },
  { nazwa: "Spółdzielnia Socjalna Smaczna Wieś (demo)", sektor: "es", powiat: "powiat limanowski", obszary: ["seniorzy", "ubostwo"], oferuje: "Posiłki z dowozem i zatrudnienie osób długotrwale bezrobotnych.", szuka: "Partnerów do usługi posiłków dla seniorów finansowanej z budżetu gminy." },
  { nazwa: "Koło Naukowe Innowacji Społecznych (demo)", sektor: "nauka", powiat: "powiat m. Kraków", obszary: ["niepelnosprawnosc", "zdrowie_psychiczne"], oferuje: "Badania potrzeb, ewaluację pilotaży i studentów do testów z użytkownikami.", szuka: "Projektów do ewaluacji w ramach prac dyplomowych." },
  { nazwa: "Pracownia Druku 3D Makerspace (demo)", sektor: "biznes", powiat: "powiat tarnowski", obszary: ["niepelnosprawnosc"], oferuje: "Szybkie prototypy przedmiotów (uchwyty, nakładki, pomoce sensoryczne) po kosztach materiału.", szuka: "Pomysłodawców z gotowym szkicem przedmiotu do wydrukowania i testu." },
  { nazwa: "Centrum Usług Społecznych w Gorlicach (demo)", sektor: "samorzad", powiat: "powiat gorlicki", obszary: ["rodzina_piecza", "zdrowie_psychiczne"], oferuje: "Koordynację usług w gminie i doświadczenie z deinstytucjonalizacją.", szuka: "Sprawdzonych innowacji dla rodzin w kryzysie, gotowych do wdrożenia w CUS." },
];

async function main() {
  const c = db();
  await c.query("delete from liderzy where syntetyczne");
  for (const l of LIDERZY) {
    await c.query("insert into liderzy (nazwa, sektor, powiat, obszary, oferuje, szuka, status, syntetyczne) values ($1,$2,$3,$4,$5,$6,'zatwierdzony',true)", [l.nazwa, l.sektor, l.powiat, l.obszary, l.oferuje, l.szuka]);
  }
  console.log(`Dodano ${LIDERZY.length} liderów demo.`);
  process.exit(0);
}
main();
