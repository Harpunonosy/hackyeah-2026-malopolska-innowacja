// 8 obszarów z Mapy Wyzwań Społecznych ROPS. To nasza taksonomia potrzeb.
export const OBSZARY = [
  { id: "rodzina_piecza", nazwa: "Rodzina i piecza zastępcza" },
  { id: "bezdomnosc", nazwa: "Bezdomność" },
  { id: "niepelnosprawnosc", nazwa: "Niepełnosprawność" },
  { id: "ubostwo", nazwa: "Ubóstwo" },
  { id: "cudzoziemcy", nazwa: "Integracja cudzoziemców" },
  { id: "zdrowie", nazwa: "Zdrowie" },
  { id: "zdrowie_psychiczne", nazwa: "Zdrowie psychiczne" },
  { id: "seniorzy", nazwa: "Seniorzy" },
] as const;

export type ObszarId = (typeof OBSZARY)[number]["id"];

export const OBSZAR_IDS = OBSZARY.map((o) => o.id) as [ObszarId, ...ObszarId[]];

export function nazwaObszaru(id: ObszarId): string {
  return OBSZARY.find((o) => o.id === id)?.nazwa ?? id;
}

// Kategoria Biblioteki ROPS -> obszar Mapy Wyzwań (przybliżenie na potrzeby filtrów i danych lokalnych).
export const OBSZAR_KATEGORII: Record<string, ObszarId> = {
  Seniorzy: "seniorzy",
  "Dzieci, młodzież i rodzina": "rodzina_piecza",
  "Rynek pracy": "ubostwo",
  "Osoby o ograniczonej mobilności": "niepelnosprawnosc",
  "Niepełnosprawność sensoryczna": "niepelnosprawnosc",
  "Niepełnosprawność intelektualna": "niepelnosprawnosc",
  Cudzoziemcy: "cudzoziemcy",
  "Kryzys bezdomności": "bezdomnosc",
  "Zdrowie i medycyna": "zdrowie",
};
