"use client";
import { COOKIE_DOSTEPNOSC, type UstawieniaDostepnosci } from "./dostepnosc";

export const ZDARZENIE_A11Y = "splot:a11y";

/** Zastosowanie ustawień dostępności w przeglądarce: atrybuty strony, cookie (bez migotania przy kolejnej wizycie) i powiadomienie paska. */
export function zastosujUstawienia(u: UstawieniaDostepnosci) {
  const el = document.documentElement;
  el.dataset.prosty = u.prosty ? "tak" : "nie";
  el.dataset.rozmiar = u.rozmiar;
  el.dataset.kontrast = u.kontrast;
  document.cookie = `${COOKIE_DOSTEPNOSC}=${encodeURIComponent(JSON.stringify(u))}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new CustomEvent(ZDARZENIE_A11Y, { detail: u }));
}
