"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SchematNaboru } from "@/lib/nabor-schemat";

const POLE = "block w-full rounded-xl border-2 border-line bg-card p-3 text-base hover:border-fg";

export function NowyNabor() {
  const router = useRouter();
  const [nazwa, setNazwa] = React.useState("");
  const [temat, setTemat] = React.useState("");
  const [termin, setTermin] = React.useState("");
  const [regulamin, setRegulamin] = React.useState("");
  const [stan, setStan] = React.useState<"" | "pracuje" | "ok" | "blad">("");
  const [komunikat, setKomunikat] = React.useState("");

  async function wyslij(e: React.FormEvent) {
    e.preventDefault();
    setStan("pracuje");
    const r = await fetch("/api/admin/nabory", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nazwa, temat: temat || undefined, otwartyDo: termin || undefined, regulamin }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setKomunikat(d.komunikat ?? "Nie udało się odczytać regulaminu. Spróbuj ponownie.");
      return setStan("blad");
    }
    setStan("ok");
    setNazwa(""); setTemat(""); setTermin(""); setRegulamin("");
    router.refresh();
  }

  return (
    <form onSubmit={wyslij} className="karta space-y-4 p-6" aria-labelledby="nowy-nabor-h">
      <h2 id="nowy-nabor-h" className="text-2xl font-bold">Nowy nabór z regulaminu</h2>
      <p className="text-muted">Wklej regulamin lub opis formularza. Asystent AI wyciągnie z niego pola wniosku, limity znaków i kryteria oceny. Poprawisz je przed otwarciem naboru, a generator wniosków w Pracowni dopasuje się do tego naboru.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1"><label htmlFor="nn-nazwa" className="block text-lg font-bold">Nazwa naboru</label><input id="nn-nazwa" required value={nazwa} onChange={(e) => setNazwa(e.target.value)} className={POLE} /></div>
        <div className="space-y-1"><label htmlFor="nn-termin" className="block text-lg font-bold">Termin składania (nieobowiązkowo)</label><input id="nn-termin" type="date" value={termin} onChange={(e) => setTermin(e.target.value)} className={POLE} /></div>
      </div>
      <div className="space-y-1"><label htmlFor="nn-temat" className="block text-lg font-bold">Temat lub kategoria (nieobowiązkowo)</label><input id="nn-temat" value={temat} onChange={(e) => setTemat(e.target.value)} className={POLE} /></div>
      <div className="space-y-1"><label htmlFor="nn-reg" className="block text-lg font-bold">Regulamin lub opis formularza</label><textarea id="nn-reg" required rows={8} value={regulamin} onChange={(e) => setRegulamin(e.target.value)} className={POLE} /></div>
      <Button type="submit" disabled={stan === "pracuje"}>
        {stan === "pracuje" ? <Loader2 aria-hidden className="size-5 animate-spin" /> : <Sparkles aria-hidden className="size-5" />}
        {stan === "pracuje" ? "Czytam regulamin…" : "Odczytaj regulamin i utwórz nabór"}
      </Button>
      <p role="status" className="font-semibold">
        {stan === "ok" && "Nabór dodany jako zamknięty. Sprawdź pola i kryteria, a potem go otwórz."}
        {stan === "blad" && <span className="text-primary">{komunikat}</span>}
      </p>
    </form>
  );
}

export function EdytorNaboru({ id, schemat: poczatkowy, otwartyDo }: { id: string; schemat: SchematNaboru; otwartyDo: string | null }) {
  const router = useRouter();
  const [s, setS] = React.useState<SchematNaboru>(poczatkowy);
  const [termin, setTermin] = React.useState(otwartyDo ?? "");
  const [komunikat, setKomunikat] = React.useState("");

  async function zapisz(cialo: object, opis: string) {
    const r = await fetch(`/api/admin/nabory/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(cialo) });
    const d = await r.json().catch(() => ({}));
    setKomunikat(r.ok ? `${opis} Powiadomiono autorów pomysłów: ${d.powiadomiono ?? 0}.` : "Nie udało się zapisać.");
    if (r.ok) router.refresh();
  }

  return (
    <details className="karta-mala px-4 py-2">
      <summary className="min-h-10 cursor-pointer font-semibold">Pola wniosku, kryteria i termin ({s.pola.length} pól, {s.kryteria.length} kryteriów)</summary>
      <div className="space-y-6 py-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1"><label htmlFor={`t-${id}`} className="block font-bold">Termin składania</label><input id={`t-${id}`} type="date" value={termin} onChange={(e) => setTermin(e.target.value)} className="min-h-12 rounded-xl border-2 border-line bg-card px-3 text-base hover:border-fg" /></div>
          <Button type="button" wariant="obrys" onClick={() => zapisz({ otwartyDo: termin || null }, "Termin zapisany.")}>Zapisz termin</Button>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-lg font-bold">Pola wniosku</legend>
          {s.pola.map((p, i) => (
            <div key={i} className="karta-mala grid gap-2 p-3 md:grid-cols-[1fr_2fr_8rem_auto]">
              <div><label htmlFor={`p-${id}-${i}-n`} className="text-sm font-bold">Pole {p.nr}</label><input id={`p-${id}-${i}-n`} value={p.pole} onChange={(e) => setS({ ...s, pola: s.pola.map((x, j) => (j === i ? { ...x, pole: e.target.value } : x)) })} className={POLE} /></div>
              <div><label htmlFor={`p-${id}-${i}-p`} className="text-sm font-bold">Podpowiedź</label><input id={`p-${id}-${i}-p`} value={p.podpowiedz} onChange={(e) => setS({ ...s, pola: s.pola.map((x, j) => (j === i ? { ...x, podpowiedz: e.target.value } : x)) })} className={POLE} /></div>
              <div><label htmlFor={`p-${id}-${i}-l`} className="text-sm font-bold">Limit znaków</label><input id={`p-${id}-${i}-l`} inputMode="numeric" value={p.limit ?? ""} onChange={(e) => setS({ ...s, pola: s.pola.map((x, j) => (j === i ? { ...x, limit: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null } : x)) })} className={POLE} /></div>
              <Button type="button" wariant="obrys" aria-label={`Usuń pole ${p.nr}`} className="self-end" onClick={() => setS({ ...s, pola: s.pola.filter((_, j) => j !== i).map((x, j) => ({ ...x, nr: j + 1 })) })}><Trash2 aria-hidden className="size-5" /></Button>
            </div>
          ))}
          <Button type="button" wariant="obrys" onClick={() => setS({ ...s, pola: [...s.pola, { nr: s.pola.length + 1, pole: "Nowe pole", podpowiedz: "", limit: null }] })}><Plus aria-hidden className="size-5" />Dodaj pole</Button>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-lg font-bold">Kryteria oceny</legend>
          {s.kryteria.map((k, i) => (
            <div key={k.id + i} className="karta-mala grid gap-2 p-3 md:grid-cols-[2fr_6rem_6rem_auto]">
              <div><label htmlFor={`k-${id}-${i}-n`} className="text-sm font-bold">Kryterium</label><input id={`k-${id}-${i}-n`} value={k.nazwa} onChange={(e) => setS({ ...s, kryteria: s.kryteria.map((x, j) => (j === i ? { ...x, nazwa: e.target.value } : x)) })} className={POLE} /></div>
              <div><label htmlFor={`k-${id}-${i}-m`} className="text-sm font-bold">Maks. pkt</label><input id={`k-${id}-${i}-m`} inputMode="numeric" value={k.max} onChange={(e) => setS({ ...s, kryteria: s.kryteria.map((x, j) => (j === i ? { ...x, max: Number(e.target.value.replace(/\D/g, "")) || 0 } : x)) })} className={POLE} /></div>
              <div><label htmlFor={`k-${id}-${i}-p`} className="text-sm font-bold">Próg</label><input id={`k-${id}-${i}-p`} inputMode="numeric" value={k.prog ?? ""} onChange={(e) => setS({ ...s, kryteria: s.kryteria.map((x, j) => (j === i ? { ...x, prog: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null } : x)) })} className={POLE} /></div>
              <Button type="button" wariant="obrys" aria-label={`Usuń kryterium ${k.nazwa}`} className="self-end" onClick={() => setS({ ...s, kryteria: s.kryteria.filter((_, j) => j !== i) })}><Trash2 aria-hidden className="size-5" /></Button>
            </div>
          ))}
          <Button type="button" wariant="obrys" onClick={() => setS({ ...s, kryteria: [...s.kryteria, { id: `k${s.kryteria.length + 1}`, nazwa: "Nowe kryterium", opis: "", max: 10, prog: null }] })}><Plus aria-hidden className="size-5" />Dodaj kryterium</Button>
        </fieldset>

        <div className="space-y-1"><label htmlFor={`lim-${id}`} className="block font-bold">Limity i uwagi</label><textarea id={`lim-${id}`} rows={2} value={s.limity} onChange={(e) => setS({ ...s, limity: e.target.value })} className={POLE} /></div>
        <Button type="button" onClick={() => zapisz({ schemat: s }, "Schemat zapisany.")}>Zapisz schemat naboru</Button>
        <p role="status" className="font-semibold">{komunikat}</p>
      </div>
    </details>
  );
}
