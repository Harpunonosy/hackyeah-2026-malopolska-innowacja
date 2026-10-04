/** Test sterowania głosem; symulacja API przeglądarki, bez nagrywania osoby. */
import assert from 'node:assert/strict';
import { przegladarkaTestowa } from './przegladarka';
type Stan = { starty: number; odczyty: string[]; ostatnia?: { text:string; onend?:()=>void } };
async function main() {
 const browser=await przegladarkaTestowa();
 try {
  const context=await browser.newContext();
  await context.addInitScript({content: `
   const stan={starty:0,odczyty:[]};
   window.__splotGlos=stan;
   Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class {constructor(text){this.text=text;}}});
   Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},speak(u){stan.ostatnia=u;stan.odczyty.push(u.text);}}});
   Object.defineProperty(window,'SpeechRecognition',{value:class {start(){stan.starty++;}abort(){}stop(){}}});
  `});
  const page=await context.newPage();
  await page.goto((process.env.HUB_TEST_BASE??'http://localhost:3201')+'/rozmowa');
  await page.getByRole('button',{name:'Zacznij rozmowę',exact:true}).click();
  await page.getByRole('button',{name:'Zatrzymaj',exact:true}).click();
  const starty=await page.evaluate(()=>{const s=(window as unknown as {__splotGlos:Stan}).__splotGlos;s.ostatnia?.onend?.();return s.starty;});
  assert.equal(starty,0);
  assert.ok(await page.evaluate(()=>(window as unknown as {__splotGlos:Stan}).__splotGlos.odczyty.length>0));
  console.log('PASS: Stop uniemożliwia późniejszy start mikrofonu po zakończeniu starego odczytu');
  await page.route('**/api/swatka/dopasuj',route=>route.fulfill({json:{kryzys:null,dopasowania:[{id:'a',nazwa:'Pierwsze rozwiązanie',dlaczego:'Pomoc pierwsza'},{id:'b',nazwa:'Drugie rozwiązanie',dlaczego:'Pomoc druga'}],najblizsze:[],tryb:'awaryjny'}}));
  await page.getByLabel('Napisz, co się dzieje').fill('Potrzebuję pomocy w okolicy');
  await page.getByRole('button',{name:'Dalej',exact:true}).click();
  await page.getByRole('button',{name:'Tak',exact:true}).click();
  await page.getByRole('button',{name:'Tak, wyślij',exact:true}).waitFor();
  await page.waitForTimeout(500);
  const tekst=await page.evaluate(()=>(window as unknown as {__splotGlos:Stan}).__splotGlos.odczyty.at(-1));
  assert.ok(tekst?.includes('Pierwsze rozwiązanie')&&tekst.includes('Drugie rozwiązanie')&&tekst.includes('Czy wysłać zgłoszenie'));
  console.log('PASS: wszystkie propozycje i pytanie o zgodę stanowią pełny, nieprzerwany odczyt');
 } finally {await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
