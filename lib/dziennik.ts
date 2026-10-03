import { db } from "./db";

/** Wpis w dzienniku zmian treści. Bez treści zgłoszeń użytkowników. */
export async function zapiszWDzienniku(akcja: string, obiekt: string, opis?: string, kto = "admin") {
  try {
    await db().query("insert into dziennik (kto, akcja, obiekt, opis) values ($1,$2,$3,$4)", [kto, akcja, obiekt, opis ?? null]);
  } catch (e) {
    console.error("Dziennik: błąd zapisu", e instanceof Error ? e.message : "?");
  }
}
