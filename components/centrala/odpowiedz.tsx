"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Odpowiedz({ id, szkic, zablokowane, adres, etykieta = "Odpowiedź do autora" }: { id: string; szkic: string | null; zablokowane: boolean; adres?: string; etykieta?: string }) {
  const router = useRouter();
  const [tresc, setTresc] = React.useState(szkic ?? "");
  const [zAi, setZAi] = React.useState(false);
  const [stan, setStan] = React.useState<"" | "wysylam" | "ok" | "blad">("");

  async function wyslij(e: React.FormEvent) {
    e.preventDefault();
    setStan("wysylam");
    const r = await fetch(adres ?? `/api/admin/zgloszenia/${id}/odpowiedz`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, tresc, zAi }),
    });
    setStan(r.ok ? "ok" : "blad");
    if (r.ok) router.refresh();
  }

  return (
    <form onSubmit={wyslij} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="odp-tresc" className="text-xl font-bold">
          {etykieta}
        </label>
        {szkic && (
          <Button
            type="button"
            wariant="zloty"
            onClick={() => {
              setTresc(szkic);
              setZAi(true);
            }}
          >
            <Sparkles aria-hidden className="size-5" />
            Użyj szkicu od AI
          </Button>
        )}
      </div>
      <textarea
        id="odp-tresc"
        value={tresc}
        onChange={(e) => setTresc(e.target.value)}
        rows={9}
        className="block w-full rounded-xl border-2 border-fg bg-card p-4 text-lg"
      />
      {zAi && <p className="text-sm text-muted">Treść pochodzi ze szkicu AI. Autor zobaczy adnotację, że odpowiedź przygotowano z pomocą AI. Popraw ją przed wysłaniem.</p>}
      <Button type="submit" disabled={zablokowane || tresc.trim().length < 3 || stan === "wysylam"}>
        {stan === "wysylam" ? "Wysyłam…" : "Wyślij odpowiedź"}
      </Button>
      <p role="status" className="font-semibold">
        {stan === "ok" && "Odpowiedź wysłana. Autor widzi nowy status."}
        {stan === "blad" && "Nie udało się wysłać."}
      </p>
    </form>
  );
}
