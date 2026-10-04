import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { dokumenty, dataPobrania, opracowaniaRops } from '@/lib/materialy-rops';
import { Strona } from '@/components/strona';
import { NaglowekStrony } from '@/components/naglowek-strony';
export async function generateMetadata({params}:{params:Promise<{id:string}>}) { const {id}=await params;return {title:dokumenty.find(d=>d.id===id)?.tytul??'Materiał ROPS'}; }
export default async function Material({params}:{params:Promise<{id:string}>}) {
 const {id}=await params;const d=dokumenty.find(d=>d.id===id);if(!d)notFound();const t=await getTranslations('materialyRops');
 return <Strona><p><Link href="/wiedza/materialy" className="inline-flex min-h-12 items-center underline">{t('powrot')}</Link></p><div lang={d.jezyk}><NaglowekStrony nadtytul="ROPS Kraków" tytul={d.tytul}/></div>
 <div className="karta space-y-4 p-6"><p>{t(d.rodzaj)} · {t('strony',{n:d.strony})}{d.rok?` · ${d.rok}`:''}</p><p>{t('pomoc')}</p><a href={d.plik} className="inline-flex min-h-12 items-center rounded-xl bg-primary px-5 py-3 font-bold text-primary-fg">{t('czytajPdf')}</a><p className="text-sm text-muted">{t('pdfUwaga')}</p></div>
 {opracowaniaRops.some(f=>f.dokument===id)&&<section lang="pl" className="karta space-y-3 p-5"><h2 className="text-2xl font-bold">Najważniejsze informacje prostym językiem</h2><p className="text-sm text-muted">Opracowanie wybranych fragmentów. Nie zastępuje pełnego dokumentu.</p><ul className="list-disc space-y-3 pl-6">{opracowaniaRops.filter(f=>f.dokument===id).map(f=><li key={f.tekst}>{f.tekst} <a href={f.url} className="underline">Strona pliku PDF: {f.strona}</a></li>)}</ul></section>}
 <section className="space-y-3"><h2 className="text-2xl font-bold">{t('dalej')}</h2><ul className="list-disc space-y-3 pl-6"><li><Link href="/wiedza/malopolska" className="underline">{t('diagnoza')}</Link></li><li><Link href="/pomysl" className="underline">{t('pomysl')}</Link></li><li><Link href="/rynek" className="underline">{t('zapytaj')}</Link></li><li><Link href="/asystowane" className="underline">{t('pomocOsobista')}</Link></li></ul></section>
 <p>{t('stan',{data:dataPobrania.slice(0,10)})} <a href={d.kolekcja} className="underline">{t('oryginal')}</a></p>
 </Strona>;
}
