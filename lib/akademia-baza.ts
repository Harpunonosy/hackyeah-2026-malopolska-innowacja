import baza from '@/data/akademia.json';
import { db } from './db';
import { brakTabeliAkademii, LekcjaSchema, polaczLekcje, zmienWersje, type EdycjaLekcji, type MaterialLekcji } from './akademia';

export class KonfliktAkademii extends Error {}
export class BrakMagazynuAkademii extends Error {}
const bazowe = baza.lekcje.map(l => LekcjaSchema.parse(l));
type Wiersz = {szkic: unknown; opublikowana: unknown; revision: number; updated_at: Date; published_at: Date | null};
function odczytaj(w: Wiersz): EdycjaLekcji {
  return {szkic: LekcjaSchema.parse(w.szkic), opublikowana: w.opublikowana ? LekcjaSchema.parse(w.opublikowana) : null, revision:w.revision, updatedAt:w.updated_at.toISOString(), publishedAt:w.published_at?.toISOString() ?? null};
}
async function wiersze(): Promise<{gotowa: boolean; lekcje: EdycjaLekcji[]}> {
  if (!process.env.DATABASE_URL) return {gotowa:false,lekcje:[]};
  try {
    const {rows} = await db().query<Wiersz>('select szkic, opublikowana, revision, updated_at, published_at from akademia_lekcje order by updated_at, slug');
    return {gotowa:true, lekcje:rows.map(odczytaj)};
  } catch (e) {
    if (brakTabeliAkademii(e)) return {gotowa:false,lekcje:[]};
    throw e; // Nie ukrywamy awarii sieci, uprawnień ani nieprawidłowych danych.
  }
}
export async function publiczneLekcje(): Promise<MaterialLekcji[]> {
  return polaczLekcje(bazowe, (await wiersze()).lekcje);
}
export async function lekcjeDoEdycji() {
  const zapisane = await wiersze();
  const lista = new Map<string,EdycjaLekcji>(bazowe.map(l => [l.slug,{szkic:l,opublikowana:l,revision:0,updatedAt:null,publishedAt:null}]));
  for (const l of zapisane.lekcje) lista.set(l.szkic.slug, l);
  return {gotowa:zapisane.gotowa, lekcje:[...lista.values()]};
}
export async function zapiszLekcje(lekcja: MaterialLekcji, akcja: 'szkic'|'publikuj', revision: number): Promise<EdycjaLekcji> {
  if (!process.env.DATABASE_URL) throw new BrakMagazynuAkademii();
  const c = await db().connect();
  try {
    await c.query('begin');
    const {rows} = await c.query<Wiersz>('select szkic, opublikowana, revision, updated_at, published_at from akademia_lekcje where slug=$1 for update',[lekcja.slug]);
    const poprzednia = rows[0] ? odczytaj(rows[0]) : null;
    if ((poprzednia?.revision ?? 0) !== revision) throw new KonfliktAkademii();
    const w = zmienWersje(poprzednia,lekcja,akcja);
    const zapis = await c.query<Wiersz>(`insert into akademia_lekcje (slug,szkic,opublikowana,revision,published_at) values ($1,$2,$3,1,case when $4 then now() else $6::timestamptz end)
      on conflict (slug) do update set szkic=excluded.szkic,opublikowana=excluded.opublikowana,revision=akademia_lekcje.revision+1,updated_at=now(),published_at=case when $4 then now() else akademia_lekcje.published_at end
      where akademia_lekcje.revision=$5 returning szkic,opublikowana,revision,updated_at,published_at`,[lekcja.slug,JSON.stringify(w.szkic),w.opublikowana ? JSON.stringify(w.opublikowana) : null, akcja === 'publikuj',revision,poprzednia?.publishedAt ?? null]);
    if (!zapis.rows[0]) throw new KonfliktAkademii();
    await c.query('insert into dziennik (kto,akcja,obiekt,opis) values ($1,$2,$3,$4)', ['admin',akcja === 'publikuj' ? 'akademia_publikacja' : 'akademia_szkic',lekcja.slug,`revision=${zapis.rows[0].revision}`]);
    await c.query('commit');
    return odczytaj(zapis.rows[0]);
  } catch (e) {
    await c.query('rollback');
    if (brakTabeliAkademii(e)) throw new BrakMagazynuAkademii();
    throw e;
  } finally { c.release(); }
}
