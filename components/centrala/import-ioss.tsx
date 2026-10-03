'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import type { BladIoss, WierszIoss } from '@/lib/ioss-import';
import type { ImportIossPodsumowanie } from '@/lib/ioss-import-baza';

type PodgladIoss = { token: string; liczba: number; lata: number[]; powiaty: number; wskazniki: number; braki: number; wiersze: WierszIoss[] };
type BladApi = 'siec' | 'brak_dostepu' | 'rozmiar' | 'kodowanie' | 'podglad' | 'zapis' | 'walidacja' | 'akcja';
const BLEDY_API: BladApi[] = ['brak_dostepu', 'rozmiar', 'kodowanie', 'podglad', 'zapis', 'walidacja', 'akcja'];
const LIMIT_PLIKU = 1024 * 1024;

export function ImportIoss() {
  const t = useTranslations('iossCentrala');
  const [csv, setCsv] = useState('');
  const [podglad, setPodglad] = useState<PodgladIoss | null>(null);
  const [bledy, setBledy] = useState<BladIoss[]>([]);
  const [liczbaBledow, setLiczbaBledow] = useState(0);
  const [blad, setBlad] = useState<BladApi | null>(null);
  const [zajety, setZajety] = useState<'plik' | 'podglad' | 'import' | null>(null);
  const [wynik, setWynik] = useState<ImportIossPodsumowanie | null>(null);

  const zmien = (tekst: string) => {
    setCsv(tekst); setPodglad(null); setBledy([]); setBlad(null); setWynik(null); setLiczbaBledow(0);
  };
  const wyslij = async (akcja: 'podglad' | 'import') => {
    setZajety(akcja); setBlad(null); setBledy([]); setWynik(null);
    try {
      const res = await fetch(`/api/admin/ioss/import?akcja=${akcja}`, {
        method: 'POST',
        headers: { 'content-type': 'text/csv; charset=utf-8', ...(akcja === 'import' ? { 'x-ioss-podglad': podglad?.token ?? '' } : {}) },
        body: csv,
        signal: AbortSignal.timeout(30_000),
      });
      const dane = await res.json();
      if (!res.ok) {
        setBlad(BLEDY_API.includes(dane.blad) ? dane.blad : 'siec');
        setBledy(dane.bledy ?? []); setLiczbaBledow(dane.liczbaBledow ?? 0);
        if (dane.blad !== 'zapis') setPodglad(null);
        return;
      }
      if (akcja === 'podglad') setPodglad(dane);
      else { setWynik(dane); setPodglad(null); }
    } catch { setBlad('siec'); }
    finally { setZajety(null); }
  };

  return (
    <section className="space-y-5" aria-label={t('tytul')}>
      <div className="karta space-y-3 p-5 sm:p-6">
        <p>{t('format')}</p>
        <p className="text-muted">{t('jednostki')}</p>
        <a href="/api/admin/ioss/import" className="inline-flex min-h-12 items-center font-semibold underline">{t('szablon')}</a>
        <div className="space-y-2">
          <label htmlFor="ioss-plik" className="block font-semibold">{t('plik')}</label>
          <input id="ioss-plik" type="file" accept=".csv,text/csv" disabled={!!zajety} className="block min-h-12 w-full max-w-full text-base" onChange={async e => {
            const plik = e.currentTarget.files?.[0];
            if (!plik) return;
            zmien('');
            if (plik.size > LIMIT_PLIKU) { setBlad('rozmiar'); return; }
            setZajety('plik');
            try { zmien(new TextDecoder('utf-8', { fatal: true }).decode(await plik.arrayBuffer())); }
            catch { setBlad('kodowanie'); }
            finally { setZajety(null); }
          }} />
        </div>
        <div className="space-y-2">
          <label htmlFor="ioss-csv" className="block font-semibold">{t('csv')}</label>
          <textarea id="ioss-csv" rows={10} className="min-h-12 min-w-0 w-full max-w-full rounded-xl border-2 border-line bg-card p-3 text-fg font-mono text-base" value={csv} disabled={!!zajety} aria-describedby="ioss-wklej" onChange={e => zmien(e.target.value)} spellCheck={false} />
          <p id="ioss-wklej" className="text-muted">{t('wklej')}</p>
        </div>
        <Button type="button" disabled={!!zajety || !csv.trim()} onClick={() => wyslij('podglad')}>
          {zajety === 'podglad' ? t('sprawdzanie') : t('sprawdz')}
        </Button>
      </div>
      <div aria-live="polite" aria-atomic="true">
        {blad && <p role="alert" className="font-semibold text-primary">{t(`blad_${blad}`)}</p>}
        {wynik && <p role="status" className="karta p-5 font-semibold">{t('wynik', wynik)}</p>}
      </div>
      {bledy.length > 0 && (
        <div className="karta space-y-3 border-2 border-primary p-5">
          <h2 className="text-xl font-bold">{t('bledyTytul', { liczba: liczbaBledow })}</h2>
          {liczbaBledow > bledy.length && <p>{t('bledyLimit', { pokazane: bledy.length })}</p>}
          <ul className="list-disc space-y-2 pl-5">
            {bledy.map((b, i) => <li key={i}>{t('wiersz', { wiersz: b.wiersz, pole: b.pole, opis: t(`walidacja_${b.kod}`) })}</li>)}
          </ul>
        </div>
      )}
      {podglad && (
        <div className="karta space-y-4 p-5 sm:p-6">
          <h2 className="text-2xl font-bold">{t('podgladTytul')}</h2>
          <p>{t('podsumowanie', { liczba: podglad.liczba, wskazniki: podglad.wskazniki, powiaty: podglad.powiaty, braki: podglad.braki, lata: podglad.lata.join(', ') })}</p>
          <p>{t('pierwsze', { pokazane: podglad.wiersze.length, liczba: podglad.liczba })}</p>
          <ul className="max-h-[32rem] space-y-3 overflow-y-auto">
            {podglad.wiersze.map(w => (
              <li key={`${w.wskaznik_id}:${w.powiat}:${w.rok}`} className="rounded-xl border border-line-soft p-3">
                <p className="break-words font-bold">{w.wskaznik}</p>
                <p>{t('id')}: {w.wskaznik_id} · {t('rok')}: {w.rok}</p>
                <p className="break-words">{t('kategoria')}: {w.kategoria}</p>
                <p>{t('powiat')}: {w.powiat}</p>
                <p>{t('wartosc')}: <strong>{w.wartosc === null ? t('brak') : w.wartosc.toLocaleString('pl-PL')}</strong></p>
              </li>
            ))}
          </ul>
          <p>{t('zastepowanie')}</p>
          <Button type="button" disabled={!!zajety} onClick={() => wyslij('import')}>
            {zajety === 'import' ? t('importowanie') : t('importuj')}
          </Button>
        </div>
      )}
    </section>
  );
}
