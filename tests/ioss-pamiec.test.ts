import assert from 'node:assert/strict';
import test from 'node:test';
import { zapamietaj, zapomnij } from '../lib/pamiec';

test('an obsolete rejected loader cannot delete a newer cached value', async () => {
  const klucz = 'ioss-test-stare-zapytanie';
  let odrzuc!: (e: Error) => void;
  const stare = zapamietaj(klucz, 600000, () => new Promise<string>((_, reject) => { odrzuc = reject; }));
  const odrzucone = assert.rejects(stare, /awaria starego odczytu/);
  zapomnij(klucz);
  assert.equal(await zapamietaj(klucz, 600000, async () => 'nowe dane'), 'nowe dane');
  odrzuc(new Error('awaria starego odczytu'));
  await odrzucone;
  assert.equal(await zapamietaj(klucz, 600000, async () => 'niepotrzebny odczyt'), 'nowe dane');
  zapomnij(klucz);
});
