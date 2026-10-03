// Rozmowy między użytkownikami (test Jury: "jakość komunikacji pomiędzy użytkownikami").
// Odpowiedź na pomysł z galerii lub ogłoszenie partnerskie tworzy moderowaną rozmowę: dane kontaktowe są ukryte,
// treść jest maskowana, a ROPS widzi całą korespondencję w skrzynce. Każda strona ma swój numer sprawy i dostaje powiadomienia.
import { db } from "./db";
import { zamaskuj } from "./maskowanie";
import { powiadom } from "./powiadomienia";
import { utworzSprawe } from "./sprawy";

import { RODZAJE_ETYKIETY as RODZAJE_ROZMOWY, type RodzajRozmowy } from "./rozmowy-etykiety";
export { RODZAJE_ROZMOWY, type RodzajRozmowy };

export async function zacznijRozmowe(w: { cel: "fiszka" | "partnerstwo"; celId: string; rodzaj: RodzajRozmowy; tresc: string; email?: string }) {
  const c = db();
  const cel = w.cel === "fiszka"
    ? (await c.query("select tytul, numer, powiat from fiszki where id=$1 and publiczna", [w.celId])).rows[0]
    : (await c.query("select tytul, numer, powiat, obszar from partnerstwa where id=$1", [w.celId])).rows[0];
  if (!cel) return null;
  const { id, numer } = await utworzSprawe({
    typ: "ogloszenie", tytul: `${RODZAJE_ROZMOWY[w.rodzaj]}: ${cel.tytul}`.slice(0, 160), tresc: w.tresc, obiektId: w.celId, powiat: cel.powiat, obszar: cel.obszar, email: w.email,
  });
  await c.query("update zgloszenia set odpowiedz_na=$2 where id=$1", [id, cel.numer ?? null]);
  const watek = (await c.query("insert into watki (typ, obiekt_id, temat) values ('zgloszenie',$1,$2) returning id", [id, `Rozmowa ${numer}`])).rows[0].id;
  await c.query("insert into wiadomosci (watek_id, tresc, od) values ($1,$2,'autor')", [watek, zamaskuj(w.tresc).tekst]);
  if (cel.numer) {
    await powiadom({ adresat: "autor", typ: "odpowiedz_ogloszenie", tytul: `${RODZAJE_ROZMOWY[w.rodzaj]}: ktoś odpowiedział na Twoje ogłoszenie`, tresc: `Zobacz odpowiedź w swojej sprawie ${cel.numer} i odpisz. Dane kontaktowe pozostają ukryte.`, link: `/moje/${cel.numer}`, numerSprawy: cel.numer, kanal: "email" });
  }
  return { id, numer };
}

/** Właściciel ogłoszenia lub pomysłu odpowiada osobie, która zgłosiła się do rozmowy. */
export async function odpowiedzWlasciciela(numerWlasciciela: string, rozmowaId: string, tresc: string): Promise<boolean> {
  const c = db();
  const r = (await c.query("select id, numer from zgloszenia where id=$1 and odpowiedz_na=$2", [rozmowaId, numerWlasciciela.toUpperCase()])).rows[0];
  if (!r) return false;
  const watek = (await c.query("select id from watki where typ='zgloszenie' and obiekt_id=$1", [r.id])).rows[0]?.id;
  if (!watek) return false;
  await c.query("insert into wiadomosci (watek_id, tresc, od) values ($1,$2,'wlasciciel')", [watek, zamaskuj(tresc).tekst]);
  await c.query("update zgloszenia set updated_at=now() where id=$1", [r.id]);
  await powiadom({ adresat: "autor", typ: "odpowiedz_ogloszenie", tresc: "Autor ogłoszenia odpowiedział w Twojej rozmowie.", link: `/moje/${r.numer}`, numerSprawy: r.numer, kanal: "email" });
  return true;
}
