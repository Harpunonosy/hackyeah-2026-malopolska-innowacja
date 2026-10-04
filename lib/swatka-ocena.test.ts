import assert from "node:assert/strict";
import { test } from "node:test";
import { skalibrujTrafnosc } from "./swatka-ocena";

test("brak informacji o odbiorcy nie obniża bezpośredniego dopasowania potrzeby", () => {
  assert.equal(skalibrujTrafnosc(62, { potrzeba: "bezposrednia", odbiorca: "nieustalony", forma: "zgodna" }), 85);
});

test("odpowiedź na główną potrzebę edukacyjną nie jest częściowym dopasowaniem", () => {
  assert.equal(skalibrujTrafnosc(55, { potrzeba: "glowna", odbiorca: "nieustalony", forma: "zgodna" }), 70);
});

test("rzeczywista sprzeczność grupy albo konieczna adaptacja ogranicza dopasowanie", () => {
  assert.equal(skalibrujTrafnosc(95, { potrzeba: "bezposrednia", odbiorca: "sprzeczny", forma: "zgodna" }), 69);
  assert.equal(skalibrujTrafnosc(95, { potrzeba: "bezposrednia", odbiorca: "zgodny", forma: "wymaga_adaptacji" }), 69);
});

test("zgodność tematu nie wystarcza, gdy forma pomocy nie realizuje potrzeby", () => {
  assert.equal(skalibrujTrafnosc(95, { potrzeba: "bezposrednia", odbiorca: "zgodny", forma: "niezgodna" }), 54);
  assert.equal(skalibrujTrafnosc(95, { potrzeba: "luzna", odbiorca: "nieustalony", forma: "zgodna" }), 54);
  assert.equal(skalibrujTrafnosc(35, { potrzeba: "czesciowa", odbiorca: "nieustalony", forma: "zgodna" }), 35);
});

test("zachowuje ocenę zgodną z kategorią, zaokrągla i ogranicza zakres", () => {
  assert.equal(skalibrujTrafnosc(92, { potrzeba: "bezposrednia", odbiorca: "zgodny", forma: "zgodna" }), 92);
  assert.equal(skalibrujTrafnosc(78.4, { potrzeba: "glowna", odbiorca: "nieustalony", forma: "zgodna" }), 78);
  assert.equal(skalibrujTrafnosc(300, { potrzeba: "bezposrednia", odbiorca: "zgodny", forma: "zgodna" }), 100);
  assert.equal(skalibrujTrafnosc(-10, { potrzeba: "luzna", odbiorca: "nieustalony", forma: "zgodna" }), 0);
});
