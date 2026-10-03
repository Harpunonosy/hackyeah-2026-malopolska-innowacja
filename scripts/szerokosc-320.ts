/**
 * WCAG 1.4.10 (reflow): sprawdza, czy strony przy szerokości 320 px nie przewijają się w poziomie.
 *   npx tsx --env-file=.env.local scripts/szerokosc-320.ts [adres]
 */
import { chromium } from "playwright-core";
import { ADMIN, PUBLICZNE, zalogujAdmina, zalogujEksperta, znajdzDynamiczne } from "./strony";

const BAZA = process.argv[2] ?? "http://localhost:3000";

async function main() {
  const przegladarka = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const kontekst = await przegladarka.newContext({ viewport: { width: 320, height: 700 }, locale: "pl-PL" });
  const strona = await kontekst.newPage();
  await zalogujAdmina(strona, BAZA);
  await zalogujEksperta(strona, BAZA);
  const dynamiczne = await znajdzDynamiczne(strona, BAZA);
  let zle = 0;
  for (const sciezka of [...PUBLICZNE, ...ADMIN, "/ekspert", ...dynamiczne]) {
    await strona.goto(`${BAZA}${sciezka}`, { waitUntil: "load" });
    await strona.waitForTimeout(1200);
    const wynik = await strona.evaluate(() => {
      const szer = document.documentElement.scrollWidth;
      const winowajcy: string[] = [];
      if (szer > 321) {
        for (const el of Array.from(document.querySelectorAll("body *"))) {
          const r = el.getBoundingClientRect();
          if (r.right > 321 && r.width > 0) winowajcy.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)} (${Math.round(r.right)})`);
          if (winowajcy.length >= 4) break;
        }
      }
      return { szer, winowajcy };
    });
    if (wynik.szer > 321) zle++;
    console.log(`${wynik.szer > 321 ? "ZA SZEROKO" : "OK        "} ${sciezka} ${wynik.szer}px ${wynik.winowajcy.join(" | ")}`);
  }
  await przegladarka.close();
  console.log(zle === 0 ? "\n320 px: brak przewijania poziomego" : `\n320 px: ${zle} stron przewija się w poziomie`);
}
main();
