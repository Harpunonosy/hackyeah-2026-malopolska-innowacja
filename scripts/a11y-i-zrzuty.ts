/**
 * Test dostępności (axe-core, WCAG 2.1 A/AA) i zrzuty ekranu działającej aplikacji.
 *   npm run build && npm start   (w drugim terminalu)
 *   npx tsx --env-file=.env.local scripts/a11y-i-zrzuty.ts [adres]
 */
import { mkdirSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { przegladarkaTestowa } from "./przegladarka";
import { ADMIN, PUBLICZNE, zalogujAdmina, zalogujEksperta, znajdzDynamiczne } from "./strony";

const BAZA = process.argv[2] ?? "http://localhost:3100";
const TRYBY = process.argv.includes("--tryby");
const ZRZUTY = !process.argv.includes("--bez-zrzutow");

async function main() {
  mkdirSync("docs/zrzuty", { recursive: true });
  const przegladarka = await przegladarkaTestowa();
  const kontekst = await przegladarka.newContext({ viewport: { width: 1280, height: 900 }, locale: "pl-PL" });
  const strona = await kontekst.newPage();

  await zalogujAdmina(strona, BAZA);
  await zalogujEksperta(strona, BAZA);
  const STRONY = [...PUBLICZNE, ...ADMIN, "/ekspert", ...(await znajdzDynamiczne(strona, BAZA))];

  let bledy = 0;
  const warianty: { przyrostek: string; ciastko?: string; szerokosc?: number }[] = [{ przyrostek: "" }];
  if (TRYBY) warianty.push(
    { przyrostek: "-kontrast", ciastko: JSON.stringify({ prosty: true, rozmiar: "bardzo-duzy", kontrast: "wysoki" }) },
    { przyrostek: "-320", szerokosc: 320 },
  );
  for (const w of warianty) {
    await kontekst.addCookies([{ name: "splot_a11y", value: encodeURIComponent(w.ciastko ?? JSON.stringify({ prosty: false, rozmiar: "normalny", kontrast: "normalny" })), url: BAZA }]);
    await strona.setViewportSize({ width: w.szerokosc ?? 1280, height: 900 });
  for (const sciezka of STRONY) {
    const s = { sciezka, nazwa: (sciezka === "/" ? "start" : sciezka.slice(1).replaceAll("/", "-")) + w.przyrostek };
    const odpowiedz = await strona.goto(`${BAZA}${s.sciezka}`, { waitUntil: "load", timeout: 90000 });
    if (!odpowiedz?.ok()) throw new Error(`Strona zwróciła HTTP ${odpowiedz?.status()}: ${strona.url()}`);
    await strona.waitForTimeout(1200);
    const wynik = await new AxeBuilder({ page: strona }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    if (ZRZUTY && !w.przyrostek) await strona.screenshot({ path: `docs/zrzuty/${s.nazwa}.png`, fullPage: true });
    bledy += wynik.violations.length;
    console.log(`${wynik.violations.length === 0 ? "OK " : "BŁĄD"} ${s.nazwa}  (${wynik.violations.length} naruszeń, ${wynik.passes.length} reguł zaliczonych)`);
    for (const v of wynik.violations) {
      console.log(`   - [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} elementów)`);
      for (const n of v.nodes.slice(0, 2)) console.log(`       ${n.target.join(" ")}  ${n.failureSummary?.split("\n")[1] ?? ""}`);
    }
  }
  }
  await przegladarka.close();
  console.log(bledy === 0 ? "\naxe: 0 naruszeń na wszystkich stronach" : `\naxe: ${bledy} naruszeń`);
  if (bledy > 0) process.exitCode = 1;
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
