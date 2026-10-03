/** Test importu przez prawdziwe API i UI. Używaj wyłącznie z lokalną bazą testową.
 * SPLOT_TEST_BASE=http://localhost:3100 DATABASE_URL=... DEMO_ADMIN_PASSWORD=... npx tsx scripts/test-ioss-ui.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Pool } from 'pg';
import AxeBuilder from '@axe-core/playwright';
import { przegladarkaTestowa } from './przegladarka';

const baza = process.env.SPLOT_TEST_BASE;
const databaseUrl = process.env.IOSS_TEST_DATABASE_URL;
if (!baza || !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(baza) || !databaseUrl || !new URL(databaseUrl).pathname.endsWith('_test')) throw new Error('Podaj lokalny SPLOT_TEST_BASE i odrębny IOSS_TEST_DATABASE_URL z nazwą bazy kończącą się _test.');
const naglowek = 'id,kategoria,wskaznik,rok,powiat,wartosc\n';
const csv = naglowek + '186,LUDNOŚĆ,Ludność ogółem,2025,powiat bocheński,110001';

async function main() {
  const browser = await przegladarkaTestowa();
  const context = await browser.newContext({ viewport: { width: 320, height: 900 } });
  const pool = new Pool({ connectionString: databaseUrl });
  const before = await pool.query('select * from ioss where wskaznik_id=186 and powiat=$1 and rok=2025', ['powiat bocheński']);
  try {
    const nieadmin = await browser.newContext();
    for (const method of ['GET', 'POST']) assert.equal((await nieadmin.request.fetch(`${baza}/api/admin/ioss/import?akcja=podglad`, { method, data: csv })).status(), 401);
    await nieadmin.close();
    assert.equal((await context.request.post(`${baza}/api/centrala/logowanie`, { data: { haslo: process.env.DEMO_ADMIN_PASSWORD } })).status(), 200);
    const page = await context.newPage();
    page.on('pageerror', e => console.error('Błąd strony', e.message));
    await page.goto(`${baza}/centrala/dane`);
    await page.getByRole('heading', { name: 'Dane statystyczne IOSS', exact: true }).waitFor();
    const commit = () => page.getByRole('button', { name: 'Zatwierdź import', exact: true });
    assert.equal(await commit().count(), 0);
    assert.equal((await context.request.post(`${baza}/api/admin/ioss/import?akcja=import`, { data: csv })).status(), 409);
    const szablon = await context.request.get(`${baza}/api/admin/ioss/import`);
    assert.equal(szablon.status(), 200);
    assert.equal((await szablon.text()).replace(/^\ufeff/, '').trim(), naglowek.trim());
    const wpisz = async (tekst: string) => {
      await page.locator('#ioss-plik').setInputFiles({ name: 'ioss.csv', mimeType: 'text/csv', buffer: Buffer.from(tekst) });
      await page.waitForFunction(wartosc => (document.querySelector('#ioss-csv') as HTMLTextAreaElement)?.value === wartosc, tekst);
    };
    await wpisz(csv.replace('110001', '0'));
    await page.getByRole('button', { name: 'Sprawdź i pokaż podgląd', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'Dane zawierają błędy' }).waitFor();
    assert.equal(await commit().count(), 0);
    await wpisz(csv);
    await page.getByRole('button', { name: 'Sprawdź i pokaż podgląd', exact: true }).click();
    await commit().waitFor();
    assert.equal((await pool.query('select count(*)::int as n from ioss where wskaznik_id=186 and powiat=$1 and rok=2025', ['powiat bocheński'])).rows[0].n, before.rows.length);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    assert.deepEqual(axe.violations.map(v => ({ id: v.id, target: v.nodes.map(n => n.target) })), []);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    // Edycja pliku usuwa podgląd i możliwość zatwierdzenia.
    await page.locator('#ioss-csv').focus();
    await page.locator('#ioss-csv').press('Control+End');
    await page.locator('#ioss-csv').press('Enter');
    assert.equal(await commit().count(), 0);
    await page.getByRole('button', { name: 'Sprawdź i pokaż podgląd', exact: true }).click();
    await commit().click();
    await page.getByRole('status').filter({ hasText: 'Import zakończony' }).waitFor();
    assert.equal((await pool.query('select wartosc::float8 as wartosc from ioss where wskaznik_id=186 and powiat=$1 and rok=2025', ['powiat bocheński'])).rows[0].wartosc, 110001);
    const audit = await pool.query("select szczegoly from dziennik where akcja='ioss.import' order by id desc limit 1");
    assert.equal(audit.rows[0].szczegoly.liczba, 1);
    const invalid = await context.request.post(`${baza}/api/admin/ioss/import?akcja=podglad`, { data: csv + '\n9999,x,x,2025,powiat bocheński,2' });
    assert.equal(invalid.status(), 400);
    const preview = await context.request.post(`${baza}/api/admin/ioss/import?akcja=podglad`, { data: csv });
    const { token } = await preview.json();
    assert.equal((await context.request.post(`${baza}/api/admin/ioss/import?akcja=import`, { data: csv.replace('110001', '110002'), headers: { 'x-ioss-podglad': token } })).status(), 409);
    assert.equal((await context.request.post(`${baza}/api/admin/ioss/import?akcja=podglad`, { data: 'ą'.repeat(524289) })).status(), 413);
    // Pełny istniejący zbiór ma jeden legacy nan, widoczny jako brak danych.
    const source = readFileSync(new URL('../data/zrodla/ioss_powiaty.csv', import.meta.url), 'utf8');
    const sourcePreview = await context.request.post(`${baza}/api/admin/ioss/import?akcja=podglad`, { data: source });
    assert.equal(sourcePreview.status(), 200);
    assert.equal((await sourcePreview.json()).braki, 1);
    console.log('IOSS UI/API: auth, szablon, walidacja, podgląd, edycja, import, audit, HMAC, 1 MB, źródłowy CSV, axe i 320 px: OK');
  } finally {
    await pool.query('delete from ioss where wskaznik_id=186 and powiat=$1 and rok=2025', ['powiat bocheński']);
    for (const w of before.rows) await pool.query('insert into ioss(wskaznik_id,kategoria,wskaznik,rok,powiat,wartosc) values($1,$2,$3,$4,$5,$6)', [w.wskaznik_id,w.kategoria,w.wskaznik,w.rok,w.powiat,w.wartosc]);
    await pool.end();
    await browser.close();
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
