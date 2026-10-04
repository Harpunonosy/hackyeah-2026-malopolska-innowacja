import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { NaglowekStrony } from '@/components/naglowek-strony';
import { Strona } from '@/components/strona';
import { publiczneLekcje } from '@/lib/akademia-baza';

export const metadata: Metadata = { title: 'Akademia Splotu' };
export const dynamic = 'force-dynamic';
export default async function Akademia() {
  const t = await getTranslations('akademiaPubliczna');
  const lekcje = await publiczneLekcje();
  return <Strona>
      <p><Link href="/wiedza/materialy" className="inline-flex min-h-12 items-center font-semibold underline" lang="pl">Raporty i publikacje ROPS — pełny katalog materiałów</Link></p>
    <NaglowekStrony nadtytul={t('nadtytul')} tytul={t('tytul')} opis={t('opis')}/>
    <ul className="grid auto-rows-fr gap-5 md:grid-cols-2">
      {lekcje.map((l,i)=><li key={l.slug} className="flex">
        <Link href={`/wiedza/akademia/${l.slug}`} className="karta flex w-full flex-col gap-3 p-6 text-fg no-underline transition-transform hover:-translate-y-0.5">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">{t('lekcjaNr',{n:i+1})}</span>
          <span className="font-display text-2xl font-bold">{l.tytul}</span>
          <span className="mt-auto flex items-center justify-between text-muted"><span className="inline-flex items-center gap-2"><Clock aria-hidden className="size-5"/>{t('minuty',{n:l.minuty})}</span><ArrowRight aria-hidden className="size-6 text-primary"/></span>
        </Link>
      </li>)}
    </ul>
    <p className="max-w-3xl text-sm text-muted">{t('uwaga')}</p>
  </Strona>;
}
