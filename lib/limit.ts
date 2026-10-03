// Prosty limit zapytań w pamięci instancji (ochrona kosztów AI przed pętlą lub nadużyciem).
// Na produkcji: Redis/Upstash albo limit na bramce API.
const okna = new Map<string, number[]>();
let globalnie: number[] = [];

export function czyWolno(klucz: string, maxNaMinute = 12, maxNaGodzine = 800): boolean {
  const teraz = Date.now();
  globalnie = globalnie.filter((t) => teraz - t < 3_600_000);
  if (globalnie.length >= maxNaGodzine) return false;
  const swieze = (okna.get(klucz) ?? []).filter((t) => teraz - t < 60_000);
  if (swieze.length >= maxNaMinute) {
    okna.set(klucz, swieze);
    return false;
  }
  swieze.push(teraz);
  okna.set(klucz, swieze);
  globalnie.push(teraz);
  if (okna.size > 5000) okna.clear();
  return true;
}
