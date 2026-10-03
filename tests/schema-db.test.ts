import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { Pool } from 'pg';

const url = process.env.SCHEMA_TEST_DATABASE_URL;
const bezVector = process.env.SCHEMA_TEST_WITHOUT_VECTOR === '1';
const katalog = new URL('../db/', import.meta.url);
const migracje = readdirSync(katalog).filter(n => /^\d{3}_.+\.sql$/.test(n)).sort();

async function odtworz(fn: (pool: Pool) => Promise<void>) {
  const admin = new Pool({ connectionString: url });
  const schema = 'schema_test_' + randomUUID().replaceAll('-', '');
  const pool = new Pool({ connectionString: url, options: `-c search_path=${schema},public` });
  try {
    await admin.query(`create schema ${schema}`);
    let sql = readFileSync(new URL('schema.sql', katalog), 'utf8');
    // Wyłącznie dla lokalnego Postgresa bez pgvector: ten test nie sprawdza
    // wyszukiwania wektorowego. W domyślnym trybie odtwarza także vector(1024).
    if (bezVector) sql = sql.replace('create extension if not exists vector;', '').replace('embedding vector(1024)', 'embedding text');
    await pool.query(sql);
    for (const migracja of migracje) await pool.query(readFileSync(new URL(migracja, katalog), 'utf8'));
    await fn(pool);
  } finally {
    await pool.end();
    await admin.query(`drop schema if exists ${schema} cascade`);
    await admin.end();
  }
}

test('fresh schema and migrations support grant applications and assisted reports', { skip: !url }, async () => odtworz(async pool => {
  const schemat = { pola: [{ nr: 1, pole: 'Tytuł', podpowiedz: '', limit: 120 }], kryteria: [], limity: '', kategorie: [] };
  // Pola używane przez /api/admin/nabory i /api/nabory/aktywny.
  const nabor = (await pool.query(`insert into nabory (nazwa, aktywny, schemat) values ('Nabór testowy', true, $1) returning id`, [schemat])).rows[0];
  const aktywne = await pool.query('select id, nazwa, temat, otwarty_do, przyklad, schemat from nabory where aktywny = true order by otwarty_do nulls last, nazwa limit 6');
  assert.deepEqual(aktywne.rows[0].schemat, schemat);
  // Dane kontaktowe są odrębne od treści przekazywanej do AI (lib/zgloszenia.ts).
  const zgloszenie = await pool.query(`insert into zgloszenia (numer, kanal, tresc_zamaskowana, zgoda_testy, placowka, telefon_kontakt)
    values ('SPL-TESTSCHEMA', 'asystowane', 'Potrzeba transportu.', true, 'OPS testowy', '123456789') returning zgoda_testy, placowka, telefon_kontakt`);
  assert.deepEqual(zgloszenie.rows[0], { zgoda_testy: true, placowka: 'OPS testowy', telefon_kontakt: '123456789' });
  const wniosek = (await pool.query(`insert into wnioski (nabor_id, pola, status) values ($1, '{}', 'zlozony') returning id, etapy`, [nabor.id])).rows[0];
  assert.deepEqual(wniosek.etapy, {});
  // Odpowiednik aktualizacji lib/wnioski.ts i eksportu do bazy grantowej.
  await pool.query(`update wnioski set status='decyzja', etapy=etapy || jsonb_build_object('decyzja', now()), decyzja='przyznano', decyzja_at=now(), eksport_at=now() where id=$1`, [wniosek.id]);
  const decyzja = (await pool.query('select decyzja, decyzja_at, eksport_at, etapy from wnioski where id=$1', [wniosek.id])).rows[0];
  assert.equal(decyzja.decyzja, 'przyznano');
  assert.ok(decyzja.decyzja_at);
  assert.ok(decyzja.eksport_at);
  assert.ok(decyzja.etapy.decyzja);
}));

test('reapplying migrations preserves a configured grant schema and existing data', { skip: !url }, async () => odtworz(async pool => {
  const schemat = { pola: [{ nr: 1, pole: 'Opis' }] };
  const nabor = (await pool.query(`insert into nabory (nazwa, schemat) values ('Istniejący nabór', $1) returning id`, [schemat])).rows[0];
  for (const migracja of migracje) await pool.query(readFileSync(new URL(migracja, katalog), 'utf8'));
  const wynik = (await pool.query('select nazwa, schemat from nabory where id=$1', [nabor.id])).rows[0];
  assert.deepEqual(wynik, { nazwa: 'Istniejący nabór', schemat });
}));
