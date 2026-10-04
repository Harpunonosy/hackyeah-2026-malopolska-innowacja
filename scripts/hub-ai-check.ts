/** Krótka kontrola rzeczywistego AI; wykonuje 3 płatne zapytania. Nie jest benchmarkiem trafności. */
import assert from 'node:assert/strict';
import { dopasuj, WejscieSwatki } from '../lib/swatka';
import { innowacjaPoId } from '../lib/biblioteka';
import { db } from '../lib/db';
async function main() {
 if (!process.env.DEEPSEEK_API_KEY) throw new Error('Wymagany skonfigurowany klucz dostawcy.');
 const probki=[
  {tekst:'Moja starsza mama zapomina przyjmować leki i myli dawki. Szukamy prostego organizera do leków.',jezyk:'pl'},
  {tekst:'Potrzebuję instrukcji naprawy silnika odrzutowego w samolocie.',jezyk:'pl'},
  {tekst:'Моя літня мама боїться користуватися банкоматом. Потрібні безпечні тренування без справжніх грошей.',jezyk:'uk'},
 ];
 try {
 for (const p of probki) {
  const w=await dopasuj(WejscieSwatki.parse(p));
  console.log(JSON.stringify({wejscie:p,tryb:w.tryb,metryki:w.metryki,brakDopasowania:w.brakDopasowania,dopasowania:w.dopasowania.map(d=>({id:d.id,nazwa:d.nazwa,trafnosc:d.trafnosc,dlaczego:d.dlaczego}))}));
  assert.equal(w.tryb,'ai');
  assert.ok(w.dopasowania.every(d=>innowacjaPoId.has(d.id)));
 }
 } finally {await db().end();}
}
main().catch(e=>{console.error(e instanceof Error ? e.message : 'Błąd kontroli AI');process.exitCode=1;});
