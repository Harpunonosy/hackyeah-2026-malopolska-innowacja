import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CentralaNav } from "@/components/centrala/centrala-nav";
import { Webhooki, type WebhookWidok } from "@/components/centrala/webhooki";
import { db } from "@/lib/db";
import { czyAdmin } from "@/lib/sesja";
import { OPISY_ZDARZEN, ZDARZENIA } from "@/lib/webhooki";

export const metadata: Metadata = { title: "Centrala: integracje" };

export default async function Page() {
  if (!(await czyAdmin())) redirect("/centrala/logowanie");
  const t = await getTranslations("integracje");
  const c = db();
  const [w, d] = await Promise.all([
    c.query("select id, nazwa, url, zdarzenia, aktywny from webhooki order by created_at"),
    c.query(`select webhook_id, zdarzenie, status_http, czas_ms, blad, created_at from (
      select *, row_number() over (partition by webhook_id order by created_at desc) as nr from webhooki_dostawy) x where nr <= 5`),
  ]);
  const lista: WebhookWidok[] = w.rows.map((r) => ({
    ...r,
    dostawy: d.rows.filter((x) => x.webhook_id === r.id).map((x) => ({ ...x, created_at: x.created_at.toISOString() })),
  }));
  return (
    <div className="space-y-10">
      <div>
        <CentralaNav aktywna="integracje" />
        <h1 className="text-4xl font-bold sm:text-5xl">{t("tytul")}</h1>
        <p className="mt-2 max-w-3xl text-lg text-muted">{t("wstep")}</p>
      </div>
      <section aria-labelledby="wh-h" className="space-y-4">
        <h2 id="wh-h" className="text-3xl font-extrabold">{t("webhookiTytul")}</h2>
        <p className="max-w-3xl">{t("webhookiOpis")}</p>
        <Webhooki lista={lista} zdarzenia={ZDARZENIA.map((z) => [z, OPISY_ZDARZEN[z]])} />
      </section>
      <section aria-labelledby="api-h" className="space-y-3">
        <h2 id="api-h" className="text-3xl font-extrabold">{t("apiTytul")}</h2>
        <p className="max-w-3xl">{t("apiOpis")}</p>
        <ul className="space-y-1 text-lg">
          <li><Link href="/integracje" className="underline">{t("dokumentacja")}</Link></li>
          <li><a href="/api/v1/openapi.json" className="underline">{t("openapi")}</a></li>
          <li><a href="/api/admin/eksport/zgloszenia" className="underline">{t("eksportZgloszen")}</a></li>
          <li><a href="/api/admin/eksport/wnioski" className="underline">{t("eksportWnioskow")}</a></li>
        </ul>
      </section>
    </div>
  );
}
