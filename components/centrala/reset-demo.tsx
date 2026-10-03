"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ResetDemo() {
  const router = useRouter();
  const [info, setInfo] = React.useState("");
  return (
    <div className="karta space-y-3 p-6">
      <h2 className="text-2xl font-bold">Dane demonstracyjne</h2>
      <p className="text-muted">Usuwa zgłoszenia, pomysły, testy, wnioski, powiadomienia i dodane innowacje wprowadzone podczas pokazu. Dane syntetyczne zostają.</p>
      <Button type="button" wariant="obrys" onClick={async () => {
        if (!window.confirm("Na pewno usunąć dane wprowadzone podczas pokazu?")) return;
        const r = await fetch("/api/admin/reset-demo", { method: "POST" });
        setInfo(r.ok ? "Dane demo przywrócone." : "Nie udało się przywrócić danych.");
        if (r.ok) router.refresh();
      }}>Przywróć dane demo</Button>
      <p role="status" className="font-semibold">{info}</p>
    </div>
  );
}
