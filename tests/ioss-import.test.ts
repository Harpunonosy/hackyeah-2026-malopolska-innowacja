import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parsujIossCsv, MAX_IOSS_BYTES, MAX_IOSS_WIERSZY } from '../lib/ioss-import';

const naglowek = 'id,kategoria,wskaznik,rok,powiat,wartosc\n';
const ludnosc = '186,LUDNOŚĆ,Ludność ogółem,2025,powiat bocheński,109000';
const procent = '55,LUDNOŚĆ,Ludność w wieku przedprodukcyjnym,2025,powiat brzeski,19.55';

test('imports source CSV without losing missing values', () => {
  const csv = readFileSync(new URL('../data/zrodla/ioss_powiaty.csv', import.meta.url), 'utf8');
  const wynik = parsujIossCsv(csv, 2026);
  assert.equal(wynik.ok, true);
  if (!wynik.ok) return;
  assert.equal(wynik.wiersze.length, 3278);
  assert.equal(wynik.wiersze.filter(w => w.wartosc === null).length, 1);
  assert.equal(wynik.wiersze[0].wartosc, 21.09);
});

test('supports BOM, CRLF, quoting and semicolon decimal comma', () => {
  const csv = '\ufeffid;kategoria;wskaznik;rok;powiat;wartosc\r\n55;LUDNOŚĆ;"Ludność w wieku przedprodukcyjnym";2025;"brzeski";19,55\r\n';
  const wynik = parsujIossCsv(csv, 2026);
  assert.equal(wynik.ok, true);
  if (!wynik.ok) return;
  assert.equal(wynik.wiersze[0].powiat, 'powiat brzeski');
  assert.equal(wynik.wiersze[0].wartosc, 19.55);
});

test('returns no importable rows if any row is invalid', () => {
  const wynik = parsujIossCsv(naglowek + ludnosc + '\n' + procent.replace('19.55', 'NaN'), 2026);
  assert.equal(wynik.ok, false);
  if (wynik.ok) return;
  assert.equal(wynik.bledy[0].wiersz, 3);
  assert.equal(wynik.bledy[0].pole, 'wartosc');
  assert.equal('wiersze' in wynik, false);
});

for (const [opis, wiersz, pole] of [
  ['future year', ludnosc.replace('2025', '2027'), 'rok'],
  ['fractional year', ludnosc.replace('2025', '2024.5'), 'rok'],
  ['unknown indicator', ludnosc.replace('186,', '9999,'), 'id'],
  ['wrong indicator label', ludnosc.replace('Ludność ogółem', 'Inny wskaźnik'), 'wskaznik'],
  ['wrong category', ludnosc.replace('LUDNOŚĆ', 'ZDROWIE'), 'kategoria'],
  ['unknown county', ludnosc.replace('powiat bocheński', 'powiat warszawski'), 'powiat'],
  ['non-finite number', ludnosc.replace('109000', 'Infinity'), 'wartosc'],
  ['scientific notation', ludnosc.replace('109000', '1e5'), 'wartosc'],
  ['negative population', ludnosc.replace('109000', '-1'), 'wartosc'],
  ['zero population', ludnosc.replace('109000', '0'), 'wartosc'],
] as const) {
  test('rejects ' + opis, () => {
    const wynik = parsujIossCsv(naglowek + wiersz, 2026);
    assert.equal(wynik.ok, false);
    if (!wynik.ok) assert.ok(wynik.bledy.some(b => b.pole === pole));
  });
}

test('rejects duplicate indicator/county/year after county normalization', () => {
  const wynik = parsujIossCsv(naglowek + ludnosc + '\n' + ludnosc.replace('powiat bocheński', 'bocheński'), 2026);
  assert.equal(wynik.ok, false);
  if (!wynik.ok) assert.equal(wynik.bledy[0].kod, 'duplikat');
});

test('accepts negative migration and zero facilities', () => {
  const csv = naglowek + '99,MOBILNOŚĆ,Saldo migracji zagranicznych,2025,powiat bocheński,-2.5\n245,POMOC SPOŁECZNA I OTOCZENIE - INFRASTRUKTURA,Dzienne domy pomocy,2025,powiat brzeski,0';
  const wynik = parsujIossCsv(csv, 2026);
  assert.equal(wynik.ok, true);
  if (wynik.ok) assert.deepEqual(wynik.wiersze.map(w => w.wartosc), [-2.5, 0]);
});

test('rejects extra units instead of silently converting source values', () => {
  const wynik = parsujIossCsv(naglowek.trim() + ',jednostka\n' + ludnosc + ',%');
  assert.equal(wynik.ok, false);
  if (!wynik.ok) assert.equal(wynik.bledy[0].kod, 'naglowek');
});

test('rejects malformed quotes, extra fields and empty file', () => {
  for (const csv of [naglowek + '"' + ludnosc, naglowek + ludnosc + ',osoby', '', naglowek]) {
    assert.equal(parsujIossCsv(csv).ok, false);
  }
});

test('limits UTF-8 bytes before parsing', () => {
  const wynik = parsujIossCsv('ą'.repeat(Math.floor(MAX_IOSS_BYTES / 2) + 1));
  assert.equal(wynik.ok, false);
  if (!wynik.ok) assert.equal(wynik.bledy[0].kod, 'rozmiar');
});

test('rejects too many rows', () => {
  const wynik = parsujIossCsv(naglowek + Array(MAX_IOSS_WIERSZY + 1).fill('1,,,,,').join('\n'));
  assert.equal(wynik.ok, false);
  if (!wynik.ok) assert.equal(wynik.bledy[0].kod, 'limit_wierszy');
});

test('rejects a row consisting only of empty columns instead of skipping it', () => {
  const wynik = parsujIossCsv(naglowek + ludnosc + '\n,,,,,');
  assert.equal(wynik.ok, false);
});
