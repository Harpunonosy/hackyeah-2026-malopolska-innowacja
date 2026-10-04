import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { OglosTest } from "@/components/probownia/oglos-test";
import { Opinia } from "@/components/probownia/opinia";
import { Zapis } from "@/components/probownia/zapis";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import { katalog } from "@/lib/katalog";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Chcę testować" };
export const dynamic = "force-dynamic";

export default async function Testy(props: PageProps<"/testy">) {
  const t = await getTranslations("probownia");
  const sp = await props.searchParams;
  const { mapa: innowacjaPoId } = await katalog();
  const oceniana = typeof sp.innowacja === "string" ? innowacjaPoId.get(sp.innowacja) : undefined;
  const { rows } = await db().query(
    `select t.id, t.innowacja_id, t.tytul, t.opis, t.kogo_szukamy, t.powiat, t.termin, t.liczba_miejsc, t.dostepnosc,
            (select count(*)::int from zapisy_testy z where z.test_id = t.id) as zajete
     from testy t where t.status = 'otwarty' order by t.created_at nulls last, t.tytul`,
  ).catch(() => db().query(`select t.id, t.innowacja_id, t.tytul, t.opis, t.kogo_szukamy, t.powiat, t.termin, t.liczba_miejsc, t.dostepnosc,
            (select count(*)::int from zapisy_testy z where z.test_id = t.id) as zajete from testy t where t.status = 'otwarty' order by t.tytul`));

  const testDoOceny = typeof sp.test === "string" && /^[0-9a-f-]{36}$/i.test(sp.test) ? (await db().query("select id,tytul from testy where id=$1 and status in ('otwarty','zakonczony')", [sp.test])).rows[0] : null;

  return (
    <Strona>
      <NaglowekStrony nadtytul={t("nadtytul")} tytul={t("tytul")} opis={t("opis")} />
      <section aria-labelledby="otwarte-h" className="space-y-5">
        <h2 id="otwarte-h" className="text-3xl font-extrabold">{t("otwarte")}</h2>
        {rows.length === 0 && <p className="text-lg">{t("brakTestow")}</p>}
        <ul className="grid auto-rows-fr gap-5 lg:grid-cols-2">
          {rows.map((r) => (
            <li key={r.id} className="karta flex flex-col gap-4 p-6">
              <h3 className="font-display text-2xl font-bold">{r.tytul}</h3>
              <p className="text-lg">{r.opis}</p>
              <dl className="grid gap-2 text-base sm:grid-cols-2">
                <div><dt className="text-sm font-bold text-muted">{t("kogo")}</dt><dd>{r.kogo_szukamy?.opis}</dd></div>
                <div><dt className="text-sm font-bold text-muted">{t("gdzie")}</dt><dd>{String(r.powiat).replace("powiat ", "")}</dd></div>
                <div><dt className="text-sm font-bold text-muted">{t("kiedy")}</dt><dd>{r.termin}</dd></div>
                <div><dt className="text-sm font-bold text-muted">{t("dostepnosc")}</dt><dd>{r.dostepnosc}</dd></div>
              </dl>
              <p className="font-bold">{t("miejsca", { wolne: Math.max(0, r.liczba_miejsc - r.zajete), razem: r.liczba_miejsc })}</p>
              <div className="mt-auto space-y-3">
                <Link href={`/testy?test=${r.id}#ocen-h`} className="inline-flex min-h-12 items-center underline">{t("ocenTenTest")}</Link>
                <Zapis id={r.id} wolne={r.liczba_miejsc - r.zajete} />
                {innowacjaPoId.has(r.innowacja_id) && <Link href={`/wiedza/biblioteka/${r.innowacja_id}`} className="inline-flex min-h-10 items-center font-semibold">{innowacjaPoId.get(r.innowacja_id)!.nazwa}</Link>}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="oglos-h" className="max-w-3xl space-y-4">
        <h2 id="oglos-h" className="text-3xl font-extrabold">{t("oglosTytul")}</h2>
        <p className="text-lg">{t("oglosOpis")}</p>
        <OglosTest />
      </section>
      <section aria-labelledby="ocen-h" className="max-w-3xl space-y-4">
        <h2 id="ocen-h" className="text-3xl font-extrabold">{t("ocenTytul")}</h2>
        {testDoOceny ? <><p className="text-lg font-bold">{testDoOceny.tytul}</p><Opinia testId={testDoOceny.id}/></> : oceniana ? (
          <>
            <p className="text-lg"><span className="font-bold">{t("wybierz")}:</span> {oceniana.nazwa}</p>
            <Opinia innowacjaId={oceniana.id} />
          </>
        ) : (
          <p className="text-lg">{t("ocenOpis")} <Link href="/wiedza/biblioteka" className="font-semibold">{t("przejdz")}</Link></p>
        )}
      </section>
    </Strona>
  );
}
