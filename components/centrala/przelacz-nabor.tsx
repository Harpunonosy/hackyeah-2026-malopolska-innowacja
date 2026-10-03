"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PrzelaczNabor({ id, aktywny }: { id: string; aktywny: boolean }) {
  const router = useRouter();
  const [info, setInfo] = React.useState("");
  return (
    <div className="space-y-2">
      <Button type="button" wariant={aktywny ? "obrys" : "glowny"} onClick={async () => {
        const r = await fetch(`/api/admin/nabory/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ aktywny: !aktywny }) });
        const d = await r.json().catch(() => ({}));
        setInfo(r.ok ? `Gotowe. Powiadomiono autorów pomysłów: ${d.powiadomiono ?? 0}.` : "Nie udało się zmienić statusu.");
        router.refresh();
      }}>
        {aktywny ? "Zamknij nabór" : "Otwórz nabór"}
      </Button>
      <p role="status" className="font-semibold">{info}</p>
    </div>
  );
}
