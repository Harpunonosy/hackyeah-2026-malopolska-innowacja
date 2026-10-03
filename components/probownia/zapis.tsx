"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function Zapis({ id, wolne }: { id: string; wolne: number }) {
  const t = useTranslations("probownia");
  const [otwarty, setOtwarty] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [stan, setStan] = React.useState<"" | "pracuje" | "ok" | "blad" | "pelny">("");
  const [komunikat, setKomunikat] = React.useState("");
  const [numer, setNumer] = React.useState("");

  if (wolne <= 0 && stan !== "ok") return <p className="font-bold text-muted">{t("pelny")}</p>;
  if (stan === "ok") return <p role="status" className="font-bold text-ok">{t("zapisano")}{numer && <> {t("numerZapisu")}: <Link href={`/moje/${numer}`} className="font-mono">{numer}</Link></>}</p>;
  if (!otwarty) return <Button type="button" onClick={() => setOtwarty(true)}>{t("chce")}</Button>;

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setStan("pracuje");
        const r = await fetch(`/api/testy/${id}/zapis`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
        if (r.ok) { setNumer((await r.json().catch(() => ({}))).numer ?? ""); return setStan("ok"); }
        const d = await r.json().catch(() => ({}));
        setKomunikat(r.status === 409 ? t("pelny") : d.komunikat ?? t("blad"));
        setStan("blad");
      }}
    >
      <label htmlFor={`e-${id}`} className="block font-bold">{t("email")}</label>
      <p id={`ep-${id}`} className="text-sm text-muted">{t("emailPomoc")}</p>
      <input id={`e-${id}`} type="email" autoComplete="email" aria-describedby={`ep-${id}`} value={email} onChange={(e) => setEmail(e.target.value)} className="block min-h-12 w-full max-w-md rounded-xl border-2 border-line bg-card px-4 text-lg hover:border-fg" />
      <Button type="submit" disabled={stan === "pracuje"}>{stan === "pracuje" ? t("zapisujac") : t("zapisz")}</Button>
      {stan === "blad" && <p role="alert" className="font-semibold text-primary">{komunikat}</p>}
    </form>
  );
}
