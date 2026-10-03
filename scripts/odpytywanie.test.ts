import { test } from "node:test";
import assert from "node:assert/strict";

test("pamięć powiadomień nie uznaje powracającej starszej sprawy za nową", async () => {
  const { noweSprawy } = await import("../lib/odpytywanie");
  const znane = new Set<string>();
  assert.deepEqual(noweSprawy(znane, [{ id: "a" }, { id: "b" }], true), []);
  assert.deepEqual(noweSprawy(znane, [{ id: "b" }]), []);
  assert.deepEqual(noweSprawy(znane, [{ id: "a" }, { id: "b" }, { id: "c" }]), [{ id: "c" }]);
});

test("odpytywanie po błędzie ponawia i nie wykonuje żądań jednocześnie", async () => {
  const { odpytywanie } = await import("../lib/odpytywanie");
  let proby = 0;
  let rownolegle = 0;
  let maksimum = 0;
  const bledy: unknown[] = [];
  let koniec!: () => void;
  const gotowe = new Promise<void>((resolve) => { koniec = resolve; });
  const stop = odpytywanie(async () => {
    proby++;
    rownolegle++;
    maksimum = Math.max(maksimum, rownolegle);
    await new Promise((resolve) => setTimeout(resolve, 10));
    rownolegle--;
    if (proby === 1) throw new Error("offline");
    if (proby === 3) koniec();
  }, 1, (e) => bledy.push(e));
  await gotowe;
  stop();
  await new Promise((resolve) => setTimeout(resolve, 25));
  assert.equal(proby, 3);
  assert.equal(maksimum, 1);
  assert.equal(bledy.length, 1);
});

test("starsza sprawa spoza pierwszych 200 wyników nie powoduje nowego powiadomienia", async () => {
  const { noweSprawy } = await import("../lib/odpytywanie");
  const znane = new Set<string>(["a"]);
  const sprawy = [
    { id: "stara-poza-lista", created_at: "2026-10-03T10:00:00.000Z" },
    { id: "nowy-pomysl", created_at: "2026-10-03T20:00:01.000Z" },
  ];
  assert.deepEqual(noweSprawy(znane, sprawy, false, "2026-10-03T20:00:00.000Z"), [sprawy[1]]);
});
