/**
 * Test dostępności (axe-core, WCAG 2.1 A/AA) i zrzuty ekranu działającej aplikacji.
 *   npm run build && npm start   (w drugim terminalu)
 *   npx tsx --env-file=.env.local scripts/a11y-i-zrzuty.ts [adres]
 */
import { mkdirSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright-core";

const BAZA = process.argv[2] ?? "http://localhost:3100";
const STRONY: { sciezka: string; nazwa: string; admin?: boolean; szerokosc?: number }[] = [
  { sciezka: "/", nazwa: "start" },
  { sciezka: "/problem", nazwa: "problem" },
  { sciezka: "/wiedza/biblioteka", nazwa: "biblioteka" },
  { sciezka: "/wiedza/biblioteka/straznik", nazwa: "innowacja" },
  { sciezka: "/moje", nazwa: "moje" },
  { sciezka: "/centrala/logowanie", nazwa: "centrala-logowanie" },
  { sciezka: "/centrala/zgloszenia", nazwa: "centrala-skrzynka", admin: true },
  { sciezka: "/centrala/radar", nazwa: "centrala-radar", admin: true },
];

async function main() {
  mkdirSync("docs/zrzuty", { recursive: true });
  const przegladarka = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const kontekst = await przegladarka.newContext({ viewport: { width: 1280, height: 900 }, locale: "pl-PL" });
  const strona = await kontekst.newPage();

  await strona.goto(`${BAZA}/centrala/logowanie`);
  await strona.fill("#haslo", process.env.DEMO_ADMIN_PASSWORD ?? "");
  await strona.click("button[type=submit]");
  await strona.waitForURL("**/centrala/zgloszenia");

  let bledy = 0;
  for (const s of STRONY) {
    await strona.goto(`${BAZA}${s.sciezka}`, { waitUntil: "networkidle" });
    const wynik = await new AxeBuilder({ page: strona }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    await strona.screenshot({ path: `docs/zrzuty/${s.nazwa}.png`, fullPage: true });
    bledy += wynik.violations.length;
    console.log(`${wynik.violations.length === 0 ? "OK " : "BŁĄD"} ${s.sciezka}  (${wynik.violations.length} naruszeń, ${wynik.passes.length} reguł zaliczonych)`);
    for (const v of wynik.violations) {
      console.log(`   - [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} elementów)`);
      for (const n of v.nodes.slice(0, 2)) console.log(`       ${n.target.join(" ")}  ${n.failureSummary?.split("\n")[1] ?? ""}`);
    }
  }
  await przegladarka.close();
  console.log(bledy === 0 ? "\naxe: 0 naruszeń na wszystkich stronach" : `\naxe: ${bledy} naruszeń`);
}
main();
