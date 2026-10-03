import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Lekcja } from '@/components/akademia/lekcja';
import { NaglowekStrony } from '@/components/naglowek-strony';
import { Strona } from '@/components/strona';
import { publiczneLekcje } from '@/lib/akademia-baza';

export const metadata: Metadata = { title: 'Akademia Splotu: lekcja' };
export const dynamic = 'force-dynamic';
export default async function Page(props: PageProps<'/wiedza/akademia/[slug]'>) {
  const {slug} = await props.params;
  const l = (await publiczneLekcje()).find(x=>x.slug===slug);
  if (!l) notFound();
  const t = await getTranslations('akademiaPubliczna');
  return <Strona>
    <p><Link href="/wiedza/akademia">{t('powrot')}</Link></p>
    <NaglowekStrony nadtytul={t('lekcjaMinuty',{n:l.minuty})} tytul={l.tytul}/>
    <Lekcja akapity={l.akapity} latwe={l.latwe} quiz={l.quiz}/>
    <section aria-labelledby="zr-h" className="max-w-3xl space-y-2">
      <h2 id="zr-h" className="text-xl font-bold">{t('zrodla')}</h2>
      <ul className="space-y-2">{l.zrodla.map((z,i)=><li key={i}>{z.url.startsWith('/') ? <Link href={z.url} className="inline-flex min-h-12 items-center font-semibold">{z.nazwa}</Link> : <a href={z.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-1 font-semibold">{z.nazwa}<ExternalLink aria-hidden className="size-4"/><span className="sr-only">{t('nowaKarta')}</span></a>}</li>)}</ul>
      <p className="text-sm text-muted">{t('notaZrodla')}</p>
    </section>
  </Strona>;
}
