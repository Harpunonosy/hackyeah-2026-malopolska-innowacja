import test from 'node:test';
import assert from 'node:assert/strict';
import { dokumenty, znajdzMaterialy, zrodlaOdpowiedzi } from './materialy-rops';
test('każdy pobrany dokument ma pochodzenie i prawidłową liczbę stron',()=>{
 assert.ok(dokumenty.length>=50);
 assert.equal(new Set(dokumenty.map(d=>d.id)).size,dokumenty.length);
 assert.ok(dokumenty.every(d=>d.strony>0 && d.sha256.length===64 && d.url.startsWith('https://rops.krakow.pl/')));
 assert.ok(znajdzMaterialy('opiekuńczego').some(d=>d.rok===2026));
 assert.ok(znajdzMaterialy('dostepnosci').length>0);
 assert.equal(znajdzMaterialy('','kanwa').length,1);
});
test('cytowania zachowują Mapę i odrzucają wymyślone indeksy',()=>{
 const fakty=[{tekst:'Pierwszy',zrodlo:'Raport',strona:2},{tekst:'Drugi',zrodlo:'Mapa',strona:null}];
 assert.deepEqual(zrodlaOdpowiedzi([2,2,0,1.5,300],fakty),[fakty[1]]);
});
