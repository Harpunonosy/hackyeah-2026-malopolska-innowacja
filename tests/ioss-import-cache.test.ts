import assert from 'node:assert/strict';
import test from 'node:test';
import { utworzSynchronizacjeIoss } from '../lib/ioss-import-cache';

test('two instances replace old cached data when shared audit version changes', async () => {
  let wersja = '0', teraz = 1000;
  const dane = [{ cached: 'stare', invalidacje: 0 }, { cached: 'stare', invalidacje: 0 }];
  const instancje = dane.map(d => utworzSynchronizacjeIoss(async () => wersja, () => { d.cached = 'nowe'; d.invalidacje++; }, () => teraz));
  await Promise.all(instancje.map(i => i.sprawdz()));
  assert.deepEqual(dane.map(d => d.invalidacje), [0, 0]);
  wersja = '1';
  instancje[0].zastosujWersje(wersja);
  assert.deepEqual(dane.map(d => d.cached), ['nowe', 'stare']);
  teraz += 3001;
  await instancje[1].sprawdz();
  assert.deepEqual(dane.map(d => d.cached), ['nowe', 'nowe']);
  assert.deepEqual(dane.map(d => d.invalidacje), [1, 1]);
});

test('parallel readers share one probe and database errors are retried', async () => {
  let odczyty = 0, awaria = true;
  const instancja = utworzSynchronizacjeIoss(async () => { odczyty++; if (awaria) throw new Error('db unavailable'); return '1'; }, () => {}, () => 1000);
  const results = await Promise.allSettled([instancja.sprawdz(), instancja.sprawdz(), instancja.sprawdz()]);
  assert.equal(odczyty, 1);
  assert.ok(results.every(r => r.status === 'rejected'));
  awaria = false;
  await instancja.sprawdz();
  assert.equal(odczyty, 2);
  await instancja.sprawdz();
  assert.equal(odczyty, 2);
});

test('probe started before local import cannot restore obsolete version', async () => {
  let resolve!: (value: string) => void, invalidacje = 0, teraz = 1000, czyPierwszy = true;
  const instancja = utworzSynchronizacjeIoss(() => czyPierwszy ? new Promise(r => { resolve = r; czyPierwszy = false; }) : Promise.resolve('2'), () => { invalidacje++; }, () => teraz);
  const probe = instancja.sprawdz();
  instancja.zastosujWersje('2');
  resolve('1');
  await probe;
  assert.equal(invalidacje, 1);
  teraz += 3001;
  await instancja.sprawdz();
  assert.equal(invalidacje, 1);
});
