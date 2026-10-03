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
