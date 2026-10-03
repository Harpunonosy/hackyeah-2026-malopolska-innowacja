// Etykiety typów spraw. Bez zależności serwerowych, bo używane też w komponentach klienckich.
export const TYPY_SPRAW = ["problem", "pomysl", "pytanie", "wniosek", "zapis", "ogloszenie", "wyzwanie"] as const;
export type TypSprawy = (typeof TYPY_SPRAW)[number];

export const ETYKIETY_TYPOW: Record<TypSprawy, string> = {
  problem: "Problem",
  pomysl: "Pomysł",
  pytanie: "Pytanie",
  wniosek: "Wniosek",
  zapis: "Zapis na test",
  ogloszenie: "Ogłoszenie",
  wyzwanie: "Wyzwanie gminy",
};
