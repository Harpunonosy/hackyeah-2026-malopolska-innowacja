import { z } from "zod";

export const OcenaDopasowania = z.object({
  potrzeba: z.enum(["bezposrednia", "glowna", "czesciowa", "luzna"]),
  odbiorca: z.enum(["zgodny", "nieustalony", "sprzeczny"]),
  forma: z.enum(["zgodna", "wymaga_adaptacji", "niezgodna"]),
});

export function skalibrujTrafnosc(trafnosc: number, ocena: z.infer<typeof OcenaDopasowania>): number {
  const przedzialy = { bezposrednia: [85, 100], glowna: [70, 84], czesciowa: [0, 69], luzna: [0, 54] } as const;
  const [min, max] = przedzialy[ocena.potrzeba];
  const ocenaPotrzeby = Math.max(min, Math.min(max, Math.round(trafnosc)));
  // Brak danych o odbiorcy jest neutralny. Ograniczamy tylko za wykazaną barierę.
  const limit = ocena.forma === "niezgodna" ? 54
    : ocena.odbiorca === "sprzeczny" || ocena.forma === "wymaga_adaptacji" ? 69 : 100;
  return Math.min(ocenaPotrzeby, limit);
}
