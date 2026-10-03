// Stałe bez zależności serwerowych: używane też w komponentach klienckich.
export const TYPY_INSTYTUCJI = {
  gmina: "Gmina lub powiat",
  ops_cus: "Ośrodek pomocy społecznej lub Centrum Usług Społecznych",
  ngo: "Organizacja pozarządowa",
  ekonomia_spoleczna: "Podmiot ekonomii społecznej",
  szkola: "Szkoła lub placówka oświatowa",
  inna: "Inna instytucja",
} as const;
export type TypInstytucji = keyof typeof TYPY_INSTYTUCJI;

export const BUDZETY = { do_150: "do 150 tys. zł", od_150_do_350: "150–350 tys. zł", od_350_do_600: "350–600 tys. zł" } as const;
export const MAX_BUDZET: Record<keyof typeof BUDZETY, number> = { do_150: 150000, od_150_do_350: 350000, od_350_do_600: 600000 };


export const KRYTERIA_DI = {
  w_spolecznosci: "Usługa w społeczności lokalnej, blisko domu (nie w placówce całodobowej)",
  podmiotowosc: "Odbiorca współdecyduje o wsparciu i ma wybór",
  indywidualizacja: "Wsparcie dopasowane do osoby (plan indywidualny)",
  niezaleznosc: "Wzmacnia samodzielność i naturalną sieć wsparcia (rodzina, sąsiedzi)",
  koordynacja: "Współpraca z innymi usługami (OPS, CUS, zdrowie, edukacja)",
} as const;
