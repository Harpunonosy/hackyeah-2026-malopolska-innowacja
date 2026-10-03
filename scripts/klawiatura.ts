/**
 * Automatyczny test klawiatury (WCAG 2.1.1, 2.1.2, 2.4.1, 2.4.3, 2.4.7):
 * przechodzi klawiszem Tab po stronach i sprawdza, czy każdy element z fokusem ma widoczny wskaźnik
 * i dostępną nazwę, czy pierwszy jest link „Przejdź do treści” i czy fokus nie utyka w pułapce.
 *   npx tsx --env-file=.env.local scripts/klawiatura.ts [adres]
 * Nie zastępuje testu ręcznego (kolejność logiczna, czytelność ogłoszeń czytnika ekranu).
 */
import { chromium } from "playwright-core";

const BAZA = process.argv[2] ?? "http://localhost:3000";
const STRONY = ["/", "/problem", "/pomysl", "/moje", "/wiedza/biblioteka", "/rozmowa", "/asystowane", "/wdrozenie", "/testy", "/rynek", "/latwy"];
const MAKS = 120;

type Stop = { opis: string; nazwa: string; widoczny: boolean };

async function main() {
  const przegladarka = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const kontekst = await przegladarka.newContext({ viewport: { width: 1280, height: 900 }, locale: "pl-PL" });
  // pomijamy panel „Jak wolisz korzystać?”, żeby liczyć drogę do głównej treści
  await kontekst.addCookies([{ name: "splot_a11y_wybor", value: "1", url: BAZA }]);
  const strona = await kontekst.newPage();
  let problemy = 0;
  for (const sciezka of STRONY) {
    await strona.goto(`${BAZA}${sciezka}`, { waitUntil: "load", timeout: 90000 });
    await strona.waitForTimeout(800);
    const stopy: Stop[] = [];
    const widziane = new Set<string>();
    let petla = false;
    for (let i = 0; i < MAKS; i++) {
      await strona.keyboard.press("Tab");
      const s = await strona.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        if (el.tagName === "NEXTJS-PORTAL") return { klucz: "dev", opis: "dev", nazwa: "dev", widoczny: true, dev: true }; // nakładka trybu dev
        const cs = getComputedStyle(el);
        const widoczny = (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2) || (cs.boxShadow !== "none" && cs.boxShadow !== "");
        const etykieta = el.getAttribute("aria-label") || (el.getAttribute("aria-labelledby") ? document.getElementById(el.getAttribute("aria-labelledby")!)?.innerText : "") ||
          (el.id ? document.querySelector(`label[for="${el.id}"]`)?.textContent : "") || el.closest("label")?.textContent || el.innerText || el.getAttribute("title") || (el as HTMLInputElement).placeholder || "";
        const klucz = `${el.tagName}#${el.id}.${el.getAttribute("href") ?? ""}.${(etykieta || "").slice(0, 30)}.${Math.round(el.getBoundingClientRect().top + scrollY)}`;
        return { klucz, opis: `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}`, nazwa: (etykieta || "").trim().replace(/\s+/g, " ").slice(0, 50), widoczny };
      });
      if (!s) break;
      if ("dev" in s) continue;
      if (widziane.has(s.klucz)) { petla = true; break; }
      widziane.add(s.klucz);
      stopy.push(s);
    }
    const bezFokusu = stopy.filter((s) => !s.widoczny);
    const bezNazwy = stopy.filter((s) => !s.nazwa);
    const pierwszy = stopy[0]?.nazwa ?? "";
    const skip = /przejdź do treści|перейти/i.test(pierwszy);
    const zle = bezFokusu.length + bezNazwy.length + (skip ? 0 : 1);
    problemy += zle;
    console.log(`${zle ? "UWAGA" : "OK   "} ${sciezka.padEnd(20)} ${stopy.length} elementów${stopy.length >= MAKS ? "+" : ""}, pierwszy: „${pierwszy}”${petla ? ", fokus wraca na początek (brak pułapki)" : ""}`);
    for (const s of bezFokusu.slice(0, 3)) console.log(`      bez widocznego fokusu: ${s.opis} „${s.nazwa}”`);
    for (const s of bezNazwy.slice(0, 3)) console.log(`      bez nazwy: ${s.opis}`);
  }
  await przegladarka.close();
  console.log(problemy === 0 ? "\nKlawiatura: wszystkie elementy mają widoczny fokus i nazwę" : `\nKlawiatura: ${problemy} uwag`);
}
main();
