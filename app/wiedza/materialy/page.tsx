import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Strona } from '@/components/strona';
import { NaglowekStrony } from '@/components/naglowek-strony';
import { dataPobrania, znajdzMaterialy, zrodlaRops } from '@/lib/materialy-rops';
export const metadata: Metadata={title:'Raporty i publikacje ROPS'};
export default async function Materialy({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const s=await searchParams;
  const q=typeof s.q==='string'?s.q.slice(0,200):'';
  const rodzaj=typeof s.rodzaj==='string'?s.rodzaj:'';
  const wyniki=znajdzMaterialy(q,rodzaj);
  const stron=Math.max(1,Math.ceil(wyniki.length/12));
  const numer=Number(typeof s.strona==='string'?s.strona:1);
  const strona=Math.max(1,Math.min(stron,Number.isFinite(numer)?Math.floor(numer):1));
  const t=await getTranslations('materialyRops');
  const href=(r:string,n=1)=>`/wiedza/materialy?${new URLSearchParams({q,rodzaj:r,strona:String(n)})}`;
  return <Strona>
    <NaglowekStrony nadtytul={t('nadtytul')} tytul={t('tytul')} opis={t('opis')}/>
    <form action="/wiedza/materialy" className="karta flex flex-wrap items-end gap-3 p-5">
      <div className="min-w-0 flex-1 space-y-2"><label htmlFor="materialy-q" className="block font-bold">{t('szukajEtykieta')}</label><input id="materialy-q" name="q" defaultValue={q} maxLength={200} className="min-h-12 w-full rounded-xl border-2 border-line bg-card px-3"/></div>
      <input type="hidden" name="rodzaj" value={rodzaj}/><button className="min-h-12 rounded-xl bg-primary px-5 font-bold text-primary-fg">{t('szukaj')}</button>
    </form>
    <nav aria-label={t('filtr')} className="flex flex-wrap gap-3">{['','raport','publikacja','mapa','kanwa'].map(r=><Link key={r} href={href(r)} aria-current={rodzaj===r?'page':undefined} className="inline-flex min-h-12 items-center rounded-xl border-2 border-line px-4 font-semibold aria-[current=page]:bg-accent aria-[current=page]:text-accent-fg">{t(r||'wszystkie')}</Link>)}</nav>
    <p role="status">{t('liczba',{n:wyniki.length})}</p>
    <ul className="grid gap-4 md:grid-cols-2">{wyniki.slice((strona-1)*12,strona*12).map(d=><li key={d.id} className="karta flex flex-col gap-3 p-5"><p className="text-sm text-muted">{t(d.rodzaj)} · {t('strony',{n:d.strony})}</p><h2 lang={d.jezyk} className="text-xl font-bold"><Link href={`/wiedza/materialy/${d.id}`}>{d.tytul}</Link></h2><p className="mt-auto">{t('wydawca')}</p><Link href={`/wiedza/materialy/${d.id}`} className="inline-flex min-h-12 items-center font-semibold underline">{t('otworz')}<span className="sr-only">: {d.tytul}</span></Link></li>)}</ul>
    {!wyniki.length&&<p>{t('brak')}</p>}
    <nav aria-label={t('stronicowanie')} className="flex flex-wrap items-center gap-4">{strona>1&&<Link className="inline-flex min-h-12 items-center underline" href={href(rodzaj,strona-1)}>{t('poprzednia')}</Link>}<span>{t('strona',{n:strona,max:stron})}</span>{strona<stron&&<Link className="inline-flex min-h-12 items-center underline" href={href(rodzaj,strona+1)}>{t('nastepna')}</Link>}</nav>
    <section className="space-y-2"><h2 className="text-2xl font-bold">{t('pochodzenie')}</h2><p>{t('stan',{data:dataPobrania.slice(0,10)})}</p><p>{t('zakres')}</p><ul className="list-disc space-y-2 pl-6">{zrodlaRops.map((u,i)=><li key={u}><a href={u} className="underline">{t(`zrodlo${i}`)}</a></li>)}</ul></section>
    <p><Link href="/wiedza/malopolska" className="inline-flex min-h-12 items-center underline">{t('diagnoza')}</Link> · <Link href="/wiedza/akademia" className="inline-flex min-h-12 items-center underline">{t('akademia')}</Link></p>
  </Strona>;
}
