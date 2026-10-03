/** Test Jury §6: pomysł → powiadomienie → odpowiedź → autor. Wyłącznie na lokalnej bazie testowej. */
import assert from "node:assert/strict";
import { przegladarkaTestowa } from "./przegladarka";
import { zalogujAdmina } from "./strony";

const baza = process.argv[2] ?? "http://localhost:3100";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(baza).hostname) && process.env.SPLOT_TEST_BAZA_LOCALNA === "1", "Test zapisuje syntetyczne zgłoszenie. Uruchom tylko na odrębnej bazie lokalnej: SPLOT_TEST_BAZA_LOCALNA=1.");

async function main() {
  // Pełne Chromium: Headless Shell pokazuje Notification.permission=denied mimo grantPermissions.
  const browser = await przegladarkaTestowa("chromium");
  try {
    const context = await browser.newContext({ permissions: ["notifications"] });
    await context.addCookies([{ name: "splot_a11y_wybor", value: "1", url: baza }]);
    await context.addInitScript(() => {
      const Native = window.Notification;
      const powiadomienia: string[] = [];
      Object.assign(window, { __powiadomienia: powiadomienia });
      window.Notification = new Proxy(Native, {
        construct(target, args: [string, NotificationOptions?]) {
          const n = Reflect.construct(target, args);
          powiadomienia.push(`${args[0]}: ${args[1]?.body ?? ""}`);
          return n;
        },
        get(target, key) { return Reflect.get(target, key, target); },
      });
    });
    const centrala = await context.newPage();
    const bledy: string[] = [];
    centrala.on("pageerror", (e) => bledy.push(e.message));
    await zalogujAdmina(centrala, baza);
    await centrala.getByText("Brak zgłoszeń.", { exact: true }).or(centrala.locator("a[href^='/centrala/zgloszenia/']").first()).waitFor();

    const mieszkaniec = await context.newPage();
    await mieszkaniec.goto(`${baza}/pomysl`);
    await mieszkaniec.getByRole("button", { name: /bez AI/ }).click();
    const tytul = `Test komunikacji ${Date.now()}`;
    await mieszkaniec.locator("#f-tytul").fill(tytul);
    await mieszkaniec.locator("#f-krotki_opis").fill("Sąsiedzkie spotkania w bibliotece dla samotnych seniorów.");
    await mieszkaniec.locator("#f-istota").fill("Wolontariusze organizują spotkania i pomagają poznać sąsiadów.");
    await mieszkaniec.locator("#f-dla_kogo").fill("Osoby starsze szukające kontaktu z sąsiadami.");
    const wyslanie = mieszkaniec.waitForResponse((r) => r.url().endsWith("/api/pracownia/fiszka") && r.request().method() === "POST");
    await mieszkaniec.getByRole("button", { name: "Wyślij pomysł do ROPS", exact: true }).click();
    const odpowiedz = await wyslanie;
    assert.equal(odpowiedz.status(), 201);
    const { numer } = await odpowiedz.json();
    assert.match(numer, /^SPL-/);
    const start = Date.now();
    await centrala.locator("[aria-live='assertive']").getByText(new RegExp(numer)).waitFor({ timeout: 15000 });
    const opóźnienie = Date.now() - start;
    const notyfikacje = await centrala.evaluate(() => (window as unknown as { __powiadomienia: string[] }).__powiadomienia);
    assert.ok(notyfikacje.some((n) => n.includes(numer)), "Wywołano natywny konstruktor Notification dla nowej sprawy");
    await centrala.locator("a[href^='/centrala/zgloszenia/']").filter({ hasText: numer }).click();
    const tresc = "Dziękujemy za pomysł. Zapraszamy do konsultacji z ekspertem ds. seniorów.";
    await centrala.locator("#odp-tresc").fill(tresc);
    await centrala.getByRole("button", { name: "Wyślij odpowiedź", exact: true }).click();
    await centrala.getByText("Odpowiedź wysłana. Autor widzi nowy status.", { exact: true }).waitFor();
    await mieszkaniec.goto(`${baza}/moje/${numer}`);
    await mieszkaniec.getByText(tresc, { exact: true }).waitFor();
    assert.deepEqual(bledy, []);
    console.log(`OK: ${numer}; powiadomienie w ${opóźnienie} ms; Notification wywołane; odpowiedź i status widoczne u autora.`);

    // Przerwa w połączeniu jest widoczna, a podgląd wraca po kolejnym odświeżeniu.
    let awaria = true;
    await mieszkaniec.route(`**/api/zgloszenia/${numer}`, (route) => awaria ? route.abort() : route.continue());
    await mieszkaniec.getByRole("status").filter({ hasText: "Nie udało się odświeżyć sprawy" }).waitFor({ timeout: 15000 });
    awaria = false;
    await mieszkaniec.getByRole("status").filter({ hasText: "Nie udało się odświeżyć sprawy" }).waitFor({ state: "hidden", timeout: 15000 });
    assert.ok(await mieszkaniec.getByText(tresc, { exact: true }).isVisible());
    console.log("OK: utrata połączenia, zachowanie odpowiedzi i automatyczne odzyskanie podglądu.");
  } finally {
    await browser.close();
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
