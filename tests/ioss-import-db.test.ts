import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { Pool } from 'pg';
import { importujIoss } from '../lib/ioss-import-baza';
import { zapamietaj, zapomnij } from '../lib/pamiec';

const url = process.env.IOSS_TEST_DATABASE_URL;
const naglowek = 'id,kategoria,wskaznik,rok,powiat,wartosc\n';
const csv = naglowek + '186,LUDNOŚĆ,Ludność ogółem,2025,powiat bocheński,109000\n55,LUDNOŚĆ,Ludność w wieku przedprodukcyjnym,2025,powiat bocheński,19.55';

async function baza(fn: (pool: Pool) => Promise<void>) {
  const admin = new Pool({ connectionString: url });
  const schema = 'ioss_test_' + randomUUID().replaceAll('-', '');
  await admin.query(`create schema ${schema}`);
  const pool = new Pool({ connectionString: url, options: `-c search_path=${schema},public` });
  try {
    const schemaSql = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8');
    for (const nazwa of ['ioss', 'dziennik']) {
      const ddl = schemaSql.match(new RegExp('create table ' + nazwa + ' [\\s\\S]*?;'));
      assert.ok(ddl, `Brak tabeli ${nazwa} w schemacie`);
      await pool.query(ddl[0]);
    }
    await pool.query(readFileSync(new URL('../db/009_dziennik.sql', import.meta.url), 'utf8'));
    await fn(pool);
  } finally {
    await pool.end();
    await admin.query(`drop schema ${schema} cascade`);
    await admin.end();
  }
}

test('atomic upsert records audit and invalidates all IOSS views', { skip: !url }, async () => baza(async pool => {
  assert.deepEqual(await importujIoss(csv, pool), { liczba: 2, dodane: 2, zaktualizowane: 0 });
  const { rows: przed } = await pool.query('select wartosc::float8 as wartosc from ioss where wskaznik_id=186');
  assert.equal(przed[0].wartosc, 109000);
  const klucze = ['ioss', 'mapa-wskaznikow', 'profil-powiatu:bocheński', 'profil-powiatu:brzeski'];
  await Promise.all(klucze.map(k => zapamietaj(k, 600000, async () => 'stare')));
  await zapamietaj('inna-pamiec', 600000, async () => 'bez-zmian');
  assert.deepEqual(await importujIoss(csv.replace('109000', '110000'), pool), { liczba: 2, dodane: 0, zaktualizowane: 2 });
  const { rows } = await pool.query('select wartosc::float8 as wartosc from ioss where wskaznik_id=186');
  assert.equal(rows[0].wartosc, 110000);
  for (const k of klucze) assert.equal(await zapamietaj(k, 600000, async () => 'nowe'), 'nowe');
  assert.equal(await zapamietaj('inna-pamiec', 600000, async () => 'nowe'), 'bez-zmian');
  const dziennik = await pool.query('select kto, akcja, obiekt, szczegoly, opis from dziennik order by id');
  assert.equal(dziennik.rows.length, 2);
  assert.equal(dziennik.rows[0].kto, 'admin');
  assert.equal(dziennik.rows[1].szczegoly.zaktualizowane, 2);
  assert.ok(dziennik.rows[1].opis);
  for (const k of [...klucze, 'inna-pamiec']) zapomnij(k);
}));

test('invalid row prevents every write and audit entry', { skip: !url }, async () => baza(async pool => {
  await assert.rejects(() => importujIoss(csv + '\n186,LUDNOŚĆ,Ludność ogółem,2025,powiat brzeski,0', pool), /walidacja/);
  assert.equal((await pool.query('select count(*)::int as n from ioss')).rows[0].n, 0);
  assert.equal((await pool.query('select count(*)::int as n from dziennik')).rows[0].n, 0);
}));

test('audit failure rolls back inserts and updates without invalidating cache', { skip: !url }, async () => baza(async pool => {
  await importujIoss(naglowek + '186,LUDNOŚĆ,Ludność ogółem,2025,powiat bocheński,100000', pool);
  await zapamietaj('ioss', 600000, async () => 'stare');
  await pool.query("alter table dziennik add constraint blokada_importu check (akcja <> 'ioss.import') not valid");
  await assert.rejects(() => importujIoss(csv, pool), /blokada_importu/);
  const { rows } = await pool.query('select wskaznik_id, wartosc::float8 as wartosc from ioss');
  assert.deepEqual(rows, [{ wskaznik_id: 186, wartosc: 100000 }]);
  assert.equal((await pool.query('select count(*)::int as n from dziennik')).rows[0].n, 1);
  assert.equal(await zapamietaj('ioss', 600000, async () => 'nowe'), 'stare');
  zapomnij('ioss');
}));

test('version changes even when a lower audit id commits after a higher id', { skip: !url }, async () => baza(async pool => {
  const { odczytajWersjeIoss } = await import('../lib/ioss-import-cache');
  const pierwszy = await pool.connect(), drugi = await pool.connect();
  try {
    await pierwszy.query('begin');
    await drugi.query('begin');
    await pierwszy.query("insert into dziennik(kto,akcja,obiekt) values('admin','ioss.import','ioss')");
    await drugi.query("insert into dziennik(kto,akcja,obiekt) values('admin','ioss.import','ioss')");
    await drugi.query('commit');
    const przed = await odczytajWersjeIoss(pool);
    await pierwszy.query('commit');
    assert.notEqual(await odczytajWersjeIoss(pool), przed);
  } finally {
    await pierwszy.query('rollback'); await drugi.query('rollback');
    pierwszy.release(); drugi.release();
  }
}));
