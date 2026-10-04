import test from 'node:test';
import assert from 'node:assert/strict';
import { szukaj } from './szukaj';
import { innowacje } from './biblioteka';
test('wyszukiwanie respektuje aktualny katalog, także dodane i ukryte karty', () => {
  const dodana={...innowacje[0],id:'nowa',nazwa:'Sąsiedzkie telefony',problem:'samotność seniorów',grupaDocelowa:'samotni seniorzy'};
  assert.deepEqual(szukaj('samotność seniorów',5,[]),[]);
  const wyniki=szukaj('samotność seniorów',5,[dodana]);
  assert.deepEqual(wyniki.map(w=>w.id),['nowa']);
});
