import { test } from 'node:test';
import assert from 'node:assert/strict';
import baza from '../data/akademia.json';
import { LekcjaSchema, bezpiecznyUrl, polaczLekcje, zmienWersje, brakTabeliAkademii } from './akademia';

const lekcja = baza.lekcje[0];
test('waliduje wszystkie pięć oryginalnych lekcji', () => {
  for (const l of baza.lekcje) assert.equal(LekcjaSchema.safeParse(l).success, true);
});
test('odrzuca puste pola, brak wersji łatwej i nieprawidłową odpowiedź quizu', () => {
  for (const zmiana of [{tytul:' '}, {latwe:[]}, {quiz: [{pytanie:'Pytanie?', odpowiedzi:['A','B'], poprawna:2}]}, {slug:'../inny'}, {minuty:0}]) {
    assert.equal(LekcjaSchema.safeParse({...lekcja,...zmiana}).success, false);
  }
});
test('źródła dopuszczają http(s) oraz lokalne ścieżki', () => {
  for (const url of ['https://rops.krakow.pl/raport', 'http://example.org', '/testy', '/wiedza/akademia']) assert.equal(bezpiecznyUrl(url), true, url);
  for (const url of ['javascript:alert(1)', 'data:text/html,test', '//evil.test', '/\\evil.test', '/%5cevil.test', 'https://u:p@example.org', 'https://example.org\n', 'mailto:a@example.org', 'relative']) assert.equal(bezpiecznyUrl(url), false, url);
});
test('zapis szkicu nie ujawnia nowej lekcji, publikacja udostępnia ją od razu', () => {
  const nowa = {...lekcja,slug:'nowa-lekcja',tytul:'Nowa lekcja'};
  const szkic = zmienWersje(null, nowa, 'szkic');
  assert.equal(polaczLekcje(baza.lekcje, [szkic]).some(l=>l.slug===nowa.slug), false);
  const publikacja = zmienWersje(szkic, nowa, 'publikuj');
  assert.equal(polaczLekcje(baza.lekcje,[publikacja]).find(l=>l.slug===nowa.slug)?.tytul, nowa.tytul);
});
test('edycja opublikowanej lekcji zachowuje poprzedni snapshot i bazowe lekcje', () => {
  const opublikowana = zmienWersje(null, {...lekcja,tytul:'Zatwierdzona'}, 'publikuj');
  const szkic = zmienWersje(opublikowana, {...lekcja,tytul:'Jeszcze niezatwierdzona'}, 'szkic');
  const lista = polaczLekcje(baza.lekcje, [szkic]);
  assert.equal(lista.length, 5);
  assert.equal(lista[0].tytul, 'Zatwierdzona');
  assert.equal(szkic.szkic.tytul,'Jeszcze niezatwierdzona');
});
test('bazowa lekcja ma publiczną wersję także przy zapisanym szkicu', () => {
  assert.deepEqual(polaczLekcje(baza.lekcje, [zmienWersje(null,{...lekcja,tytul:'Szkic'},'szkic')]), baza.lekcje);
});
test('fallback dotyczy tylko brakującej tabeli Akademii, nie awarii lub innych tabel', () => {
  assert.equal(brakTabeliAkademii({code:'42P01',message:'relation "akademia_lekcje" does not exist'}),true);
  for (const e of [{code:'ECONNRESET'}, {code:'42P01',message:'relation "dziennik" does not exist'}, {code:'42501',message:'akademia_lekcje'}]) assert.equal(brakTabeliAkademii(e),false);
});
