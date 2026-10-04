/** Izolowane testy integracyjne. Wyłącznie lokalna baza i lokalny serwer. */
import assert from 'node:assert/strict';
import { Client } from 'pg';
const base=process.env.HUB_TEST_BASE ?? 'http://localhost:3200';
const url=process.env.DATABASE_URL ?? '';
if (new URL(base).hostname !== 'localhost' || !url.includes('localhost:55433/splot_compliance_')) throw new Error('Test wymaga odrębnej lokalnej bazy zgodności na porcie 55433.');
async function main() {
const c=new Client({connectionString:url});
await c.connect();
let seq=0;
async function req(path:string, body?:unknown, method=body?'POST':'GET', cookie='') {
 const r=await fetch(base+path,{method,headers:{'content-type':'application/json','x-forwarded-for':`192.0.2.${++seq}`,cookie},body:body?JSON.stringify(body):undefined});
 return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0] ?? ''};
}
try {
 assert.equal((await req('/api/v1/potrzeby')).status,401);
 const login=await req('/api/centrala/logowanie',{haslo:process.env.DEMO_ADMIN_PASSWORD});assert.equal(login.status,200);const cookie=login.cookie;
 assert.equal((await req('/api/v1/potrzeby',undefined,'GET',cookie)).status,200);
 const html=await (await fetch(base+'/ekspert')).text();assert.ok(!html.includes(process.env.DEMO_EKSPERT_PASSWORD!));
 console.log('PASS: statystyki tylko dla administratora; hasło eksperta nie trafia do HTML');
 const karta=await req('/api/admin/innowacje/straznik',undefined,'GET',cookie);assert.equal(karta.status,200);
 const edycja=await req('/api/admin/innowacje/straznik',{...karta.body,nazwa:'Strażnik — test aktualizacji'},'PUT',cookie);assert.equal(edycja.status,200);
 try { const aktualna=await req('/api/v1/innowacje/straznik');assert.equal(aktualna.body.nazwa,'Strażnik — test aktualizacji'); }
 finally { await req('/api/admin/innowacje/straznik',karta.body,'PUT',cookie); }
 console.log('PASS: edycja bazowej karty ROPS jest natychmiast widoczna w publicznym katalogu');

 const test=(await c.query("select id from testy where status='otwarty' limit 1")).rows[0];assert.ok(test);
 const zapis=await req(`/api/testy/${test.id}/zapis`,{email:'uczestnik@example.invalid'});assert.equal(zapis.status,200);assert.match(zapis.body.numer,/^SPL-/);
 assert.equal((await c.query('select count(*)::int n from zgloszenia where numer=$1',[zapis.body.numer])).rows[0].n,1);
 assert.equal((await req('/api/opinie',{testId:test.id,ocena:4,polecilbys:'tak',latwe:'Instrukcja była czytelna'})).status,201);
 assert.equal((await c.query('select count(*)::int n from opinie where test_id=$1',[test.id])).rows[0].n>0,true);
 console.log('PASS: zapis na test tworzy sprawę, opinia jest przypisana do konkretnego testu');
 const fiszka={tytul:'Test zgodności platformy',opis:'Syntetyczny pomysł pomocowy',istota:'Warsztaty wspólnej nauki',dla_kogo:'Dorośli mieszkańcy',etap:'pomysl',kanwa:{pelna:{wspieraja:'Opiekun test@example.invalid'}}};
 assert.equal((await req('/api/pracownia/fiszka',{...fiszka,oceny:{niedozwolone:true}})).status,400);
 const f=await req('/api/pracownia/fiszka',fiszka);assert.equal(f.status,201,JSON.stringify(f.body));
 const saved=(await c.query('select kanwa from fiszki where id=$1',[f.body.id])).rows[0];assert.ok(!JSON.stringify(saved).includes('test@example.invalid'));
 const status=await req(`/api/admin/fiszki/${f.body.id}/status`,{wyniki:'Test syntetyczny: instrukcja zrozumiała.',etap:'przetestowane'},'POST',cookie);assert.equal(status.status,200);
 assert.equal((await c.query('select etap,wyniki_testu from fiszki where id=$1',[f.body.id])).rows[0].etap,'przetestowane');
 console.log('PASS: walidacja i maskowanie kanwy; zapis wyników testu i etapu');
 const schema={pola:[{nr:1,pole:'Tytuł',podpowiedz:'',limit:30},{nr:2,pole:'Opis',podpowiedz:'',limit:50}],kryteria:[],limity:'Test',kategorie:[]};
 const n=(await c.query("insert into nabory(nazwa,aktywny,otwarty_od,otwarty_do,schemat) values('Test walidacji',true,current_date-1,current_date+1,$1) returning id",[schema])).rows[0];
 for(const pola of [[{nr:1,tresc:'Tytuł'}],[{nr:1,tresc:'Tytuł'},{nr:2,tresc:'a'.repeat(51)}],[{nr:1,tresc:'Tytuł'},{nr:1,tresc:'Duplikat'},{nr:2,tresc:'Opis'}]]) assert.equal((await req('/api/pracownia/wniosek',{naborId:n.id,pola},'PUT')).status,400);
 const w=await req('/api/pracownia/wniosek',{naborId:n.id,pola:[{nr:1,tresc:'Syntetyczny tytuł'},{nr:2,tresc:'Poprawny opis'}]},'PUT');assert.equal(w.status,201,JSON.stringify(w.body));
 await c.query('update nabory set otwarty_do=current_date-1 where id=$1',[n.id]);
 assert.equal((await req('/api/pracownia/wniosek',{naborId:n.id,pola:[]},'PUT')).status,409);
 assert.ok(!(await req('/api/nabory/aktywny')).body.nabory.some((x:{id:string})=>x.id===n.id));
 const exported=await req('/api/admin/eksport/wnioski?nowe=1',undefined,'GET',cookie);assert.equal(exported.status,200);
 assert.equal((await c.query('select eksport_at from wnioski where id=$1',[w.body.id])).rows[0].eksport_at,null);
 assert.equal((await req('/api/admin/eksport/wnioski',{odebrane:[w.body.id]},'POST',cookie)).status,200);
 console.log('PASS: daty naboru, kompletność, limity, duplikaty pól, eksport bez przedwczesnego potwierdzenia');
 const before=(await c.query('select count(*)::int n from fiszki')).rows[0].n;
 await c.query("create or replace function compliance_fail() returns trigger language plpgsql as $$ begin raise exception 'kontrolowana awaria historii'; end $$; create trigger compliance_fail before insert on historia_statusu for each row execute function compliance_fail()");
 try {assert.equal((await req('/api/pracownia/fiszka',fiszka)).status,500);assert.equal((await c.query('select count(*)::int n from fiszki')).rows[0].n,before);} finally {await c.query('drop trigger compliance_fail on historia_statusu; drop function compliance_fail()');}
 console.log('PASS: awaria historii wycofuje cały zapis fiszki (bez osieroconego pomysłu)');
 const inbox=await req('/api/admin/zgloszenia?strona=1&typ=pomysl',undefined,'GET',cookie);assert.equal(inbox.status,200);assert.ok(inbox.body.zgloszenia.every((x:{typ:string})=>x.typ==='pomysl'));assert.ok(inbox.body.zgloszenia.length<=50);
 console.log('PASS: filtrowanie i stronicowanie po stronie serwera');
} finally {await c.end();}

}
main().catch(e => { console.error(e); process.exitCode=1; });
