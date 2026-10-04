import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { Pool } from "pg";
import { dopasuj } from "../lib/swatka";
import { uniewaznijKatalog } from "../lib/katalog";
import { odswiezFakty } from "../lib/fakty-baza";
import type { skalibrujTrafnosc } from "../lib/swatka-ocena";

function atrapy(t: TestContext, odpowiedz: { pytanie: string | null; potrzeby: string[]; dopasowania?: { id: string; trafnosc: number; dlaczego: string; ocena: Parameters<typeof skalibrujTrafnosc>[1] }[] }) {
  const klucze = ["DATABASE_URL", "DEEPSEEK_API_KEY", "AI_MODEL"] as const;
  const przed = klucze.map((k) => process.env[k]);
  process.env.DATABASE_URL = "postgresql://test:fake@localhost/swatka_bez_polaczenia";
  process.env.DEEPSEEK_API_KEY = "klucz-atrapy";
  process.env.AI_MODEL = "deepseek-flash";
  uniewaznijKatalog();
  odswiezFakty();
  t.after(() => {
    klucze.forEach((k, i) => { if (przed[i] === undefined) delete process.env[k]; else process.env[k] = przed[i]; });
    uniewaznijKatalog();
    odswiezFakty();
  });
  const zapytania: string[] = [];
  // Każda kwerenda przechodzi przez atrapę; Pool nigdy nie otwiera połączenia.
  t.mock.method(Pool.prototype, "query", async (sql: string) => {
    zapytania.push(sql);
    const rows = sql.includes("from zgloszenia")
      ? Array.from({ length: 5 }, (_, i) => ({ streszczenie: `Przykładowa sprawa ${i}`, powiat: "powiat krakowski", syntetyczne: true, wspolne: 0, podobienstwo: 0 }))
      : [];
    return { rows };
  });
  t.mock.method(globalThis, "fetch", async () => Response.json({
    choices: [{ finish_reason: "stop", message: { content: JSON.stringify({
      obszar: "zdrowie", grupa_docelowa: "", potrzeby: odpowiedz.potrzeby, slowa_kluczowe: [], kryzys: false,
      dopasowania: odpowiedz.dopasowania ?? [], pytanie_doprecyzowujace: odpowiedz.pytanie, nici: [],
    }) } }],
  }));
  return zapytania;
}

test('„działasz?” zachowuje pytanie, bez statystyk, przykładów i faktów obszaru', async (t) => {
  const pytanie = "Opisz proszę problem i kogo dotyczy.";
  const zapytania = atrapy(t, { pytanie, potrzeby: [] });
  const wynik = await dopasuj({ tekst: "dzialasz?", rola: "mieszkaniec", jezyk: "pl" });
  assert.equal(wynik.tryb, "ai");
  assert.equal(wynik.pytanie, pytanie);
  assert.deepEqual(wynik.fakty, []);
  assert.equal(wynik.podobnePrzypadki, null);
  assert.deepEqual(wynik.coPomoglo, []);
  assert.ok(!zapytania.some((sql) => /from (zgloszenia|reakcje|fakty)\b/.test(sql)), "Nie pobieramy kontekstu wymuszonego obszaru AI");
});

test("wyniki są sortowane i dzielone według zgodności potrzeby, a nie sprzecznej surowej punktacji", async (t) => {
  atrapy(t, { pytanie: null, potrzeby: ["Nauka korzystania z usług medycznych"], dopasowania: [
    { id: "inteligentny-organizer-do-lekow", trafnosc: 99, dlaczego: "Organizuje leki, nie wyjaśnia korzystania z przychodni.", ocena: { potrzeba: "luzna", odbiorca: "nieustalony", forma: "niezgodna" } },
    { id: "pelnia-zdrowia", trafnosc: 55, dlaczego: "Uczy korzystania z usług medycznych.", ocena: { potrzeba: "glowna", odbiorca: "nieustalony", forma: "zgodna" } },
  ] });
  const w = await dopasuj({ tekst: "nie wiem jak umowic sie do lekarza", rola: "mieszkaniec", jezyk: "pl" });
  assert.equal(w.tryb, "ai");
  assert.deepEqual(w.dopasowania.map(k => [k.id, k.trafnosc]), [["pelnia-zdrowia", 70]]);
  assert.deepEqual(w.najblizsze.map(k => [k.id, k.trafnosc]), [["inteligentny-organizer-do-lekow", 54]]);
  assert.equal(w.brakDopasowania, false);
});

test("pytanie o doprecyzowanie wyklucza kontekst także przy ogólnych potrzebach modelu", async (t) => {
  atrapy(t, { pytanie: "Z jaką sprawą potrzebujesz pomocy?", potrzeby: ["Sprawdzenie działania aplikacji"] });
  const wynik = await dopasuj({ tekst: "Czy aplikacja działa?", rola: "mieszkaniec", jezyk: "pl" });
  assert.deepEqual(wynik.fakty, []);
  assert.equal(wynik.podobnePrzypadki, null);
  assert.deepEqual(wynik.coPomoglo, []);
});

for (const trafnosc of [55, 72]) {
  test(`dopasowanie ${trafnosc} pkt usuwa sprzeczne pytanie modelu i zachowuje kontekst potrzeby`, async (t) => {
    atrapy(t, {
      pytanie: "Czy przeszkadza Ci niepełnosprawność, wiek lub język?",
      potrzeby: ["Wyjaśnienie korzystania z usług medycznych"],
      dopasowania: [{ id: "pelnia-zdrowia", trafnosc, dlaczego: "Narzędzie uczy korzystania z usług medycznych.", ocena: { potrzeba: trafnosc === 55 ? "czesciowa" : "glowna", odbiorca: "nieustalony", forma: "zgodna" } }],
    });
    const w = await dopasuj({ tekst: "nie wiem jak umowic sie do lekarza", rola: "mieszkaniec", jezyk: "pl" });
    assert.equal(w.tryb, "ai");
    assert.equal(w.dopasowania[0]?.id, "pelnia-zdrowia");
    assert.equal(w.pytanie, null, "Znalezione rozwiązanie nie może być jednocześnie blokowane pytaniem o brak rozpoznania potrzeby");
    assert.ok(w.fakty.length > 0);
    assert.equal(w.podobnePrzypadki?.liczba, 5);
  });
}

test("nieznana karta i luźne podobieństwo nie usuwają potrzebnego doprecyzowania", async (t) => {
  const pytanie = "Z jaką czynnością potrzebujesz pomocy?";
  atrapy(t, { pytanie, potrzeby: [], dopasowania: [
    { id: "nieistniejaca-innowacja", trafnosc: 99, dlaczego: "Nieznana karta.", ocena: { potrzeba: "bezposrednia", odbiorca: "nieustalony", forma: "zgodna" } },
    { id: "pelnia-zdrowia", trafnosc: 99, dlaczego: "Nie realizuje wskazanej czynności.", ocena: { potrzeba: "luzna", odbiorca: "nieustalony", forma: "niezgodna" } },
  ] });
  const w = await dopasuj({ tekst: "potrzebuję pomocy", rola: "mieszkaniec", jezyk: "pl" });
  assert.equal(w.tryb, "ai");
  assert.equal(w.dopasowania.length, 0);
  assert.equal(w.pytanie, pytanie);
  assert.deepEqual(w.fakty, []);
});

test("sama klasyfikacja obszaru bez potrzeby i dopasowań nie uruchamia kontekstu", async (t) => {
  atrapy(t, { pytanie: null, potrzeby: ["  "] });
  const wynik = await dopasuj({ tekst: "Witam!", rola: "mieszkaniec", jezyk: "pl" });
  assert.deepEqual(wynik.fakty, []);
  assert.equal(wynik.podobnePrzypadki, null);
});

test("rzeczywisty problem bez pasującej innowacji nadal otrzymuje kontekst obszaru", async (t) => {
  const zapytania = atrapy(t, { pytanie: null, potrzeby: ["Rehabilitacja w domu po szpitalu"] });
  const wynik = await dopasuj({ tekst: "Mama potrzebuje rehabilitacji w domu po szpitalu.", rola: "mieszkaniec", jezyk: "pl" });
  assert.equal(wynik.tryb, "ai");
  assert.equal(wynik.brakDopasowania, true);
  assert.equal(wynik.pytanie, null);
  assert.ok(wynik.fakty.length > 0);
  assert.equal(wynik.podobnePrzypadki?.liczba, 5);
  assert.ok(zapytania.some((sql) => sql.includes("from zgloszenia")));
});
