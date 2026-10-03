import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";

export const metadata: Metadata = { title: "Dla integratorów: API, webhooki, widżet" };

const ENDPOINTY: [string, string, `e${number}`, string][] = [
  ["GET", "/api/v1/innowacje", "e0", "/api/v1/innowacje?q=seniorzy+samotność"],
  ["GET", "/api/v1/innowacje/{id}", "e1", "/api/v1/innowacje/straznik"],
  ["GET", "/api/v1/nabory", "e2", "/api/v1/nabory"],
  ["GET", "/api/v1/potrzeby", "e3", "/api/v1/potrzeby"],
  ["POST", "/api/v1/dopasuj", "e4", ""],
  ["GET", "/api/v1/openapi.json", "e5", "/api/v1/openapi.json"],
];

const KOD_WERYFIKACJI = `// Node.js: sprawdzenie podpisu webhooka Splotu
import { createHmac, timingSafeEqual } from "node:crypto";

function czyOdSplotu(req, tresc, sekret) {
  const czas = req.headers["x-splot-czas"];
  const podpis = req.headers["x-splot-podpis"];      // "v1=<hex>"
  if (Math.abs(Date.now() / 1000 - Number(czas)) > 300) return false;
  const oczekiwany = "v1=" + createHmac("sha256", sekret)
    .update(\`\${czas}.\${tresc}\`).digest("hex");
  return oczekiwany.length === podpis.length &&
    timingSafeEqual(Buffer.from(oczekiwany), Buffer.from(podpis));
}`;

const PRZYKLAD_DOPASUJ = `curl -X POST {baza}/api/v1/dopasuj \\
  -H "content-type: application/json" \\
  -d '{"tekst":"Mama jest sama po śmierci taty, nie wychodzi z domu","powiat":"olkuski"}'`;

export default async function Integracje() {
  const t = await getTranslations("integracje");
  const h = await headers();
  const baza = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host") ?? "localhost:3000"}`;
  const kodWidzetu = `<iframe src="${baza}/widzet?powiat=olkuski" title="Znajdź pomoc: wyszukiwarka innowacji społecznych Małopolski" width="100%" height="640" style="border:0;max-width:720px" loading="lazy"></iframe>`;

  return (
    <Strona>
      <NaglowekStrony nadtytul={t("tytul")} tytul={t("publTytul")} opis={t("publWstep")} />

      <section aria-labelledby="widzet-h" className="karta max-w-4xl space-y-4 p-6 sm:p-8">
        <h2 id="widzet-h" className="text-3xl font-extrabold">{t("widzetTytul")}</h2>
        <p className="text-lg">{t("widzetOpis")}</p>
        <h3 className="text-xl font-bold">{t("widzetKod")}</h3>
        <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-hero p-4 text-sm text-hero-fg" tabIndex={0}><code>{kodWidzetu}</code></pre>
        <h3 className="text-xl font-bold">{t("widzetPodglad")}</h3>
        <iframe src="/widzet?powiat=olkuski" title={t("widzetPodglad")} className="h-[640px] w-full max-w-[720px] rounded-2xl border-2 border-line-soft bg-bg" loading="lazy" />
      </section>

      <section aria-labelledby="api-h" className="karta max-w-4xl space-y-4 p-6 sm:p-8">
        <h2 id="api-h" className="text-3xl font-extrabold">{t("apiPublTytul")}</h2>
        <p className="text-lg">{t("apiPublOpis")}</p>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-labelledby="api-h">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-fg">
                <th scope="col" className="py-2 pr-3">{t("metoda")}</th>
                <th scope="col" className="py-2 pr-3">{t("adres")}</th>
                <th scope="col" className="py-2">{t("opis")}</th>
              </tr>
            </thead>
            <tbody>
              {ENDPOINTY.map(([m, adres, opis, przyklad]) => (
                <tr key={adres} className="border-b border-line-soft align-top">
                  <td className="py-2 pr-3 font-mono font-bold">{m}</td>
                  <td className="py-2 pr-3 font-mono text-sm">{przyklad ? <a href={przyklad} className="underline">{adres}</a> : adres}</td>
                  <td className="py-2">{t(opis as "e0")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="text-xl font-bold">{t("przyklad")}: POST /api/v1/dopasuj</h3>
        <pre className="overflow-x-auto rounded-xl bg-hero p-4 text-sm text-hero-fg" tabIndex={0}><code>{PRZYKLAD_DOPASUJ.replace("{baza}", baza)}</code></pre>
      </section>

      <section aria-labelledby="wh-h" className="karta max-w-4xl space-y-4 p-6 sm:p-8">
        <h2 id="wh-h" className="text-3xl font-extrabold">{t("webhookiTytul")}</h2>
        <p className="text-lg">{t("webhookiOpis")}</p>
        <p className="text-lg">{t("webhookiPublOpis")}</p>
        <pre className="overflow-x-auto rounded-xl bg-hero p-4 text-sm text-hero-fg" tabIndex={0}><code>{KOD_WERYFIKACJI}</code></pre>
      </section>

      <section aria-labelledby="bezp-h" className="karta max-w-4xl space-y-3 p-6 sm:p-8">
        <h2 id="bezp-h" className="text-3xl font-extrabold">{t("bezpieczenstwoTytul")}</h2>
        <ul className="list-disc space-y-1 pl-6 text-lg">
          {(["bezp1", "bezp2", "bezp3", "bezp4"] as const).map((k) => <li key={k}>{t(k)}</li>)}
        </ul>
        <h3 className="text-xl font-bold">{t("skalaTytul")}</h3>
        <p className="text-lg">{t("skalaOpis")}</p>
      </section>
    </Strona>
  );
}
