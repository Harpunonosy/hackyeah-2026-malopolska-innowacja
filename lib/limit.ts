// Prosty limit zapytań w pamięci instancji (ochrona kosztów AI przed pętlą lub nadużyciem).
// Na produkcji: Redis/Upstash albo limit na bramce API.
const okna = new Map<string, number[]>();
let globalnie: number[] = [];

// Jury i goście z jednej sieci mają to samo IP, więc limity na klucz są wielokrotnością bazowych (LIMIT_MNOZNIK).
// Koszt chroni limit globalny na godzinę.
const MNOZNIK = Number(process.env.LIMIT_MNOZNIK ?? 5);
const GLOBALNIE_NA_GODZINE = Number(process.env.LIMIT_GLOBALNY ?? 3000);

export function czyWolno(klucz: string, bazaNaMinute = 12, maxNaGodzine = GLOBALNIE_NA_GODZINE): boolean {
  const maxNaMinute = Math.round(bazaNaMinute * MNOZNIK);
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
