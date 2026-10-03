import type { Innowacja } from "./biblioteka";

/** Pola innowacji udostępniane w publicznym API v1. */
export const innowacjaPubliczna = ({ id, nazwa, kategoria, naCzymPolega, problem, grupaDocelowa, ktoMozeSkorzystac, czyToDziala, autor, film, folderPdf, url }: Innowacja) =>
  ({ id, nazwa, kategoria, naCzymPolega, problem, grupaDocelowa, ktoMozeSkorzystac, czyToDziala, autor, filmy: film, folderyPdf: folderPdf, url, link: `/wiedza/biblioteka/${id}` });
