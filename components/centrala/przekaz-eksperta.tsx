"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PrzekazEksperta({ id, eksperci, aktualny }: { id: string; eksperci: { id: string; nazwa: string }[]; aktualny: string | null }) {
  const router = useRouter();
  const [wybrany, setWybrany] = React.useState<string | null>(aktualny);
  const [info, setInfo] = React.useState("");
  return (
    <fieldset className="space-y-2">
      <legend className="text-lg font-bold">Przekaż do eksperta</legend>
      <div className="flex flex-wrap gap-2">
        {eksperci.map((x) => (
          <label key={x.id} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-line-soft bg-card px-4 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg">
            <input type="radio" name={`eks-${id}`} checked={wybrany === x.id} onChange={() => setWybrany(x.id)} className="size-4 accent-current" />
            {x.nazwa}
          </label>
        ))}
      </div>
      <Button type="button" wariant="obrys" disabled={!wybrany || wybrany === aktualny} onClick={async () => {
        const r = await fetch(`/api/admin/zgloszenia/${id}/ekspert`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ekspertId: wybrany }) });
        setInfo(r.ok ? "Przekazano. Ekspert widzi sprawę w swoim panelu." : "Nie udało się przekazać.");
        if (r.ok) router.refresh();
      }}>Przekaż</Button>
      <p role="status" className="font-semibold">{info}</p>
    </fieldset>
  );
}
