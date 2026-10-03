// Użycie: node scripts/obciazenie.mjs http://localhost:3100 50 20  (adres, równolegli użytkownicy, sekundy)
// Test obciążenia stron bez AI: N równoległych "użytkowników" przez T sekund.
const [baza, rownolegle = 50, sekund = 20] = [process.argv[2], Number(process.argv[3] ?? 50), Number(process.argv[4] ?? 20)];
const sciezki = ["/", "/wiedza/biblioteka", "/wiedza/biblioteka/straznik", "/wiedza/malopolska", "/wiedza/powiat/olkuski", "/galeria", "/api/v1/innowacje?q=senior"];
const czasy = []; let bledy = 0; const koniec = Date.now() + sekund * 1000;
async function uzytkownik(i) {
  let n = i;
  while (Date.now() < koniec) {
    const s = sciezki[n++ % sciezki.length]; const t = performance.now();
    try { const r = await fetch(baza + s); await r.arrayBuffer(); if (!r.ok) bledy++; } catch { bledy++; }
    czasy.push(performance.now() - t);
  }
}
await Promise.all(Array.from({ length: rownolegle }, (_, i) => uzytkownik(i)));
czasy.sort((a, b) => a - b);
const p = (q) => Math.round(czasy[Math.floor(czasy.length * q)]);
console.log(JSON.stringify({ rownolegle, sekund, zapytan: czasy.length, naSekunde: Math.round(czasy.length / sekund), bledy, p50: p(0.5), p95: p(0.95), p99: p(0.99) }));
