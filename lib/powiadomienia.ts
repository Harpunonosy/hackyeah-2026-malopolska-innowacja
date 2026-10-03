// Magistrala powiadomień Splotu. Zdarzenie (nowy pomysł, odpowiedź ROPS, zmiana naboru, nowe rozwiązanie)
// trafia do tabeli `powiadomienia`. Adresat "rops" widzi je w Centrali (plakietka, dźwięk, skrzynka nadawcza),
// adresat "autor" w "Moje sprawy" po numerze. E-mail i SMS są w MVP symulowane (podgląd w skrzynce nadawczej);
// podpięcie SMTP i bramki SMS to jeden adapter w tym pliku.
import { db } from "./db";
import { wyslijZdarzenie, zdarzenieDlaPowiadomienia } from "./webhooki";

export type TypPowiadomienia =
  | "nowa_sprawa" | "odpowiedz" | "pytanie_autora" | "nowy_pomysl" | "nabor_otwarty" | "nabor_zmiana" | "nabor_zamkniety"
  | "nowe_rozwiazanie" | "nowe_ogloszenie" | "odpowiedz_ogloszenie" | "pytanie_eksperta" | "wniosek_status";

export const ETYKIETY_POWIADOMIEN: Record<TypPowiadomienia, string> = {
  nowa_sprawa: "Nowe zgłoszenie",
  odpowiedz: "Odpowiedź ROPS",
  pytanie_autora: "Wiadomość od autora",
  nowy_pomysl: "Nowy pomysł",
  nabor_otwarty: "Nabór otwarty",
  nabor_zmiana: "Zmiana w naborze",
  nabor_zamkniety: "Nabór zamknięty",
  nowe_rozwiazanie: "Nowe rozwiązanie dla Twojego zgłoszenia",
  nowe_ogloszenie: "Nowe ogłoszenie",
  odpowiedz_ogloszenie: "Odpowiedź na ogłoszenie",
  pytanie_eksperta: "Pytanie do eksperta",
  wniosek_status: "Zmiana statusu wniosku",
};

export type NoweP = {
  adresat: "rops" | "autor";
  typ: TypPowiadomienia;
  tresc: string;
  link?: string;
  numerSprawy?: string;
  tytul?: string;
  kanal?: "aplikacja" | "email" | "sms";
};

export async function powiadom(p: NoweP): Promise<void> {
  try {
    await db().query(
      `insert into powiadomienia (adresat, typ, tytul, tresc, link, numer_sprawy, kanal, symulowane)
       values ($1,$2,$3,$4,$5,$6,$7,true)`,
      [p.adresat, p.typ, p.tytul ?? ETYKIETY_POWIADOMIEN[p.typ], p.tresc.slice(0, 400), p.link ?? null, p.numerSprawy ?? null, p.kanal ?? (p.adresat === "rops" ? "aplikacja" : "email")],
    );
    // Zdarzenia dla ROPS idą też do zewnętrznych systemów Hubu (webhooki z podpisem HMAC).
    const zdarzenie = zdarzenieDlaPowiadomienia(p.typ);
    if (zdarzenie && p.adresat === "rops") {
      wyslijZdarzenie(zdarzenie, { numerSprawy: p.numerSprawy ?? null, typ: p.typ, tytul: zdarzenie === "nabor.zmiana" ? (p.tytul ?? null) : null, link: p.link ?? null });
    }
  } catch (e) {
    console.error("Powiadomienie nie zostało zapisane:", e instanceof Error ? e.message : "?");
  }
}
