import { z } from 'zod';
import { zamaskuj } from './maskowanie';
const tekst = z.string().max(3000);
export const Fiszka = z.object({
  tytul:z.string().trim().min(3).max(160), opis:z.string().trim().min(3).max(600),
  istota:z.string().trim().min(3).max(1200), dla_kogo:z.string().trim().min(3).max(400),
  etap:z.enum(['pomysl','prototyp','przetestowane','gotowe']),
  oceny:z.array(z.object({id:z.string().max(80),nazwa:tekst,prog:z.number().min(0).max(10),punkty:z.number().min(0).max(10),uzasadnienie:tekst,wskazowka:tekst,ok:z.boolean()})).max(5).optional(),
  podobne:z.array(z.object({id:z.string().max(150),nazwa:tekst,roznica:tekst})).max(3).optional(),
  kanwa:z.record(z.string().max(80),z.union([tekst,z.number().min(0).max(100),z.record(z.string().max(80),tekst)])).refine(x=>Object.keys(x).length<=60).optional(),
  powiat:z.string().trim().max(60).optional(),
});
export function anonimizujFiszke(fiszka: z.infer<typeof Fiszka>): z.infer<typeof Fiszka> {
  function maskuj(v: unknown): unknown {
    if (typeof v === 'string') return zamaskuj(v).tekst;
    if (Array.isArray(v)) return v.map(maskuj);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,maskuj(x)]));
    return v;
  }
  return maskuj(fiszka) as z.infer<typeof Fiszka>;
}
