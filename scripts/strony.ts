/** Wspólna lista stron do testów dostępności (axe) i szerokości 320 px. */
import type { Page } from "playwright-core";

export const PUBLICZNE = [
  "/", "/problem", "/latwy", "/rozmowa", "/moje", "/pomysl", "/testy", "/rynek", "/wdrozenie", "/galeria",
  "/wiedza/biblioteka", "/wiedza/biblioteka/straznik", "/wiedza/malopolska", "/wiedza/powiat", "/wiedza/powiat/olkuski",
  "/wiedza/materialy", "/wiedza/materialy/7b2381c3ed665c63", "/wiedza/akademia", "/ocena", "/zaufanie", "/dostepnosc", "/centrala/logowanie", "/asystowane", "/integracje", "/siec", "/widzet?powiat=olkuski",
];
export const ADMIN = [
  "/centrala/zgloszenia", "/centrala/radar", "/centrala/pomysly", "/centrala/nabory", "/centrala/tresci", "/centrala/akademia", "/centrala/dane", "/centrala/powiadomienia", "/centrala/integracje", "/centrala/puls",
];

/** Strony z parametrem: bierzemy pierwszy link z listy (np. pierwszą kartę zgłoszenia). */
const DYNAMICZNE: { lista: string; wzor: RegExp }[] = [
  { lista: "/centrala/zgloszenia", wzor: /^\/centrala\/zgloszenia\/[^/?#]+$/ },
  { lista: "/wiedza/akademia", wzor: /^\/wiedza\/akademia\/[^/?#]+$/ },
  { lista: "/ekspert", wzor: /^\/ekspert\/zgloszenia\/[^/?#]+$/ },
  { lista: "/moje", wzor: /^\/moje\/SPL-[^/?#]+$/ },
];

export async function zalogujAdmina(strona: Page, baza: string) {
  await strona.goto(`${baza}/centrala/logowanie`);
  await strona.fill("#haslo", process.env.DEMO_ADMIN_PASSWORD ?? "");
  await strona.click("button[type=submit]");
  await strona.waitForURL("**/centrala/zgloszenia");
}

export async function zalogujEksperta(strona: Page, baza: string) {
  await strona.goto(`${baza}/ekspert`);
  const pole = strona.locator("input[type=password]");
  if (await pole.count()) {
    await pole.first().fill(process.env.DEMO_EKSPERT_PASSWORD ?? "ekspert-demo");
    await strona.locator("form button[type=submit]").first().click();
    await strona.waitForTimeout(1500);
  }
}

export async function znajdzDynamiczne(strona: Page, baza: string): Promise<string[]> {
  const wynik: string[] = [];
  for (const { lista, wzor } of DYNAMICZNE) {
    await strona.goto(`${baza}${lista}`, { waitUntil: "load", timeout: 90000 }); await strona.waitForTimeout(1200);
    const hrefy = await strona.$$eval("a[href]", (a) => a.map((x) => x.getAttribute("href") ?? ""));
    const trafienie = hrefy.find((h) => wzor.test(h));
    if (trafienie) wynik.push(trafienie);
    else console.log(`(brak przykładu dla ${lista})`);
  }
  return wynik;
}
