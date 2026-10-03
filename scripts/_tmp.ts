import { chromium } from "playwright-core";
import { zalogujAdmina } from "./strony";
(async () => {
  const br = await chromium.launch({ executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox"] });
  const p = await (await br.newContext()).newPage();
  await p.addInitScript(() => {
    const w = window as unknown as { __pow: string[]; Notification: unknown };
    w.__pow = [];
    function F(t: string, o?: NotificationOptions) { w.__pow.push(t + " | " + (o?.body ?? "")); return { close() {} }; }
    (F as unknown as { permission: string }).permission = "granted";
    w.Notification = F;
  });
  p.on("pageerror", (e) => console.log("pageerror:", e.message.slice(0, 300)));
  p.on("console", (m) => console.log("console", m.type(), m.text().slice(0, 200)));
  await zalogujAdmina(p, "http://localhost:3000");
  await p.waitForTimeout(3000);
  console.log("typeof:", await p.evaluate(() => `${typeof Notification} ${(Notification as unknown as { permission: string }).permission}`));
  await fetch("http://localhost:3000/api/zgloszenia", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "10.8.8." + Math.floor(Math.random() * 200) }, body: JSON.stringify({ tekst: "Test powiadomienia na pulpicie numer dwa: brak zajęć dla seniorów.", zgoda: true }) });
  await p.waitForTimeout(7000);
  console.log("powiadomienia:", await p.evaluate(() => (window as unknown as { __pow: string[] }).__pow));
  await br.close();
})();
