// Deterministyczne wykrywanie kryzysu. Działa zawsze, także gdy AI jest niedostępne.
export type RodzajKryzysu = "zycie" | "przemoc";

const fold = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");

const ZYCIE = [
  "samobo", "odebrac sobie zycie", "zabic sie", "nie chce zyc", "nie chce juz zyc", "chce umrzec",
  "targnac sie", "skonczyc ze soba", "nie warto zyc", "zagrozenie zycia", "boje sie o zycie",
];
const PRZEMOC = [
  "przemoc", "bije mnie", "bije dziec", "bije mnie", "gwalt", "znecaj", "molestuj", "grozi mi",
  "grozi nam", "bije zone", "bije matke", "bije mame",
];

export function wykryjKryzys(tekst: string): RodzajKryzysu | null {
  const t = fold(tekst);
  if (ZYCIE.some((w) => t.includes(w))) return "zycie";
  if (PRZEMOC.some((w) => t.includes(w))) return "przemoc";
  return null;
}

export const TELEFONY_KRYZYSOWE = [
  { numer: "112", opis: "Numer alarmowy. Gdy ktoś jest w niebezpieczeństwie teraz.", rodzaje: ["zycie", "przemoc"] },
  { numer: "116123", wyswietl: "116 123", opis: "Telefon zaufania dla dorosłych w kryzysie emocjonalnym.", rodzaje: ["zycie", "przemoc"] },
  { numer: "800702222", wyswietl: "800 70 2222", opis: "Centrum Wsparcia, całodobowo.", rodzaje: ["zycie"] },
  { numer: "116111", wyswietl: "116 111", opis: "Telefon zaufania dla dzieci i młodzieży.", rodzaje: ["zycie", "przemoc"] },
  { numer: "800120002", wyswietl: "800 120 002", opis: "Niebieska Linia, pomoc dla osób doświadczających przemocy w rodzinie.", rodzaje: ["przemoc"] },
] as const;
