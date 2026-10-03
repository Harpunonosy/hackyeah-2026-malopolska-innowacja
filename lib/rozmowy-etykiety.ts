// Etykiety rodzajów rozmów. Bez zależności serwerowych, bo używane też w komponentach klienckich.
export const RODZAJE_ETYKIETY = {
  pomoc: "Chcę pomóc",
  test: "Chcę przetestować",
  podobny: "Mam podobny problem",
  partner: "Mogę być partnerem",
} as const;
export type RodzajRozmowy = keyof typeof RODZAJE_ETYKIETY;
