export const STATUSY = ["wyslane", "przeczytane", "w_analizie", "u_eksperta", "potrzebne_info", "odpowiedz", "zamkniete"] as const;
export type Status = (typeof STATUSY)[number];

export const ETYKIETY_STATUSOW: Record<Status, { etykieta: string; opis: string }> = {
  wyslane: { etykieta: "Wysłane", opis: "Twoje zgłoszenie dotarło do ROPS." },
  przeczytane: { etykieta: "Przeczytane", opis: "Pracownik ROPS otworzył Twoje zgłoszenie." },
  w_analizie: { etykieta: "W analizie", opis: "Pracownik sprawdza, jak najlepiej Ci pomóc." },
  u_eksperta: { etykieta: "U eksperta", opis: "Zgłoszenie trafiło do eksperta z tej dziedziny." },
  potrzebne_info: { etykieta: "Potrzebujemy informacji", opis: "Prosimy o uzupełnienie zgłoszenia." },
  odpowiedz: { etykieta: "Jest odpowiedź", opis: "ROPS odpowiedział na Twoje zgłoszenie." },
  zamkniete: { etykieta: "Zamknięte", opis: "Sprawa jest zakończona." },
};

export const ETYKIETY_PRIORYTETU = ["Kryzys", "Wysoki", "Normalny", "Niski"] as const;
