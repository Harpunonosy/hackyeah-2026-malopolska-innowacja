import type { Metadata } from "next";
import Link from "next/link";
import { LogowanieEksperta, WylogujEksperta } from "@/components/ekspert/logowanie";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import { Chip } from "@/components/ui/chip";
import { db } from "@/lib/db";
import { aktualnyEkspert, HASLO_DEMO_EKSPERTA } from "@/lib/ekspert";
import { ETYKIETY_TYPOW, type TypSprawy } from "@/lib/sprawy-etykiety";
import { ETYKIETY_STATUSOW, type Status } from "@/lib/statusy";

export const metadata: Metadata = { title: "Panel eksperta" };
export const dynamic = "force-dynamic";

const fmt = (d: Date) => d.toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });

export default async function Page() {
  const e = await aktualnyEkspert();
  if (!e) {
    const { rows } = await db().query("select uzytkownik_id as id, nazwa, opis from eksperci order by nazwa");
    return (
      <Strona>
        <NaglowekStrony nadtytul="Dla ekspertów i mentorów" tytul="Panel eksperta" opis="Tu eksperci odpowiadają na pytania i oceniają pomysły. Autor widzi odpowiedź pod swoim numerem sprawy." />
        <LogowanieEksperta eksperci={rows} haslo={HASLO_DEMO_EKSPERTA} />
      </Strona>
    );
  }
  const { rows } = await db().query(
    `select id, numer, typ, tytul, status, tresc_zamaskowana, streszczenie, termin_sla, created_at
     from zgloszenia where ekspert_id=$1 order by (status in ('odpowiedz','zamkniete')), termin_sla`,
    [e.id],
  );
  const doOdpowiedzi = rows.filter((r) => r.status !== "odpowiedz" && r.status !== "zamkniete");
  return (
    <Strona>
      <NaglowekStrony nadtytul="Panel eksperta" tytul={e.nazwa} opis={`Do odpowiedzi: ${doOdpowiedzi.length}. Sprawy z Twoich obszarów trafiają tu automatycznie, a pracownik ROPS może przekazać kolejne.`} />
      <p><WylogujEksperta /></p>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.id}>
            <Link href={`/ekspert/zgloszenia/${r.id}`} className="block space-y-2 rounded-2xl border-2 border-fg bg-card p-4 text-fg no-underline hover:bg-fg hover:text-bg">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold">{r.numer}</span>
                <Chip>{ETYKIETY_TYPOW[r.typ as TypSprawy] ?? r.typ}</Chip>
                <Chip>{ETYKIETY_STATUSOW[r.status as Status].etykieta}</Chip>
              </span>
              <span className="block text-lg">{r.streszczenie ?? r.tytul ?? r.tresc_zamaskowana.slice(0, 160)}</span>
              <span className="block text-sm opacity-80">Termin odpowiedzi {fmt(r.termin_sla)}</span>
            </Link>
          </li>
        ))}
        {rows.length === 0 && <li className="text-lg">Brak spraw. Pytania z Twoich obszarów pojawią się tu automatycznie.</li>}
      </ul>
    </Strona>
  );
}
