import assert from 'node:assert/strict';
import AxeBuilder from '@axe-core/playwright';
import { przegladarkaTestowa } from './przegladarka';
const base=process.env.HUB_TEST_BASE ?? 'http://localhost:3200';
async function main() {
 const browser=await przegladarkaTestowa();
 try {
 const context=await browser.newContext({viewport:{width:320,height:800}});
 const page=await context.newPage();
 await page.goto(base+'/pomysl');
 await page.getByRole('button',{name:'Wolę wypełnić sam lub sama, bez AI'}).click();
 // Wszystkie pola pozostają dostępne po rozwinięciu, także na małym ekranie.
 await page.locator('details').evaluateAll(ds=>ds.forEach(d=>(d as HTMLDetailsElement).open=true));
 assert.equal(await page.locator('#h-kanwa-pelna').count(),1);
 assert.equal(await page.locator('[name="kp-intensywnosc"]').count(),4);
 assert.equal(await page.locator('[name="kp-wplyw_srodowisko"]').count(),4);
 await page.locator('#kp-glowny_uzytkownik').pressSequentially('Sąsiedzi z osiedla');
 assert.equal(await page.locator('#kp-glowny_uzytkownik').inputValue(),'Sąsiedzi z osiedla');
 const choices=page.locator('input[name="kp-wartosc_emocjonalna"]');
 for(let i=0;i<3;i++) await choices.nth(i).check();
 assert.equal(await choices.nth(3).isDisabled(),true);
 await choices.nth(1).uncheck();assert.equal(await choices.nth(3).isDisabled(),false);
 console.log(await page.evaluate(()=>({width:document.documentElement.scrollWidth,overflow:Array.from(document.querySelectorAll("main *")).filter(e=>e.getBoundingClientRect().right>321).slice(0,12).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent?.slice(0,55),w:e.getBoundingClientRect().width}))})));
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=321));
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
 assert.deepEqual(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);
 await page.screenshot({path:'/tmp/splot-compliance-kanwa-320.png',fullPage:true});
 console.log('PASS: pełna kanwa, własne odpowiedzi ze spacjami, maks.3 wartości, 320px i axe po rozwinięciu');
 await page.route('**/api/pracownia/asystent',route=>route.abort('failed'));
 await page.locator('section[aria-labelledby="h-kanwa-pelna"]').getByRole('button',{name:'Nie wiem',exact:false}).first().click();
 await page.locator('section[aria-labelledby="h-kanwa-pelna"]').getByRole('alert').waitFor();
 assert.equal(await page.locator('section[aria-labelledby="h-kanwa-pelna"]').getByRole('button',{name:'Nie wiem',exact:false}).first().isEnabled(),true);
 console.log('PASS: po utracie sieci kanwa pokazuje błąd i odblokowuje pomoc');
 await page.goto(base+'/wiedza/materialy?q=opieka');
 assert.ok((await page.locator('main').innerText()).includes('opie'));
 await page.goto(base+'/wiedza/materialy/7b2381c3ed665c63');
 assert.ok(await page.getByRole('link',{name:/stron/i}).count()>0);
 console.log('PASS: wyszukiwanie lokalnych materiałów i odnośniki do stron źródła');
 } finally { await browser.close(); }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
