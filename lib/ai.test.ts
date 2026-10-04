import assert from 'node:assert/strict';
import { test, type TestContext } from 'node:test';
import { z } from 'zod';
import { AiNiedostepneError, DOMYSLNY_MODEL, zapytajJson } from './ai';

const schemat = z.object({ tekst: z.string() });
const opcje = { schemat, system: [{ tekst: 'Instrukcja pierwsza', cache: '1h' as const }, { tekst: 'Instrukcja druga' }], uzytkownik: 'Dane mieszkańca' };
const poprawna = (content = '{"tekst":"Odpowiedź"}', extra = {}) => Response.json({
  choices: [{ finish_reason: 'stop', message: { content } }],
  usage: { prompt_tokens: 101, completion_tokens: 12, prompt_cache_hit_tokens: 75, prompt_cache_miss_tokens: 26 },
  ...extra,
});

function mockFetch(t: TestContext, fn: typeof fetch = async () => poprawna()) {
  const klucze = ['DEEPSEEK_API_KEY', 'ANTHROPIC_API_KEY', 'AI_MODEL'] as const;
  const przed = klucze.map(k => process.env[k]);
  process.env.DEEPSEEK_API_KEY = 'klucz-testowy-nie-jest-sekretem';
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.AI_MODEL;
  t.after(() => klucze.forEach((k, i) => { if (przed[i] === undefined) delete process.env[k]; else process.env[k] = przed[i]; }));
  return t.mock.method(globalThis, 'fetch', fn);
}

const powod = (oczekiwany: AiNiedostepneError['powod']) => (e: unknown) => {
  assert.ok(e instanceof AiNiedostepneError);
  assert.equal(e.powod, oczekiwany);
  return true;
};

test('sends DeepSeek JSON schema with thinking disabled and maps token usage', async t => {
  let body: Record<string, unknown> = {};
  const mocked = mockFetch(t, async (url, init) => {
    assert.equal(url, 'https://api.deepseek.com/chat/completions');
    assert.equal(init?.method, 'POST');
    assert.equal(new Headers(init?.headers).get('authorization'), 'Bearer klucz-testowy-nie-jest-sekretem');
    assert.equal(new Headers(init?.headers).get('content-type'), 'application/json');
    assert.ok(init?.signal);
    body = JSON.parse(String(init?.body));
    return poprawna();
  });
  const result = await zapytajJson({ ...opcje, effort: 'high', maxTokens: 1234 });
  assert.equal(mocked.mock.callCount(), 1);
  assert.equal(body.model, 'deepseek-flash');
  assert.deepEqual(body.thinking, { type: 'disabled' });
  assert.deepEqual(body.response_format, { type: 'json_object' });
  assert.equal(body.max_tokens, 1234);
  assert.equal('effort' in body, false);
  assert.equal('output_config' in body, false);
  assert.equal('reasoning_effort' in body, false);
  assert.equal(JSON.stringify(body).includes('cache_control'), false);
  const messages = body.messages as { role: string; content: string }[];
  assert.deepEqual(messages.map(m => m.role), ['system', 'user']);
  assert.ok(messages[0].content.includes('Instrukcja pierwsza'));
  assert.ok(messages[0].content.includes('Instrukcja druga'));
  assert.match(messages[0].content, /JSON/);
  assert.ok(messages[0].content.includes(JSON.stringify(z.toJSONSchema(schemat))));
  assert.equal(messages[1].content, 'Dane mieszkańca');
  assert.deepEqual(result.dane, { tekst: 'Odpowiedź' });
  assert.deepEqual(result.uzycie, { model: 'deepseek-flash', wejscie: 101, wyjscie: 12, cacheZapis: 0, cacheOdczyt: 75 });
});

test('ignores legacy Claude default and explicit model names', async t => {
  const models: string[] = [];
  mockFetch(t, async (_url, init) => { models.push(JSON.parse(String(init?.body)).model); return poprawna(); });
  process.env.AI_MODEL = 'claude-sonnet-4-6';
  assert.equal(DOMYSLNY_MODEL(), 'deepseek-flash');
  await zapytajJson({ ...opcje, model: 'claude-haiku-4-5' });
  process.env.AI_MODEL = 'deepseek-v4-pro';
  assert.equal(DOMYSLNY_MODEL(), 'deepseek-v4-pro');
  await zapytajJson(opcje);
  await zapytajJson({ ...opcje, model: 'deepseek-flash' });
  assert.deepEqual(models, ['deepseek-flash', 'deepseek-v4-pro', 'deepseek-flash']);
});

test('supports enum catch, nullable, optional, default and array schemas', async t => {
  mockFetch(t, async () => poprawna('{"id":"nieznany","opis":null,"lista":["a","nieznany"]}'));
  const schema = z.object({
    id: z.enum(['a', 'b']).catch('a'), opis: z.string().nullable(),
    opcjonalne: z.string().optional(), domyslne: z.string().optional().default('domyślne'),
    lista: z.array(z.enum(['a', 'b']).catch('a')),
  });
  const result = await zapytajJson({ ...opcje, schemat: schema });
  assert.deepEqual(result.dane, { id: 'a', opis: null, domyslne: 'domyślne', lista: ['a', 'a'] });
});

test('missing key fails without sending a request', async t => {
  const mocked = mockFetch(t);
  delete process.env.DEEPSEEK_API_KEY;
  await assert.rejects(() => zapytajJson(opcje), powod('brak_klucza'));
  assert.equal(mocked.mock.callCount(), 0);
});

for (const [name, content, extra] of [
  ['invalid JSON', '{unfinished', {}],
  ['empty content', '', {}],
  ['invalid schema output', '{"tekst":42}', {}],
  ['missing choice', '', { choices: [] }],
  ['null message', '', { choices: [{ finish_reason: 'stop', message: null }] }],
] as const) {
  test('rejects ' + name + ' without retry', async t => {
    const mocked = mockFetch(t, async () => poprawna(content, extra));
    await assert.rejects(() => zapytajJson(opcje), powod('zly_format'));
    assert.equal(mocked.mock.callCount(), 1);
  });
}

test('invalid HTTP JSON is a format failure without retry', async t => {
  const mocked = mockFetch(t, async () => new Response('unparseable'));
  await assert.rejects(() => zapytajJson(opcje), powod('zly_format'));
  assert.equal(mocked.mock.callCount(), 1);
});

for (const [finish, expected] of [['length', 'przerwane'], ['content_filter', 'odmowa'], ['refusal', 'odmowa']] as const) {
  test('maps finish reason ' + finish + ' before trying to parse JSON', async t => {
    const mocked = mockFetch(t, async () => poprawna('', { choices: [{ finish_reason: finish, message: { content: '' } }] }));
    await assert.rejects(() => zapytajJson(opcje), powod(expected));
    assert.equal(mocked.mock.callCount(), 1);
  });
}

test('maps refusal message without exposing provider text', async t => {
  mockFetch(t, async () => poprawna('', { choices: [{ finish_reason: 'stop', message: { content: null, refusal: 'PRIVATE RESPONSE' } }] }));
  await assert.rejects(() => zapytajJson(opcje), e => {
    powod('odmowa')(e);
    assert.equal((e as Error).message.includes('PRIVATE'), false);
    return true;
  });
});

test('HTTP 400 fails once without logging or exposing response text', async t => {
  const mocked = mockFetch(t, async () => new Response('PRIVATE KEY AND PROMPT', { status: 400 }));
  const logged = t.mock.method(console, 'error', () => {});
  await assert.rejects(() => zapytajJson(opcje), e => {
    powod('blad')(e);
    assert.equal((e as Error).message.includes('PRIVATE'), false);
    return true;
  });
  assert.equal(mocked.mock.callCount(), 1);
  assert.equal(logged.mock.callCount(), 0);
});

for (const status of [429, 503]) {
  test('retries HTTP ' + status + ' once', async t => {
    let calls = 0;
    mockFetch(t, async () => ++calls === 1 ? new Response('PRIVATE RESPONSE', { status }) : poprawna());
    assert.deepEqual((await zapytajJson(opcje)).dane, { tekst: 'Odpowiedź' });
    assert.equal(calls, 2);
  });
}

test('persistent network failure is bounded and sanitized', async t => {
  const mocked = mockFetch(t, async () => { throw new Error('PRIVATE KEY AND PROMPT'); });
  await assert.rejects(() => zapytajJson(opcje), e => {
    powod('blad')(e);
    assert.equal((e as Error).message.includes('PRIVATE'), false);
    return true;
  });
  assert.equal(mocked.mock.callCount(), 2);
});

test('timeout covers stalled response body and does not retry', async t => {
  const mocked = mockFetch(t, async () => new Response(new ReadableStream({ start() {} })));
  const started = Date.now();
  await assert.rejects(() => zapytajJson({ ...opcje, timeoutMs: 25 }), powod('przerwane'));
  assert.ok(Date.now() - started < 1000);
  assert.equal(mocked.mock.callCount(), 1);
});

test('timeout aborts stalled fetch even when mock ignores its signal', async t => {
  const mocked = mockFetch(t, () => new Promise<Response>(() => {}));
  await assert.rejects(() => zapytajJson({ ...opcje, timeoutMs: 25 }), powod('przerwane'));
  assert.equal(mocked.mock.callCount(), 1);
});

test('accepts schema keys written with Polish diacritics, values untouched', async t => {
  mockFetch(t, async () => poprawna('{"lista":[{"wskazówka":"Zróbcie próbę","kryterium":"łączność"}],"pełne":true}'));
  const wynik = await zapytajJson({ ...opcje, schemat: z.object({ lista: z.array(z.object({ wskazowka: z.string(), kryterium: z.string() })), pelne: z.boolean() }) });
  assert.deepEqual(wynik.dane, { lista: [{ wskazowka: 'Zróbcie próbę', kryterium: 'łączność' }], pelne: true });
});
