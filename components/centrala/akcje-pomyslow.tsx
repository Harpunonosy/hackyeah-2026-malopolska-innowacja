"use client";
import { apiFetch } from "@/lib/fetch-klient";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUSY: [string, string][] = [["przeczytana", "Przeczytana"], ["w_ocenie", "W ocenie"], ["zaproszona_do_naboru", "Zaproś do naboru"], ["odrzucona", "Odrzuć"]];

export function StatusFiszki({ id, status, publiczna, wyniki = "", etap }: { id: string; status: string; publiczna: boolean; wyniki?: string; etap: string }) {
  const router = useRouter();
  const [zajety, setZajety] = React.useState(false);
  const [info, setInfo] = React.useState("");
  const [opisWynikow, setOpisWynikow] = React.useState(wyniki);
  const [etapNowy, setEtapNowy] = React.useState(etap);
  async function zapisz(dane: object) {
    setZajety(true); setInfo("");
    const r = await apiFetch(`/api/admin/fiszki/${id}/status`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(dane) });
    setZajety(false); setInfo(r.ok ? "Zapisano zmianę." : "Nie udało się zapisać. Spróbuj ponownie.");
    if (r.ok) router.refresh();
  }
  return <fieldset disabled={zajety} className="space-y-3">
    <legend className="sr-only">Zarządzaj pomysłem</legend>
    <div role="group" aria-label="Zmień status pomysłu" className="flex flex-wrap gap-2">
      {STATUSY.map(([v, e]) => <Button key={v} type="button" wariant="obrys" aria-pressed={status === v} className="aria-pressed:bg-fg aria-pressed:text-bg" onClick={() => zapisz({ status: v })}>{e}</Button>)}
    </div>
    <Button type="button" wariant={publiczna ? "obrys" : "zloty"} aria-pressed={publiczna} onClick={() => zapisz({ publiczna: !publiczna })}>{publiczna ? "Wycofaj z galerii" : "Opublikuj w galerii"}</Button>
    <label htmlFor={`etap-${id}`} className="block font-bold">Etap rozwiązania</label>
    <select id={`etap-${id}`} value={etapNowy} onChange={e => setEtapNowy(e.target.value)} className="min-h-12 max-w-full rounded-xl border-2 border-line bg-card p-2">
      <option value="pomysl">Pomysł</option><option value="prototyp">Prototyp</option><option value="przetestowane">Przetestowane</option><option value="gotowe">Gotowe do wdrożenia</option>
    </select>
    <label htmlFor={`wyniki-${id}`} className="block font-bold">Wyniki testów — po weryfikacji, bez danych uczestników</label>
    <textarea id={`wyniki-${id}`} rows={3} maxLength={600} value={opisWynikow} onChange={e => setOpisWynikow(e.target.value)} className="block w-full rounded-xl border-2 border-line bg-card p-3" />
    <p>Wyniki opublikowanego pomysłu będą widoczne w galerii dobrych praktyk.</p>
    <Button type="button" wariant="obrys" onClick={() => zapisz({ wyniki: opisWynikow, etap: etapNowy })}>Zapisz etap i wyniki testów</Button>
    <p role="status">{info}</p>
  </fieldset>;
}

type Podsumowanie = { co_dziala: string[]; co_poprawic: string[]; cytaty: string[] };

export function PodsumujOpinie({ innowacjaId }: { innowacjaId: string }) {
  const [stan, setStan] = React.useState<"" | "pracuje" | "blad">("");
  const [p, setP] = React.useState<Podsumowanie | null>(null);
  return (
    <div className="space-y-3">
      {!p && (
        <Button type="button" wariant="zloty" disabled={stan === "pracuje"} onClick={async () => {
          setStan("pracuje");
          const r = await apiFetch("/api/admin/opinie/podsumowanie", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ innowacjaId }) });
          if (!r.ok) return setStan("blad");
          setP(await r.json());
          setStan("");
        }}>
          <Sparkles aria-hidden className="size-5" />
          {stan === "pracuje" ? "Podsumowuję…" : "Podsumuj opinie (AI)"}
        </Button>
      )}
      {stan === "blad" && <p role="alert" className="font-semibold text-primary">Nie udało się przygotować podsumowania.</p>}
      {p && (
        <div className="karta-mala grid gap-4 p-4 md:grid-cols-3" aria-live="polite">
          <div><p className="font-bold">Co działa</p><ul className="list-disc pl-5">{p.co_dziala.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><p className="font-bold">Co poprawić</p><ul className="list-disc pl-5">{p.co_poprawic.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><p className="font-bold">Cytaty</p><ul className="space-y-1">{p.cytaty.map((x) => <li key={x} className="italic">„{x}”</li>)}</ul><p className="mt-2 text-xs text-muted">Podsumowanie przygotowane z pomocą AI.</p></div>
        </div>
      )}
    </div>
  );
}

export function AkceptujTest({ id }: { id: string }) {
  const router = useRouter();
  const [info, setInfo] = React.useState("");
  const decyduj = async (decyzja: "akceptuj" | "odrzuc") => {
    const r = await apiFetch(`/api/admin/testy/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ decyzja }) });
    const d = await r.json().catch(() => ({}));
    setInfo(r.ok ? (decyzja === "akceptuj" ? `Zaakceptowano. Zaproszono osób: ${d.zaproszono ?? 0}.` : "Odrzucono.") : "Nie udało się zapisać decyzji.");
    if (r.ok) router.refresh();
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => decyduj("akceptuj")}>Zaakceptuj i zaproś pasujące osoby</Button>
        <Button type="button" wariant="obrys" onClick={() => decyduj("odrzuc")}>Odrzuć</Button>
      </div>
      <p role="status" className="font-semibold">{info}</p>
    </div>
  );
}
