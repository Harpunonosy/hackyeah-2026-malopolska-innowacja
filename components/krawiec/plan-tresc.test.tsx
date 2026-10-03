import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlanTresc, type DanePlanu, type ProfilPlanu } from './plan-tresc';
import type { PlanWdrozenia, Kwalifikowalnosc } from '@/lib/krawiec';

const plan: PlanWdrozenia = {
  karta_uslugi:{nazwa:'Wsparcie blisko domu',cel:'Pomoc seniorom w codziennym życiu.',odbiorcy:'Osoby starsze.',zakres:'Dwie wizyty tygodniowo.',standard:'Stały opiekun.'},
  uzasadnienie_lokalne:'UZASADNIENIE_LOKALNE',
  model_realizacji:[{krok:'Zebrać zespół',opis:'MODEL_REALIZACJI'}],
  budzet:{zalozenia:'ZALOZENIA_BUDZETU',pozycje:[{nazwa:'Koordynacja',rodzaj:'stale',kwota_zl:10000,uwagi:'UWAGI_KOSZTOW'},{nazwa:'Usługi',rodzaj:'zmienne',kwota_zl:10000,uwagi:'UWAGI_USLUG'}]},
  harmonogram:[{etap:'Przygotowanie',okres:'Miesiąc 1',dzialania:'DZIALANIA_HARMONOGRAMU'}],
  wskazniki:[{nazwa:'Osoby objęte wsparciem',typ:'produktu',wartosc_docelowa:'WARTOSC_WSKAZNIKA'}],
  ryzyka:[{ryzyko:'Brak kadry',dzialanie:'DZIALANIE_NA_RYZYKO'}],
  finansowanie:[{zrodlo:'Budżet gminy',opis:'OPIS_FINANSOWANIA'}],kontakt_z_autorem:'KONTAKT_Z_AUTOREM',
};
const profil: ProfilPlanu = {typ:'gmina',powiat:'powiat krakowski',budzet:'do_150',odbiorcy:10};
const dane: DanePlanu = {wskazniki:[],limit:15000,razem:20000,przekroczony:true};
const kw: Kwalifikowalnosc = [
  {id:'nie',warunek:'WARUNEK_NIESPELNIONY',wynik:'nie_spelnia',uwaga:'UWAGA_GRANTU'},
  {id:'sprawdz',warunek:'WARUNEK_DO_SPRAWDZENIA',wynik:'do_sprawdzenia',uwaga:'UWAGA_SPRAWDZ'},
];
const t = (key:string,values?:Record<string,string|number>)=> key + (values ? ' '+JSON.stringify(values) : '');
const render = (p:PlanWdrozenia=plan, d:DanePlanu=dane) => renderToStaticMarkup(<PlanTresc plan={p} dane={d} profil={profil} kw={kw} inn={null} t={t} konsultacja={<p>KONSULTACJA_EKSPERTA</p>}/>);

test('najważniejsze koszty i ostrzeżenia są widoczne przed szczegółami',()=>{
  const html=render();
  const pierwszy=html.indexOf('<details');assert.ok(pierwszy>0);
  const gora=html.slice(0,pierwszy);
  for(const tekst of ['Wsparcie blisko domu','odbiorcow','przekroczony','WARUNEK_NIESPELNIONY','uxWarunkiSprawdz']) assert.ok(gora.includes(tekst),tekst);
  assert.match(gora,/>20\s000 zł<\/dd>/u);
  assert.match(gora,/>2000 zł<\/dd>/u);
});
test('szczegóły są w pięciu grupach, bez poziomych tabel',()=>{
  const html=render();assert.equal((html.match(/<details/g)||[]).length,5);
  assert.ok(!html.includes('overflow-x-auto'));assert.ok(!html.includes('min-w-['));
});
test('stary plan zachowuje pełne dane i pokazuje start na podstawie modelu realizacji',()=>{
  const html=render();
  for(const tekst of ['UZASADNIENIE_LOKALNE','MODEL_REALIZACJI','ZALOZENIA_BUDZETU','UWAGI_KOSZTOW','UWAGI_USLUG','DZIALANIA_HARMONOGRAMU','WARTOSC_WSKAZNIKA','DZIALANIE_NA_RYZYKO','OPIS_FINANSOWANIA','KONTAKT_Z_AUTOREM','KONSULTACJA_EKSPERTA']) assert.ok(html.includes(tekst),tekst);
  assert.ok(html.slice(0,html.indexOf('<details')).includes('Zebrać zespół'));
});
test('nowy plan zachowuje wszystkie pierwsze kroki i opcjonalne warianty',()=>{
  const p={...plan,pierwsze_kroki:['START_1','START_2','START_3','START_4','START_5'],warianty:[{wariant:'minimum' as const,opis:'WARIANT_MINIMUM',odbiorcy:5,koszt_zl:5000,obejmuje:['ZAKRES_MINIMUM'],rezygnujemy_z:'BRAK_WARIANTU'}]};
  const html=render(p);for(const tekst of [...p.pierwsze_kroki,'WARIANT_MINIMUM','ZAKRES_MINIMUM','BRAK_WARIANTU']) assert.ok(html.includes(tekst),tekst);
});
test('dawne plany bez liczby odbiorców nie dzielą przez zero',()=>{
  const html=renderToStaticMarkup(<PlanTresc plan={plan} dane={dane} profil={{...profil,odbiorcy:0}} kw={[]} inn={null} t={t}/>);
  assert.ok(!html.includes('Infinity'));assert.ok(!html.includes('NaN'));
});
