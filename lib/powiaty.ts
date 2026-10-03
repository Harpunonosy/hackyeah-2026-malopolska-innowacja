// Nazwy powiatów zgodne z IOSS (ROPS). Zgłoszenia zapisujemy pod tymi nazwami, żeby Radar mógł je łączyć ze wskaźnikami.
export const POWIATY_IOSS = [
  "powiat bocheński", "powiat brzeski", "powiat chrzanowski", "powiat dąbrowski", "powiat gorlicki", "powiat krakowski",
  "powiat limanowski", "powiat m. Kraków", "powiat m. Nowy Sącz", "powiat m. Tarnów", "powiat miechowski", "powiat myślenicki",
  "powiat nowosądecki", "powiat nowotarski", "powiat olkuski", "powiat oświęcimski", "powiat proszowicki", "powiat suski",
  "powiat tarnowski", "powiat tatrzański", "powiat wadowicki", "powiat wielicki",
] as const;

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l").replace(/^powiat\s+/, "").trim();

export function normalizujPowiat(wejscie: string | null | undefined): string | null {
  if (!wejscie) return null;
  const f = fold(wejscie);
  return POWIATY_IOSS.find((p) => fold(p) === f) ?? null;
}

export const KRAJOWE_SKROTY: Record<string, string> = Object.fromEntries(POWIATY_IOSS.map((p) => [p, p.replace("powiat ", "").replace("m. ", "")]));
