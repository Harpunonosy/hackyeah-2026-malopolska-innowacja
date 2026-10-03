import assert from 'node:assert/strict';
import test from 'node:test';
import { odczytajIossRequest, podpiszPodglad, sprawdzPodglad } from '../lib/ioss-import-request';

process.env.SESSION_SECRET = 'splot-test-secret-32-characters';

test('preview signature binds exact content and expires after 15 minutes', () => {
  const token = podpiszPodglad('csv', 1000);
  assert.equal(sprawdzPodglad('csv', token, 1001), true);
  assert.equal(sprawdzPodglad('changed csv', token, 1001), false);
  assert.equal(sprawdzPodglad('csv', token + 'x', 1001), false);
  assert.equal(sprawdzPodglad('csv', token, 1000 + 900_001), false);
  assert.equal(sprawdzPodglad('csv', '', 1001), false);
});

test('reader enforces byte limit for requests without content-length', async () => {
  const req = new Request('http://localhost', { method: 'POST', body: 'ąąą' });
  await assert.rejects(() => odczytajIossRequest(req, 5), /rozmiar/);
});

test('reader rejects invalid utf8 and accepts proper csv', async () => {
  const req = new Request('http://localhost', { method: 'POST', body: Uint8Array.from([0xff, 0xff]) });
  await assert.rejects(() => odczytajIossRequest(req), /kodowanie/);
  assert.equal(await odczytajIossRequest(new Request('http://localhost', { method: 'POST', body: 'dane,ą' })), 'dane,ą');
});
