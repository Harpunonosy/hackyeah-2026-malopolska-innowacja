/** Obszar wybrany przez model sam w sobie nie oznacza rozpoznania sprawy. */
export function maRozpoznanaPotrzebe(wynik: {
  pytanie: string | null;
  potrzeby: readonly string[];
  dopasowania: readonly unknown[];
}): boolean {
  return !wynik.pytanie?.trim() && (wynik.potrzeby.some((p) => p.trim().length > 0) || wynik.dopasowania.length > 0);
}
