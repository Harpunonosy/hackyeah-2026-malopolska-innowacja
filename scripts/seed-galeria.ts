/** Dane demonstracyjne: publiczna galeria pomysłów i numery spraw dla seedowych ogłoszeń partnerskich. Uruchom: npx tsx --env-file=.env.local scripts/seed-galeria.ts */
import { db } from "../lib/db";
import { nowyNumer } from "../lib/zgloszenia";

const POMYSLY = [
  { tytul: "Sąsiedzka Pralnia", opis: "Wspólna pralnia w bloku komunalnym, prowadzona przez mieszkańców i OPS.", istota: "Pralka i suszarka w świetlicy osiedlowej, obsługa przez seniorów-wolontariuszy, spotkania przy kawie w czasie prania.", dla_kogo: "Samotni seniorzy i osoby w kryzysie bezdomności", etap: "przetestowane", powiat: "powiat olkuski", wyniki: "Test w jednym bloku przez 3 miesiące: 14 osób skorzystało, 11 z nich zadeklarowało, że poznało nowego sąsiada." },
  { tytul: "Klub Cichego Czytania", opis: "Spotkania w bibliotece dla osób z nadwrażliwością sensoryczną.", istota: "Godzina w tygodniu w ciszy, ze słuchawkami wyciszającymi i miękkim światłem. Czytanie lub rysowanie obok siebie.", dla_kogo: "Osoby w spektrum autyzmu i młodzież z lękiem", etap: "prototyp", powiat: "powiat nowotarski", wyniki: "Pierwsze 4 spotkania: średnio 6 uczestników, 5 z 6 chce przyjść ponownie." },
  { tytul: "Wspólny Wtorek", opis: "Wolontariusze towarzyszą seniorom w załatwianiu spraw urzędowych online.", istota: "Raz w tygodniu dyżur w bibliotece: pomoc przy e-recepcie, Profilu Zaufanym i bankowości, bez pośpiechu.", dla_kogo: "Seniorzy wykluczeni cyfrowo", etap: "przetestowane", powiat: "powiat tarnowski", wyniki: "Pilotaż 2 miesiące: 23 osoby, średnio 35 minut na sprawę, 9 z 10 załatwiło sprawę samodzielnie przy drugiej wizycie." },
  { tytul: "Mobilna Poradnia Rodzica", opis: "Psycholog i pedagog dojeżdżają do wiejskich świetlic z konsultacjami dla rodziców nastolatków.", istota: "Raz w miesiącu busem do trzech wsi, krótkie konsultacje i grupa wsparcia rodziców.", dla_kogo: "Rodzice nastolatków w gminach bez poradni", etap: "pomysl", powiat: "powiat suski", wyniki: "" },
];

async function main() {
  const c = db();
  for (const p of POMYSLY) {
    if ((await c.query("select 1 from fiszki where tytul=$1", [p.tytul])).rows[0]) continue;
    const numer = nowyNumer();
    const f = await c.query(
      `insert into fiszki (tytul, opis, istota, dla_kogo, etap, powiat, numer, publiczna, status, syntetyczne, wyniki_testu)
       values ($1,$2,$3,$4,$5,$6,$7,true,'przeczytana',true,$8) returning id`,
      [p.tytul, p.opis, p.istota, p.dla_kogo, p.etap, p.powiat, numer, p.wyniki || null],
    );
    const z = await c.query(
      `insert into zgloszenia (numer, tresc_zamaskowana, powiat, typ, tytul, obiekt_id, syntetyczne, status, termin_sla, streszczenie)
       values ($1,$2,$3,'pomysl',$4,$5,true,'przeczytane', now() + interval '5 days', $6) returning id`,
      [numer, `${p.tytul}. ${p.opis} ${p.istota}`, p.powiat, p.tytul, f.rows[0].id, p.opis],
    );
    await c.query("insert into historia_statusu (zgloszenie_id, status, notatka) values ($1,'wyslane','Pomysł (dane demo)')", [z.rows[0].id]);
  }
  const bez = await c.query("select id, tytul, powiat, opis from partnerstwa where numer is null");
  for (const p of bez.rows) {
    const numer = nowyNumer();
    await c.query(
      `insert into zgloszenia (numer, tresc_zamaskowana, powiat, typ, tytul, obiekt_id, syntetyczne, status, termin_sla)
       values ($1,$2,$3,'ogloszenie',$4,$5,true,'przeczytane', now() + interval '4 days')`,
      [numer, `${p.tytul}. ${p.opis}`, p.powiat, `Ogłoszenie partnerskie: ${p.tytul}`, p.id],
    );
    await c.query("update partnerstwa set numer=$2 where id=$1", [p.id, numer]);
  }
  console.log("galeria:", (await c.query("select count(*)::int n from fiszki where publiczna")).rows[0].n, "ogłoszenia z numerem:", (await c.query("select count(*)::int n from partnerstwa where numer is not null")).rows[0].n);
  await c.end();
}
main();
