import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { CentralaNav } from '@/components/centrala/centrala-nav';
import { ImportIoss } from '@/components/centrala/import-ioss';
import { czyAdmin } from '@/lib/sesja';

export const metadata: Metadata = { title: 'Centrala: dane IOSS' };

export default async function Page() {
  if (!(await czyAdmin())) redirect('/centrala/logowanie');
  const t = await getTranslations('iossCentrala');
  return (
    <div className="space-y-8">
      <div>
        <CentralaNav aktywna="dane" />
        <h1 className="text-4xl font-bold sm:text-5xl">{t('tytul')}</h1>
        <p className="mt-3 max-w-3xl text-lg text-muted">{t('opis')}</p>
      </div>
      <ImportIoss />
    </div>
  );
}
