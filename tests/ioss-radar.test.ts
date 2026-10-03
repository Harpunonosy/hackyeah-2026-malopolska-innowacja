import assert from 'node:assert/strict';
import test from 'node:test';
import { policzDaneIoss } from '../lib/radar';

// Użycie zerowej ludności w mianowniku psułoby również wyniki pozostałych powiatów.
test('zero population does not create non-finite risks in any county', () => {
  const dane = policzDaneIoss([
    { wskaznik_id: 186, powiat: 'powiat bocheński', wartosc: 0 },
    { wskaznik_id: 186, powiat: 'powiat brzeski', wartosc: 100000 },
    { wskaznik_id: 245, powiat: 'powiat bocheński', wartosc: 1 },
    { wskaznik_id: 245, powiat: 'powiat brzeski', wartosc: 2 },
    { wskaznik_id: 285, powiat: 'powiat bocheński', wartosc: 20 },
    { wskaznik_id: 285, powiat: 'powiat brzeski', wartosc: 10 },
  ]);
  for (const obszar of Object.values(dane.ryzyko)) for (const wartosc of Object.values(obszar)) assert.ok(Number.isFinite(wartosc));
  assert.equal(dane.ryzyko.seniorzy['powiat brzeski'], -0.5);
  assert.equal(dane.ryzyko.seniorzy['powiat bocheński'], 1);
});
