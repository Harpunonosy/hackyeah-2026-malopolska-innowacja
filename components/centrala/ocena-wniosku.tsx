"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Wybor } from "@/components/ui/wybor";

type Decyzja = "przyznano" | "lista_rezerwowa" | "odrzucono";

/** Ocena wniosku w Centrali: etapy, decyzja z uzasadnieniem, przekazanie do bazy grantowej (W-35). */
export function OcenaWniosku({ id, etap, numer, decyzja, przekazano }: { id: string; etap: string; numer: string | null; decyzja: Decyzja | null; przekazano: string | null }) {
  const t = useTranslations("wnioskiOcena");
  const router = useRouter();
  const [wybor, setWybor] = React.useState<Decyzja>(decyzja ?? "przyznano");
  const [uzasadnienie, setUzasadnienie] = React.useState("");
  const [info, setInfo] = React.useState("");

  async function wyslij(body: object, ok: string) {
    setInfo("");
    const r = await fetch(`/api/admin/wnioski/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    setInfo(r.ok ? ok : t("blad"));
    if (r.ok) router.refresh();
  }

  return (
    <div className="space-y-3 border-t-2 border-line-soft pt-3">
      <p className="flex flex-wrap gap-2">
        <Chip>{t("etap", { etap: t(`etapy.${etap}` as "etapy.zlozony") })}</Chip>
        {decyzja && <Chip>{t(`decyzje.${decyzja}`)}</Chip>}
        {numer && <Chip>{t("numer", { numer })}</Chip>}
        {przekazano && <Chip>{t("przekazano", { data: new Date(przekazano).toLocaleDateString("pl-PL") })}</Chip>}
      </p>
      <div className="flex flex-wrap gap-2">
        {etap === "zlozony" && <Button type="button" onClick={() => wyslij({ akcja: "etap", etap: "ocena_formalna" }, t("zapisano"))}>{t("formalna")}</Button>}
        {etap === "ocena_formalna" && <Button type="button" onClick={() => wyslij({ akcja: "etap", etap: "ocena_merytoryczna" }, t("zapisano"))}>{t("merytoryczna")}</Button>}
        {!przekazano && <Button type="button" wariant="obrys" onClick={() => wyslij({ akcja: "eksport" }, t("zapisanoEksport"))}>{t("eksport")}</Button>}
      </div>
      {etap === "ocena_merytoryczna" && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            wyslij({ akcja: "decyzja", decyzja: wybor, uzasadnienie: uzasadnienie || undefined }, t("zapisano"));
          }}
        >
          <Wybor nazwa={`dec-${id}`} legenda={t("decyzjaLegenda")} opcje={(["przyznano", "lista_rezerwowa", "odrzucono"] as const).map((d): [Decyzja, string] => [d, t(`decyzje.${d}`)])} wartosc={wybor} zmien={setWybor} />
          <div className="space-y-1">
            <label htmlFor={`uz-${id}`} className="block font-bold">{t("uzasadnienie")}</label>
            <textarea id={`uz-${id}`} rows={2} value={uzasadnienie} onChange={(e) => setUzasadnienie(e.target.value.slice(0, 600))} className="block w-full rounded-xl border-2 border-line bg-card p-3 hover:border-fg" />
          </div>
          <Button type="submit">{t("zapiszDecyzje")}</Button>
        </form>
      )}
      <p role="status" className="font-semibold">{info}</p>
    </div>
  );
}
