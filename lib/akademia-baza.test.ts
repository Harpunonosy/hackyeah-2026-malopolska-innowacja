import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import baza from '../data/akademia.json';
import { db } from './db';
import { KonfliktAkademii, zapiszLekcje, publiczneLekcje, lekcjeDoEdycji } from './akademia-baza';

// Tylko osobna lokalna baza; nigdy współdzielone demo.
const url = process.env.DATABASE_URL;
if (url) {
  const u = new URL(url);
  if (u.hostname !== 'localhost' || u.port !== '55432' || u.pathname !== '/splot_test') throw new Error('Test wymaga lokalnej izolowanej bazy splot_test na porcie 55432.');
}
test('baza: szkic → publikacja → nowy szkic → publikacja, konflikty i dziennik', {skip:!url}, async ()=>{
  const slug = `test-akademii-${randomBytes(8).toString('hex')}`;
  const l = {...baza.lekcje[0], slug, tytul:'Testowa lekcja'};
  try {
    const zabezpieczenie = await db().query("select relrowsecurity from pg_class where oid='akademia_lekcje'::regclass");
    assert.equal(zabezpieczenie.rows[0].relrowsecurity,true);
    const szkic = await zapiszLekcje(l,'szkic',0);
    assert.equal(szkic.revision,1);
    assert.equal(szkic.opublikowana,null);
    assert.equal((await publiczneLekcje()).some(x=>x.slug===slug),false);
    assert.equal((await lekcjeDoEdycji()).lekcje.find(x=>x.szkic.slug===slug)?.szkic.tytul,l.tytul);
    const publikacja = await zapiszLekcje(l,'publikuj',1);
    assert.equal(publikacja.revision,2);
    assert.ok(publikacja.publishedAt);
    assert.equal((await publiczneLekcje()).find(x=>x.slug===slug)?.tytul,l.tytul);
    const poprawka = {...l,tytul:'Poprawiona lekcja'};
    const nowySzkic = await zapiszLekcje(poprawka,'szkic',2);
    assert.equal(nowySzkic.revision,3);
    assert.equal((await publiczneLekcje()).find(x=>x.slug===slug)?.tytul,l.tytul);
    await assert.rejects(()=>zapiszLekcje({...poprawka,tytul:'Nieaktualna wersja'},'publikuj',2),KonfliktAkademii);
    await zapiszLekcje(poprawka,'publikuj',3);
    assert.equal((await publiczneLekcje()).find(x=>x.slug===slug)?.tytul,poprawka.tytul);
    const dz = await db().query('select akcja,opis from dziennik where obiekt=$1 order by at',[slug]);
    assert.deepEqual(dz.rows.map(x=>x.akcja),['akademia_szkic','akademia_publikacja','akademia_szkic','akademia_publikacja']);
    assert.ok(dz.rows.every(x=>/^revision=\d+$/.test(x.opis)));
  } finally {
    await db().query('delete from dziennik where obiekt=$1',[slug]);
    await db().query('delete from akademia_lekcje where slug=$1',[slug]);
    await db().end();
  }
});
