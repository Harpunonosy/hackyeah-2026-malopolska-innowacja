import { test } from "node:test";
import assert from "node:assert/strict";
import { komorkaCsv } from "./csv";
test("eksport nie uruchamia formuł dostarczonych przez zgłaszającego", () => {
  for (const input of ['=HYPERLINK("x")', '  +SUM(1)', '\t@SUM(1)', '-1+2']) assert.ok(komorkaCsv(input).startsWith('"\''));
  assert.equal(komorkaCsv('Normalny "opis"'), '"Normalny ""opis"""');
  assert.equal(komorkaCsv(null), '""');
});
