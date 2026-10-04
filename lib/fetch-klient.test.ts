import test from 'node:test';
import assert from 'node:assert/strict';
import { apiFetch } from './fetch-klient';
test('brak sieci i odpowiedź HTML dają obsługiwalny błąd formularza',async()=>{
 const old=globalThis.fetch;
 try {
  globalThis.fetch=async()=>{throw new TypeError('offline')};
  const r=await apiFetch('/api/test');assert.equal(r.ok,false);assert.equal(r.status,503);assert.equal((await r.json()).blad,'siec');
  globalThis.fetch=async()=>new Response('<html>awaria</html>',{status:502});
  const html=await apiFetch('/api/test');assert.equal((await html.json()).blad,'serwer');
 } finally {globalThis.fetch=old;}
});
