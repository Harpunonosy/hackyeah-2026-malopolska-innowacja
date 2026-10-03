import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { MAX_IOSS_BYTES } from './ioss-import';

const WAZNOSC_MS = 15 * 60 * 1000;
function sekret() {
  const klucz = process.env.SESSION_SECRET;
  if (klucz && klucz.length >= 16) return klucz;
  if (process.env.NODE_ENV === 'production') throw new Error('Brak SESSION_SECRET');
  return 'tylko-lokalnie-dev-sekret';
}
const hash = (csv: string) => createHash('sha256').update(csv).digest('hex');
const podpis = (wartosc: string) => createHmac('sha256', sekret()).update('ioss-podglad:' + wartosc).digest('hex');

/** Zatwierdzenie dotyczy dokładnie danych pokazanych w podglądzie. */
export function podpiszPodglad(csv: string, teraz = Date.now()): string {
  const wartosc = `${teraz + WAZNOSC_MS}.${hash(csv)}`;
  return `${wartosc}.${podpis(wartosc)}`;
}

export function sprawdzPodglad(csv: string, token: string, teraz = Date.now()): boolean {
  if (!/^\d+\.[a-f0-9]{64}\.[a-f0-9]{64}$/.test(token)) return false;
  const [wygasa, suma, sig] = token.split('.');
  if (Number(wygasa) <= teraz || Number(wygasa) > teraz + WAZNOSC_MS || suma !== hash(csv)) return false;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(podpis(`${wygasa}.${suma}`)));
}

/** Limit sprawdzany podczas odczytu strumienia, również bez Content-Length. */
export async function odczytajIossRequest(req: Request, limit = MAX_IOSS_BYTES): Promise<string> {
  if (Number(req.headers.get('content-length')) > limit) throw new Error('rozmiar');
  if (!req.body) return '';
  const reader = req.body.getReader(), decoder = new TextDecoder('utf-8', { fatal: true });
  let bajty = 0, csv = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bajty += value.byteLength;
      if (bajty > limit) { await reader.cancel(); throw new Error('rozmiar'); }
      try { csv += decoder.decode(value, { stream: true }); }
      catch { throw new Error('kodowanie'); }
    }
    try { csv += decoder.decode(); }
    catch { throw new Error('kodowanie'); }
    return csv;
  } finally { reader.releaseLock(); }
}
