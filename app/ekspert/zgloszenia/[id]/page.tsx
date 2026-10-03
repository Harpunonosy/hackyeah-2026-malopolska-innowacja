import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Odpowiedz } from "@/components/centrala/odpowiedz";
import { Strona } from "@/components/strona";
import { Chip } from "@/components/ui/chip";
import { db } from "@/lib/db";
import { aktualnyEkspert } from "@/lib/ekspert";
import { ETYKIETY_TYPOW, type TypSprawy } from "@/lib/sprawy-etykiety";

export const metadata: Metadata = { title: "Panel eksperta: sprawa" };
export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f-]{36}$/i;
const fmt = (d: Date) => d.toLocaleString("pl-PL", { dateStyle: "medium", timeStyle: "short" });

export default async function Page(props: PageProps<"/ekspert/zgloszenia/[id]">) {
  const e = await aktualnyEkspert();
  if (!e) redirect("/ekspert");
  const { id } = await props.params;
  if (!UUID.test(id)) notFound();
  const c = db();
  const z = (await c.query("select * from zgloszenia where id=$1 and ekspert_id=$2", [id, e.id])).rows[0];
  if (!z) notFound();
  const [dop, wiad] = await Promise.all([
    c.query("select i.id, i.nazwa, d.dlaczego from dopasowania d join innowacje i on i.id=d.innowacja_id where d.zgloszenie_id=$1 order by d.pozycja", [id]),
    c.query("select w.tresc, w.created_at, w.od, w.nadawca from wiadomosci w join watki t on t.id=w.watek_id where t.typ='zgloszenie' and t.obiekt_id=$1 order by w.created_at", [id]),
  ]);
  return (
    <Strona>
      <p><Link href="/ekspert">← Moje sprawy</Link></p>
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">{ETYKIETY_TYPOW[z.typ as TypSprawy] ?? "Sprawa"} <span className="font-mono">{z.numer}</span></h1>
        <p className="flex flex-wrap gap-2">{z.tytul && <Chip>{z.tytul}</Chip>}{z.powiat && <Chip>{z.powiat}</Chip>}</p>
        <p className="text-muted">Wpłynęło {fmt(z.created_at)}. Termin odpowiedzi {fmt(z.termin_sla)}. Dane osobowe są zamaskowane.</p>
      </header>
      <section aria-labelledby="tr" className="space-y-2"><h2 id="tr" className="text-2xl font-bold">Treść</h2><p className="karta whitespace-pre-line p-5 text-lg">{z.tresc_zamaskowana}</p></section>
      {dop.rows.length > 0 && (
        <section aria-labelledby="dp" className="space-y-2"><h2 id="dp" className="text-2xl font-bold">Dopasowane innowacje</h2>
          <ul className="space-y-2">{dop.rows.map((d) => <li key={d.id} className="karta-mala p-3"><Link href={`/wiedza/biblioteka/${d.id}`} className="font-bold">{d.nazwa}</Link><span className="block">{d.dlaczego}</span></li>)}</ul>
        </section>
      )}
      {wiad.rows.length > 0 && (
        <section aria-labelledby="wt" className="space-y-2"><h2 id="wt" className="text-2xl font-bold">Wątek</h2>
          {wiad.rows.map((w) => <p key={w.created_at} className="karta-mala whitespace-pre-line p-3">{w.tresc}<span className="mt-1 block text-sm text-muted">{w.od === "autor" ? "Autor" : w.od === "ekspert" ? w.nadawca ?? "Ekspert" : "ROPS"} · {fmt(w.created_at)}</span></p>)}
        </section>
      )}
      <section className="space-y-3">
        <Odpowiedz id={id} szkic={z.szkic_odpowiedzi} zablokowane={false} adres="/api/ekspert/odpowiedz" etykieta="Twoja odpowiedź lub opinia" />
        <p className="text-sm text-muted">Szkic od AI jest podpowiedzią. Odpowiadasz jako ekspert i odpowiadasz za treść.</p>
      </section>
    </Strona>
  );
}
