import { z } from "zod";
export const OpiniaSchema = z.object({
  innowacjaId: z.string().min(1).max(200).optional(),
  testId: z.string().uuid().optional(),
  ocena: z.number().int().min(1).max(5),
  latwe: z.string().trim().max(500).optional().default(""),
  trudne: z.string().trim().max(500).optional().default(""),
  polecilbys: z.enum(["tak", "nie", "moze"]),
  propozycja: z.string().trim().max(800).optional().default(""),
}).refine(d => Boolean(d.innowacjaId) !== Boolean(d.testId), "Wybierz jeden test albo jedną innowację.");
