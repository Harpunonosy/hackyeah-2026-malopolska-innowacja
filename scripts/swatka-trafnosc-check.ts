/** Regresja rzeczywistego modelu: wymaga klucza AI, wykonuje płatne zapytania.
 * Uruchom: node --env-file=.env.local --import tsx scripts/swatka-trafnosc-check.ts
 * Opcjonalnie: --przypadek=wizyta. Używa wyłącznie publicznego katalogu z repo, bez bazy.
 */
import assert from "node:assert/strict";
import { dopasuj, WejscieSwatki } from "../lib/swatka";

const przypadki = [
  { id: "wizyta", tekst: "nie wiem jak umowic sie do lekarza", pasuje: "pelnia-zdrowia", minimum: 70, nieznanaGrupa: true },
  { id: "wizyta-inaczej", tekst: "Nie rozumiem, jak korzystać z przychodni. Potrzebuję prostego wyjaśnienia, jak załatwić wizytę.", pasuje: "pelnia-zdrowia", minimum: 70, nieznanaGrupa: true },
  { id: "bankomat", tekst: "Boję się korzystać z bankomatu. Chcę bezpiecznie poćwiczyć bez prawdziwych pieniędzy.", pasuje: "merkury", minimum: 85, nieznanaGrupa: true },
  { id: "rezerwacja", tekst: "Wiem, jak się zapisać. Szukam systemu, który od razu zarezerwuje mi konkretny wolny termin wizyty u kardiologa. Nie szukam edukacji ani instrukcji.", niePasuje: "pelnia-zdrowia" },
  { id: "poza-katalogiem", tekst: "Potrzebuję instrukcji naprawy silnika odrzutowego w samolocie.", brak: true },
];

async function main() {
  if (!process.env.DEEPSEEK_API_KEY) throw new Error("Wymagany skonfigurowany klucz dostawcy AI.");
  // Nie odczytujemy prawdziwych zgłoszeń ani nadpisań katalogu z wdrożenia.
  delete process.env.DATABASE_URL;
  const wybor = process.argv.find(a => a.startsWith("--przypadek="))?.split("=")[1];
  const probki = przypadki.filter(p => !wybor || p.id === wybor);
  assert.ok(probki.length, "Nieznany przypadek");
  let bledy = 0;
  for (const p of probki) {
    const w = await dopasuj(WejscieSwatki.parse({ tekst: p.tekst }));
    console.log(JSON.stringify({ przypadek: p.id, tekst: p.tekst, tryb: w.tryb, pytanie: w.pytanie, grupa: w.zrozumiano.grupaDocelowa, dopasowania: [...w.dopasowania, ...w.najblizsze].map(k => ({ id: k.id, trafnosc: k.trafnosc, dlaczego: k.dlaczego })), metryki: w.metryki }));
    try {
      assert.equal(w.tryb, "ai", "Test musi sprawdzać rzeczywisty model");
      if (p.pasuje) {
        const k = w.dopasowania.find(k => k.id === p.pasuje);
        assert.ok(k && k.trafnosc !== null && k.trafnosc >= p.minimum, `${p.pasuje}: oczekiwano co najmniej ${p.minimum}, otrzymano ${k?.trafnosc ?? "brak"}`);
        assert.equal(w.pytanie, null, "Znalezione dopasowanie nie wymaga blokującego doprecyzowania");
      }
      if (p.nieznanaGrupa) assert.doesNotMatch(w.zrozumiano.grupaDocelowa, /senior|starsz|dorosł|dzieci|niepełnosprawn|niepelnosprawn|intelektualn|obcokraj|cudzoziem|migran/i, "Nie przypisuj użytkownikowi wieku, pochodzenia ani diagnozy, których nie podał");
      if (p.niePasuje) assert.ok(!w.dopasowania.some(k => k.id === p.niePasuje && (k.trafnosc ?? 0) >= 70), "Edukacja nie realizuje rezerwacji wizyty");
      if (p.brak) assert.equal(w.dopasowania.length, 0, "Nie dopasowuj na siłę poza katalogiem");
    } catch (e) {
      bledy++;
      console.error(`${p.id}: ${e instanceof Error ? e.message : "Błąd"}`);
    }
  }
  assert.equal(bledy, 0, `Niezaliczone przypadki: ${bledy}/${probki.length}`);
}

main().catch(e => { console.error(e instanceof Error ? e.message : "Błąd kontroli trafności"); process.exitCode = 1; });
