import test from 'node:test';
import assert from 'node:assert/strict';
import { bledyWniosku, naborOtwarty } from './wniosek-walidacja';
const schemat={pola:[{nr:1,pole:'Tytuł',limit:10},{nr:2,pole:'Opis',limit:null}]};
test('wniosek wymaga wszystkich pól, właściwych numerów i limitów',()=>{
 assert.ok(bledyWniosku([],schemat).length);
 assert.ok(bledyWniosku([{nr:1,tresc:'Dobry'},{nr:1,tresc:'Kopia'}],schemat).length);
 assert.ok(bledyWniosku([{nr:1,tresc:'01234567890'},{nr:2,tresc:'Opis'}],schemat).length);
 assert.ok(bledyWniosku([{nr:1,tresc:'Tytuł'},{nr:2,tresc:'UZUPEŁNIJ'}],schemat).length);
 assert.deepEqual(bledyWniosku([{nr:1,tresc:'Tytuł'},{nr:2,tresc:'Opis'}],schemat),[]);
});
test('nabór obowiązuje tylko w swoim przedziale dat w Polsce',()=>{
 const lokalneDaty={aktywny:true,otwarty_od:new Date('2026-10-03T22:00:00Z'),otwarty_do:new Date('2026-10-03T22:00:00Z')};
 assert.equal(naborOtwarty(lokalneDaty,new Date('2026-10-04T12:00:00Z')),true);
 const n={aktywny:true,otwarty_od:'2026-10-04',otwarty_do:'2026-10-04'};
 assert.equal(naborOtwarty(n,new Date('2026-10-03T21:59:00Z')),false);
 assert.equal(naborOtwarty(n,new Date('2026-10-03T22:01:00Z')),true);
 assert.equal(naborOtwarty(n,new Date('2026-10-04T22:01:00Z')),false);
 assert.equal(naborOtwarty({...n,aktywny:false},new Date('2026-10-04T12:00:00Z')),false);
});
