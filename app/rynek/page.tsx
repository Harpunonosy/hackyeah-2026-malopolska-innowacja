import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CalendarClock } from "lucide-react";
import { DodajOgloszenie } from "@/components/rynek/ogloszenie";
import { Rozmowa } from "@/components/rozmowa/rozmowa";
import { Pytanie } from "@/components/rynek/pytanie";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import { Chip } from "@/components/ui/chip";
import { db } from "@/lib/db";
import { nazwaObszaru, type ObszarId } from "@/lib/obszary";

export const metadata: Metadata = { title: "Zapytaj eksperta" };
export const dynamic = "force-dynamic";

export default async function Rynek() {
  const t = await getTranslations("rynek");
  const [eks, par] = await Promise.all([
    db().query("select u.id, e.nazwa, e.dziedziny, e.obszary, e.opis, e.dyzury from eksperci e join uzytkownicy u on u.id = e.uzytkownik_id order by e.nazwa"),
    db().query("select id, tytul, szuka, obszar, powiat, opis, numer from partnerstwa order by created_at desc limit 30"),
  ]);
  const szuka: Record<string, string> = { taniej: t("szukaTaniej"), dotrzec: t("szukaDotrzec"), wartosc: t("szukaWartosc") };
  return (
    <Strona>
      <NaglowekStrony nadtytul={t("nadtytul")} tytul={t("tytul")} opis={t("opis")}>
        <p className="karta-mala border-2 border-accent p-4 text-lg"><Link href="/siec" className="font-semibold underline">{t("siecLink")}</Link></p>
      </NaglowekStrony>
      <div className="max-w-3xl"><Pytanie eksperci={eks.rows.map((e) => ({ id: e.id, nazwa: e.nazwa }))} /></div>

      <section aria-labelledby="eks-h" className="space-y-5">
        <h2 id="eks-h" className="text-3xl font-extrabold">{t("eksperci")}</h2>
        <ul className="grid auto-rows-fr gap-5 md:grid-cols-2">
          {eks.rows.map((e) => (
            <li key={e.id} className="karta flex flex-col gap-3 p-6">
              <h3 className="font-display text-xl font-bold">{e.nazwa}</h3>
              <p>{e.opis}</p>
              <p className="flex flex-wrap gap-2">{(e.dziedziny as string[]).map((d) => <Chip key={d}>{d}</Chip>)}</p>
              <p className="mt-auto flex items-center gap-2 font-semibold"><CalendarClock aria-hidden className="size-5 text-primary" />{t("dyzury")}: {e.dyzury}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="par-h" className="space-y-5">
        <div className="max-w-2xl space-y-1"><h2 id="par-h" className="text-3xl font-extrabold">{t("partnerzy")}</h2><p className="text-lg text-muted">{t("partnerzyOpis")}</p></div>
        <ul className="grid auto-rows-fr gap-5 md:grid-cols-2 lg:grid-cols-3">
          {par.rows.map((p) => (
            <li key={p.id} className="karta flex flex-col gap-3 p-6">
              <p className="flex flex-wrap gap-2"><Chip className="bg-accent text-accent-fg">{szuka[p.szuka]}</Chip><Chip>{nazwaObszaru(p.obszar as ObszarId)}</Chip>{p.powiat && <Chip>{String(p.powiat).replace("powiat ", "")}</Chip>}</p>
              <h3 className="font-display text-xl font-bold leading-snug">{p.tytul}</h3>
              <p className="text-muted">{p.opis}</p>
              {p.numer && <div className="mt-auto"><Rozmowa cel="partnerstwo" celId={p.id} rodzaje={["partner"]} id={p.id} /></div>}
            </li>
          ))}
        </ul>
        <div className="max-w-3xl"><DodajOgloszenie /></div>
      </section>
    </Strona>
  );
}
