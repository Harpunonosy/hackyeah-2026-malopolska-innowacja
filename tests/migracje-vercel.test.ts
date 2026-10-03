import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { odczytajMigracje, ustawieniaPolaczenia, zastosujMigracje } from '../scripts/migracje-vercel.mjs';

const migracje = [
  { nazwa: '013_akademia.sql', sha256: 'a'.repeat(64), sql: 'CREATE AKADEMIA' },
  { nazwa: '014_odtwarzalnosc.sql', sha256: 'b'.repeat(64), sql: 'ALTER NABORY' },
];

class BazaTestowa {
  zapisane = new Map<string, string>();
  wykonane: string[] = [];
  zapytania: string[] = [];
  bladSql = '';
  snapshot = new Map<string, string>();
  async query(sql: string, parametry: string[] = []) {
    this.zapytania.push(sql);
    if (sql === 'BEGIN') this.snapshot = new Map(this.zapisane);
    if (sql === 'ROLLBACK') { this.zapisane = this.snapshot; this.wykonane = []; }
    if (sql === this.bladSql) throw new Error('Awaria SQL');
    if (sql.startsWith('SELECT nazwa, sha256')) return { rows: [...this.zapisane].map(([nazwa, sha256]) => ({ nazwa, sha256 })) };
    if (sql.startsWith('INSERT INTO public.splot_migracje')) this.zapisane.set(parametry[0], parametry[1]);
    if (migracje.some(m => m.sql === sql)) this.wykonane.push(sql);
    return { rows: [] };
  }
}

test('Vercel uruchamia migracje przed buildem bez dodatkowego polecenia użytkownika', () => {
  const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(vercel.buildCommand, 'npm run build:vercel');
  assert.equal(pkg.scripts['build:vercel'], 'node scripts/migruj.mjs && npm run build');
  assert.equal(pkg.scripts.build, 'next build');
});

test('deploy stosuje migracje w transakcji, blokuje równoległe wykonanie i zapisuje dziennik', async () => {
  const baza = new BazaTestowa();
  const komunikaty: string[] = [];
  await zastosujMigracje(baza, migracje, (s: string) => komunikaty.push(s));
  assert.deepEqual(baza.wykonane, ['CREATE AKADEMIA', 'ALTER NABORY']);
  assert.equal(baza.zapisane.size, 2);
  assert.equal(baza.zapytania[0], 'BEGIN');
  assert.equal(baza.zapytania.at(-1), 'COMMIT');
  const blokada = baza.zapytania.findIndex(q => q.includes('pg_advisory_xact_lock'));
  assert.ok(blokada > 0 && blokada < baza.zapytania.indexOf('CREATE AKADEMIA'));
  assert.ok(baza.zapytania.some(q => q.includes('splot_migracje ENABLE ROW LEVEL SECURITY')));
  assert.equal(komunikaty.length, 2);
});

test('kolejny deploy pomija zastosowane migracje i nie zmienia danych', async () => {
  const baza = new BazaTestowa();
  await zastosujMigracje(baza, migracje);
  baza.wykonane = [];
  await zastosujMigracje(baza, migracje);
  assert.deepEqual(baza.wykonane, []);
  assert.equal(baza.zapisane.size, 2);
});

test('błąd drugiej migracji wycofuje pierwszą migrację i dziennik', async () => {
  const baza = new BazaTestowa();
  baza.bladSql = 'ALTER NABORY';
  await assert.rejects(zastosujMigracje(baza, migracje), /Awaria SQL/);
  assert.deepEqual(baza.wykonane, []);
  assert.equal(baza.zapisane.size, 0);
  assert.equal(baza.zapytania.at(-1), 'ROLLBACK');
  assert.ok(!baza.zapytania.includes('COMMIT'));
});

test('zmieniona zastosowana migracja blokuje deploy przed wykonaniem nowego SQL', async () => {
  const baza = new BazaTestowa();
  baza.zapisane.set(migracje[1].nazwa, 'inna-suma');
  await assert.rejects(zastosujMigracje(baza, migracje), /Zmieniono zastosowaną migrację/);
  assert.deepEqual(baza.wykonane, []);
  assert.equal(baza.zapytania.at(-1), 'ROLLBACK');
});

test('manifest zawiera tylko dwie nowe, addytywne migracje i rzeczywiste sumy SHA256', async () => {
  const pliki = await odczytajMigracje();
  assert.deepEqual(pliki.map(m => m.nazwa), ['013_akademia.sql', '014_odtwarzalnosc.sql']);
  for (const plik of pliki) {
    assert.match(plik.sha256, /^[a-f0-9]{64}$/);
    assert.ok(!/\b(drop|truncate|delete)\b/i.test(plik.sql));
  }
});

test('brak konfiguracji blokuje migrację; połączenie lokalne jest bez TLS, zdalne z TLS', () => {
  assert.throws(() => ustawieniaPolaczenia({}), /DATABASE_URL/);
  assert.throws(() => ustawieniaPolaczenia({ DATABASE_URL: 'sekret-niepoprawny-url' }), /Niepoprawny DATABASE_URL/);
  assert.equal(ustawieniaPolaczenia({ DATABASE_URL: 'postgresql://u:p@127.0.0.1/test' }).ssl, false);
  assert.deepEqual(ustawieniaPolaczenia({ DATABASE_URL: 'postgresql://u:p@db.example.com/test' }).ssl, { rejectUnauthorized: false });
});
