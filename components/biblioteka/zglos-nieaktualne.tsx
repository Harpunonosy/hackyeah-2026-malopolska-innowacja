"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ZglosNieaktualne({ id, nazwa }: { id: string; nazwa: string }) {
  const t = useTranslations("wiedza");
  const [otwarty, setOtwarty] = React.useState(false);
  const [tresc, setTresc] = React.useState("");
  const [stan, setStan] = React.useState<"" | "ok" | "blad">("");
  if (stan === "ok") return <p role="status" className="font-semibold text-ok">{t("nieaktualneDzieki")}</p>;
  if (!otwarty) return <Button type="button" wariant="cichy" onClick={() => setOtwarty(true)}>{t("nieaktualne")}</Button>;
  return (
    <form className="space-y-2" onSubmit={async (e) => {
      e.preventDefault();
      const r = await fetch("/api/pytania", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tekst: `[Nieaktualna informacja: ${nazwa} (${id})] ${tresc}`, zgoda: true }) });
      setStan(r.ok ? "ok" : "blad");
    }}>
      <label htmlFor="nieakt" className="block font-semibold">{t("nieaktualnePytanie")}</label>
      <textarea id="nieakt" rows={3} value={tresc} onChange={(e) => setTresc(e.target.value)} className="block w-full rounded-xl border-2 border-line bg-card p-3 hover:border-fg" />
      <Button type="submit" disabled={tresc.trim().length < 5}>{t("wyslij")}</Button>
      {stan === "blad" && <p role="alert" className="font-semibold text-primary">{t("nieaktualneBlad")}</p>}
    </form>
  );
}
