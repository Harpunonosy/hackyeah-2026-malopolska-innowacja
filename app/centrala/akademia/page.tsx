import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { CentralaNav } from '@/components/centrala/centrala-nav';
import { EdytorAkademii } from '@/components/centrala/edytor-akademii';
import { czyAdmin } from '@/lib/sesja';
import { lekcjeDoEdycji } from '@/lib/akademia-baza';

export const dynamic = 'force-dynamic';
export default async function AkademiaAdmin() {
  if (!(await czyAdmin())) redirect('/centrala/logowanie');
  const t = await getTranslations('akademiaCentrala');
  const dane = await lekcjeDoEdycji();
  return <div className="space-y-6">
    <CentralaNav aktywna="akademia" />
    <h1 className="text-4xl font-bold sm:text-5xl">{t('tytul')}</h1>
    <p className="max-w-3xl text-lg text-muted">{t('opis')}</p>
    {!dane.gotowa && <p role="status" className="karta p-5">{t('migracja')}</p>}
    <EdytorAkademii lekcje={dane.lekcje} gotowa={dane.gotowa}/>
  </div>;
}
