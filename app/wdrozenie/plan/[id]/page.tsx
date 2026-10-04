import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { Drukuj } from "@/components/krawiec/drukuj";
import { KonsultacjaPlanu } from "@/components/krawiec/konsultacja";
import { PlanTresc, type DanePlanu, type ProfilPlanu } from "@/components/krawiec/plan-tresc";
import { OBSZAR_KATEGORII } from "@/lib/obszary";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Strona } from "@/components/strona";
import { innowacjaPoIdAsync } from "@/lib/katalog";
import { db } from "@/lib/db";
import { BUDZETY, TYPY_INSTYTUCJI } from "@/lib/krawiec-stale";
import { NABOR_ETYKIETA } from "@/lib/krawiec-nabor";
import type { Kwalifikowalnosc, PlanWdrozenia } from "@/lib/krawiec";

export const metadata: Metadata = { title: "Plan wdrożenia" };
const UUID = /^[0-9a-f-]{36}$/i;
export default async function Plan(props: PageProps<"/wdrozenie/plan/[id]">) {
  const { id } = await props.params;
  if (!UUID.test(id)) notFound();
  const { rows } = await db().query("select innowacja_id, profil, plan, kwalifikowalnosc from plany_wdrozenia where id=$1", [id]);
  if (!rows[0]) notFound();
  const t = await getTranslations("krawiec");
  const inn = await innowacjaPoIdAsync(rows[0].innowacja_id);
  const profil = rows[0].profil as ProfilPlanu;
  const { plan, dane } = rows[0].plan as { plan: PlanWdrozenia; dane: DanePlanu };
  const kw = rows[0].kwalifikowalnosc as Kwalifikowalnosc;
  // Ekspert polecany: ten, którego obszary obejmują obszar innowacji.
  const eksperci = (await db().query("select uzytkownik_id as id, nazwa, obszary from eksperci order by nazwa")).rows as { id: string; nazwa: string; obszary: string[] }[];
  const obszarInn = inn ? OBSZAR_KATEGORII[inn.kategoria] : undefined;
  const polecany = eksperci.find((e) => obszarInn && e.obszary?.includes(obszarInn))?.id ?? null;
  return <Strona className="max-w-4xl">
      <header className="space-y-3">
        <p className="text-sm font-bold text-primary">{t("nadtytul")}</p>
        <h1 className="text-[clamp(2rem,1.2rem+2.6vw,3.25rem)] font-bold">{t("planDla", { nazwa: inn?.nazwa ?? "" })}</h1>
        <p className="flex flex-wrap gap-2">
          <Chip>{TYPY_INSTYTUCJI[profil.typ]}</Chip>
          <Chip>{profil.powiat.replace("powiat ", "")}</Chip>
          <Chip>{t("odbiorcow",{n:profil.odbiorcy})}</Chip>
          <Chip>{BUDZETY[profil.budzet]}</Chip>
          <Chip>{NABOR_ETYKIETA}</Chip>
        </p>
        <p className="karta-mala flex items-start gap-3 border-2 border-accent p-4">
          <Sparkles aria-hidden className="mt-0.5 size-5 shrink-0" />
          {t("szkicInfo")}
        </p>
        <div className="nie-drukuj flex flex-wrap gap-3">
          <Drukuj etykieta={t("drukuj")} />
          <Button asChild wariant="obrys"><Link href="/wdrozenie">{t("nowy")}</Link></Button>
        </div>
      </header>

      <PlanTresc plan={plan} dane={dane} profil={profil} kw={kw} inn={inn ?? null} t={t} konsultacja={
        <section className="karta nie-drukuj space-y-3 border-2 border-accent p-5 sm:p-6">
          <h2 className="text-2xl font-bold">{t("konsultacjaTytul")}</h2>
          <KonsultacjaPlanu planId={id} eksperci={eksperci.map(({id,nazwa})=>({id,nazwa}))} polecany={polecany}/>
        </section>
      }/>
    </Strona>;
}
