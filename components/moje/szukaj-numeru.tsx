"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function SzukajNumeru() {
  const t = useTranslations("moje");
  const router = useRouter();
  const [numer, setNumer] = React.useState("");
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (numer.trim()) router.push(`/moje/${encodeURIComponent(numer.trim().toUpperCase())}`);
      }}
    >
      <label htmlFor="numer" className="block text-xl font-bold">
        {t("etykieta")}
      </label>
      <input
        id="numer"
        value={numer}
        onChange={(e) => setNumer(e.target.value)}
        placeholder="SPL-XXXXXXXX"
        autoComplete="off"
        className="block min-h-14 w-full max-w-md rounded-xl border-2 border-fg bg-card px-4 font-mono text-xl uppercase"
      />
      <Button type="submit" rozmiar="lg">
        {t("szukaj")}
      </Button>
    </form>
  );
}
