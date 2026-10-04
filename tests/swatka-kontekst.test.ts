import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { Pool } from "pg";
import { dopasuj } from "../lib/swatka";
import { uniewaznijKatalog } from "../lib/katalog";
import { odswiezFakty } from "../lib/fakty-baza";

function atrapy(t: TestContext, odpowiedz: { pytanie: string | null; potrzeby: string[] }) {
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
      dopasowania: [], pytanie_doprecyzowujace: odpowiedz.pytanie, nici: [],
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

test("pytanie o doprecyzowanie wyklucza kontekst także przy ogólnych potrzebach modelu", async (t) => {
  atrapy(t, { pytanie: "Z jaką sprawą potrzebujesz pomocy?", potrzeby: ["Sprawdzenie działania aplikacji"] });
  const wynik = await dopasuj({ tekst: "Czy aplikacja działa?", rola: "mieszkaniec", jezyk: "pl" });
  assert.deepEqual(wynik.fakty, []);
  assert.equal(wynik.podobnePrzypadki, null);
  assert.deepEqual(wynik.coPomoglo, []);
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
