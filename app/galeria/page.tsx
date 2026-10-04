import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Rozmowa } from "@/components/rozmowa/rozmowa";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import { Chip } from "@/components/ui/chip";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Galeria pomysłów i dobrych praktyk" };
export const dynamic = "force-dynamic";

const ETAPY: Record<string, string> = { pomysl: "Pomysł", prototyp: "Prototyp w testach", przetestowane: "Przetestowane w mikroskali", gotowe: "Gotowe" };

export default async function Galeria() {
  const t = await getTranslations("galeria");
  const { rows } = await db().query(
    "select id, tytul, opis, istota, dla_kogo, etap, powiat, wyniki_testu, syntetyczne from fiszki where publiczna order by (etap='przetestowane') desc, created_at desc limit 60",
  );
  return (
    <Strona>
      <NaglowekStrony nadtytul={t("nadtytul")} tytul={t("tytul")} opis={t("opis")} />
      {rows.length === 0 && <p className="text-lg">{t("brak")}</p>}
      <ul className="grid auto-rows-fr gap-6 lg:grid-cols-2">
        {rows.map((f) => (
          <li key={f.id} className="karta flex flex-col gap-4 p-6">
            <p className="flex flex-wrap gap-2">
              <Chip className="bg-accent text-accent-fg">{ETAPY[f.etap] ?? f.etap}</Chip>
              {f.powiat && <Chip>{String(f.powiat).replace("powiat ", "")}</Chip>}
              {f.syntetyczne && <Chip>{t("demo")}</Chip>}
            </p>
            <h2 className="font-display text-2xl font-bold">{f.tytul}</h2>
            <p className="text-lg">{f.opis}</p>
            <dl className="space-y-2">
              <div><dt className="text-sm font-bold text-muted">{t("naCzymPolega")}</dt><dd>{f.istota}</dd></div>
              <div><dt className="text-sm font-bold text-muted">{t("dlaKogo")}</dt><dd>{f.dla_kogo}</dd></div>
              {f.wyniki_testu && <div><dt className="text-sm font-bold text-muted">{t("wyniki")}</dt><dd>{f.wyniki_testu}</dd></div>}
            </dl>
            <div className="mt-auto space-y-2">
              <p className="font-semibold">{t("cochcesz")}</p>
              <Rozmowa cel="fiszka" celId={f.id} rodzaje={["pomoc", "test", "podobny", "partner"]} id={f.id} />
            </div>
          </li>
        ))}
      </ul>
    </Strona>
  );
}
