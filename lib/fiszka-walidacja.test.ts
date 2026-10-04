import test from 'node:test';
import assert from 'node:assert/strict';
import { Fiszka, anonimizujFiszke } from './fiszka-walidacja';
const f={tytul:'Pomysł testowy',opis:'Spotkania sąsiedzkie',istota:'Wspólne rozmowy',dla_kogo:'Seniorzy',etap:'pomysl'};
test('nieprawidłowe oceny i kanwa nie zatrują Centrali',()=>{
 assert.equal(Fiszka.safeParse({...f,oceny:{punkty:50}}).success,false);
 assert.equal(Fiszka.safeParse({...f,kanwa:{pelna:{opis:{html:'zły typ'}}}}).success,false);
 assert.equal(Fiszka.safeParse({...f,oceny:[],kanwa:{pelna:{odbiorcy:'Seniorzy'}}}).success,true);
});
test('fiszka maskuje kontakt również w pełnej kanwie',()=>{
 const wynik=anonimizujFiszke(Fiszka.parse({...f,opis:'Kontakt test@example.com',kanwa:{pelna:{partnerzy:'test@example.com'}}}));
 assert.ok(!JSON.stringify(wynik).includes('test@example.com'));
});
