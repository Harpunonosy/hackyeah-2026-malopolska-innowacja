import { z } from 'zod';

/** Tylko linki HTTP(S) bez danych logowania oraz ścieżki w tej aplikacji. */
export function bezpiecznyUrl(url: string): boolean {
  if (!url || /[\s\\\u0000-\u001f\u007f]/u.test(url)) return false;
  if (url.startsWith('/')) {
    try {
      const decoded = decodeURIComponent(url);
      return !decoded.startsWith('//') && !/[\\\u0000-\u001f\u007f]/u.test(decoded) && new URL(url, 'https://splot.invalid').origin === 'https://splot.invalid';
    } catch { return false; }
  }
  try {
    const parsed = new URL(url);
    return /^https?:\/\//.test(url) && ['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password;
  } catch { return false; }
}
const tekst = (max: number) => z.string().trim().min(1).max(max);
export const SlugLekcji = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
export const LekcjaSchema = z.object({
  slug: SlugLekcji,
  tytul: tekst(200),
  minuty: z.number().int().min(1).max(120),
  akapity: z.array(tekst(6000)).min(1).max(30),
  latwe: z.array(tekst(3000)).min(1).max(30),
  quiz: z.array(z.object({
    pytanie: tekst(500),
    odpowiedzi: z.array(tekst(500)).min(2).max(6),
    poprawna: z.number().int().min(0),
  }).strict().refine(q => q.poprawna < q.odpowiedzi.length, {path:['poprawna']})).min(1).max(10),
  zrodla: z.array(z.object({nazwa: tekst(300), url: tekst(2000).refine(bezpiecznyUrl)}).strict()).min(1).max(15),
}).strict();
export type MaterialLekcji = z.infer<typeof LekcjaSchema>;
export type WersjeLekcji = {szkic: MaterialLekcji; opublikowana: MaterialLekcji | null};
export type EdycjaLekcji = WersjeLekcji & {revision: number; updatedAt: string | null; publishedAt: string | null};
export const ZapisLekcji = z.object({
  lekcja: LekcjaSchema,
  akcja: z.enum(['szkic', 'publikuj']),
  revision: z.number().int().min(0),
}).strict();
export function zmienWersje(poprzednia: WersjeLekcji | null, lekcja: MaterialLekcji, akcja: 'szkic'|'publikuj'): WersjeLekcji {
  return {szkic: lekcja, opublikowana: akcja === 'publikuj' ? lekcja : poprzednia?.opublikowana ?? null};
}
export function polaczLekcje(baza: MaterialLekcji[], wiersze: WersjeLekcji[]): MaterialLekcji[] {
  const lista = new Map(baza.map(l => [l.slug,l]));
  for (const w of wiersze) if (w.opublikowana) lista.set(w.opublikowana.slug, w.opublikowana);
  return [...lista.values()];
}
export function brakTabeliAkademii(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'code' in e && e.code === '42P01' && 'message' in e && typeof e.message === 'string' && e.message.includes('"akademia_lekcje"');
}
