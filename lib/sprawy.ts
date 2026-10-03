// Sprawa = każde zgłoszenie w Splocie (problem, pomysł, pytanie, wniosek, zapis, ogłoszenie, wyzwanie gminy).
// Wspólny numer, wątek, oś czasu i termin odpowiedzi; Centrala obsługuje wszystkie w jednej skrzynce.
import { db } from "./db";
import { wykryjKryzys } from "./kryzys";
import { zamaskuj } from "./maskowanie";
import { normalizujPowiat } from "./powiaty";
import { powiadom } from "./powiadomienia";
import { nowyNumer } from "./zgloszenia";

import { ETYKIETY_TYPOW, type TypSprawy } from "./sprawy-etykiety";
export { ETYKIETY_TYPOW, TYPY_SPRAW, type TypSprawy } from "./sprawy-etykiety";

const SLA_GODZIN: Record<TypSprawy, number> = { problem: 72, pomysl: 120, pytanie: 48, wniosek: 120, zapis: 96, ogloszenie: 96, wyzwanie: 120 };

export async function utworzSprawe(w: {
  typ: TypSprawy;
  tytul: string;
  tresc: string;
  obiektId?: string;
  powiat?: string | null;
  obszar?: string | null;
  email?: string;
  kanal?: "web" | "glos" | "asystowane" | "papier";
}): Promise<{ id: string; numer: string }> {
  const { tekst } = zamaskuj(w.tresc);
  const kryzys = wykryjKryzys(tekst) !== null;
  const numer = nowyNumer();
  const c = db();
  let autorId: string | null = null;
  if (w.email) {
    autorId = (await c.query("insert into uzytkownicy (rola, email, powiat) values ('organizacja',$1,$2) returning id", [w.email, normalizujPowiat(w.powiat ?? undefined)])).rows[0].id;
  }
  const z = await c.query(
    `insert into zgloszenia (numer, autor_id, kanal, tresc_zamaskowana, obszar, powiat, priorytet, kryzys, termin_sla, zgoda_kontakt, kanal_kontaktu, typ, tytul, obiekt_id)
     values ($1,$2,$3,$4,$5,$6,$7,$8, now() + ($9 || ' hours')::interval, true,$10,$11,$12,$13) returning id`,
    [numer, autorId, w.kanal ?? "web", tekst, w.obszar ?? null, normalizujPowiat(w.powiat ?? undefined), kryzys ? 0 : 2, kryzys, kryzys ? "0" : String(SLA_GODZIN[w.typ]),
      w.email ? "email" : null, w.typ, w.tytul.slice(0, 160), w.obiektId ?? null],
  );
  const id: string = z.rows[0].id;
  await c.query("insert into historia_statusu (zgloszenie_id, status, notatka) values ($1,'wyslane',$2)", [id, `${ETYKIETY_TYPOW[w.typ]}: zgłoszenie przyjęte`]);
  await powiadom({
    adresat: "rops",
    typ: w.typ === "pomysl" ? "nowy_pomysl" : w.typ === "problem" ? "nowa_sprawa" : w.typ === "pytanie" ? "pytanie_eksperta" : w.typ === "ogloszenie" ? "nowe_ogloszenie" : "nowa_sprawa",
    tytul: `${ETYKIETY_TYPOW[w.typ]}: ${w.tytul.slice(0, 80)}`,
    tresc: `Numer ${numer}. Termin odpowiedzi: ${SLA_GODZIN[w.typ]} godz.`,
    link: `/centrala/zgloszenia/${id}`,
    numerSprawy: numer,
  });
  return { id, numer };
}
