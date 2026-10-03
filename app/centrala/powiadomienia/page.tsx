import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CentralaNav } from "@/components/centrala/centrala-nav";
import { Chip } from "@/components/ui/chip";
import { db } from "@/lib/db";
import { czyAdmin } from "@/lib/sesja";

export const metadata: Metadata = { title: "Centrala: powiadomienia" };
export const dynamic = "force-dynamic";

const fmt = (d: Date) => d.toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });

export default async function Page() {
  if (!(await czyAdmin())) redirect("/centrala/logowanie");
  const c = db();
  const { rows } = await c.query(
    "select id, adresat, typ, tytul, tresc, link, kanal, symulowane, przeczytane_at, created_at from powiadomienia order by created_at desc limit 150",
  );
  await c.query("update powiadomienia set przeczytane_at = now() where adresat='rops' and przeczytane_at is null");
  const rops = rows.filter((r) => r.adresat === "rops");
  const autorzy = rows.filter((r) => r.adresat === "autor");
  return (
    <div className="space-y-10">
      <div>
        <CentralaNav aktywna="powiadomienia" />
        <h1 className="text-4xl font-bold sm:text-5xl">Powiadomienia</h1>
        <p className="mt-2 max-w-3xl text-lg text-muted">
          Jedna magistrala zdarzeń: nowe sprawy i pomysły trafiają do ROPS, a odpowiedzi, zmiany w naborach i nowe rozwiązania do autorów.
          E-maile i SMS-y są w prototypie symulowane. Ta lista pokazuje, co i kiedy zostałoby wysłane.
        </p>
      </div>
      <section aria-labelledby="rops-h" className="space-y-3">
        <h2 id="rops-h" className="text-3xl font-extrabold">Dla ROPS ({rops.length})</h2>
        <ul className="space-y-2">
          {rops.map((r) => (
            <li key={r.id} className={`karta-mala space-y-1 p-4 ${r.przeczytane_at ? "" : "border-l-8 border-l-primary"}`}>
              <p className="font-bold">{r.tytul}</p>
              <p>{r.tresc}</p>
              <p className="text-sm text-muted">{fmt(r.created_at)}{r.link && <> · <Link href={r.link}>otwórz</Link></>}</p>
            </li>
          ))}
          {rops.length === 0 && <li className="text-lg">Brak powiadomień.</li>}
        </ul>
      </section>
      <section aria-labelledby="autorzy-h" className="space-y-3">
        <h2 id="autorzy-h" className="text-3xl font-extrabold">Skrzynka nadawcza: do autorów ({autorzy.length})</h2>
        <ul className="space-y-2">
          {autorzy.map((r) => (
            <li key={r.id} className="karta-mala space-y-1 p-4">
              <p className="flex flex-wrap items-center gap-2"><strong>{r.tytul}</strong> <Chip>{r.kanal === "email" ? "e-mail" : r.kanal === "sms" ? "SMS" : "w aplikacji"}</Chip>{r.symulowane && <Chip>symulacja</Chip>}</p>
              <p>{r.tresc}</p>
              <p className="text-sm text-muted">{fmt(r.created_at)}{r.link && <> · <Link href={r.link}>{r.link}</Link></>}</p>
            </li>
          ))}
          {autorzy.length === 0 && <li className="text-lg">Brak wysłanych powiadomień.</li>}
        </ul>
      </section>
    </div>
  );
}
