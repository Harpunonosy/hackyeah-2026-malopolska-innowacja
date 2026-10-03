"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function DecyzjaLidera({ id, nazwa }: { id: string; nazwa: string }) {
  const t = useTranslations("siecCentrala");
  const router = useRouter();
  const [pracuje, setPracuje] = React.useState(false);
  const decyduj = async (decyzja: "zatwierdzony" | "odrzucony") => {
    setPracuje(true);
    await fetch(`/api/admin/liderzy/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ decyzja }) });
    router.refresh();
  };
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" disabled={pracuje} onClick={() => decyduj("zatwierdzony")}>{t("zatwierdz")}<span className="sr-only">: {nazwa}</span></Button>
      <Button type="button" wariant="obrys" disabled={pracuje} onClick={() => decyduj("odrzucony")}>{t("odrzuc")}<span className="sr-only">: {nazwa}</span></Button>
    </div>
  );
}
