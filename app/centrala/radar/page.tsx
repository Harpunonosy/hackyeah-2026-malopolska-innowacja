import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Flame } from "lucide-react";
import { CentralaNav } from "@/components/centrala/centrala-nav";
import { Kartogram } from "@/components/centrala/kartogram";
import { ListaLuk } from "@/components/centrala/lista-luk";
import { Sparkline } from "@/components/centrala/sparkline";
import { nazwaObszaru } from "@/lib/obszary";
import { policzRadar } from "@/lib/radar";
import { czyAdmin } from "@/lib/sesja";

export const metadata: Metadata = { title: "Centrala: Radar potrzeb" };

export default async function Radar() {
  if (!(await czyAdmin())) redirect("/centrala/logowanie");
  const r = await policzRadar();
  const kpi = [
    { etykieta: "Zgłoszeń (26 tygodni)", wartosc: r.kpi.zgloszen },
    { etykieta: "Bez dopasowanego rozwiązania", wartosc: `${r.kpi.bezDopasowania} (${r.kpi.procentBez}%)` },
    { etykieta: "Białe plamy", wartosc: r.kpi.bialePlamy },
    { etykieta: "Ciche potrzeby", wartosc: r.kpi.cichePotrzeby },
  ];

  return (
    <div className="space-y-12">
      <div>
        <CentralaNav aktywna="radar" />
        <h1 className="text-4xl font-bold sm:text-5xl">Radar potrzeb</h1>
        <p className="mt-2 max-w-3xl text-lg text-muted">
          Widok tylko dla administratora. Łączy zgłoszenia mieszkańców ze wskaźnikami Obserwatora Statystyk Społecznych ROPS i pokazuje, gdzie rozwiązania brakuje i gdzie ludzie milczą.
          Zgłoszenia w tym widoku to dane demonstracyjne.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpi.map((k) => (
          <li key={k.etykieta} className="karta p-4">
            <p className="font-display text-4xl font-bold">{k.wartosc}</p>
            <p className="text-muted">{k.etykieta}</p>
          </li>
        ))}
      </ul>

      <Kartogram dane={r} />

      <section aria-labelledby="luki-h" className="space-y-4">
        <h2 id="luki-h" className="text-3xl font-bold">Białe plamy: potrzeba jest, rozwiązania nie ma</h2>
        <p className="max-w-3xl text-muted">
          Wynik luki = liczba zgłoszeń z dopasowaniem poniżej 55/100 × (1 − średnie dopasowanie/100). Z każdej luki można zrobić szkic tematu następnego naboru.
        </p>
        {r.luki.length ? <ListaLuk luki={r.luki} /> : <p>Brak białych plam w tym okresie.</p>}
      </section>

      <section aria-labelledby="ciche-h" className="space-y-4">
        <h2 id="ciche-h" className="text-3xl font-bold">Ciche potrzeby: ryzyko wysokie, zgłoszeń mało</h2>
        <p className="max-w-3xl text-muted">
          Powiaty, w których wskaźniki IOSS wskazują podwyższone ryzyko, a zgłoszeń na mieszkańca jest mniej niż połowa średniej regionalnej. Często to wykluczenie cyfrowe, a nie brak potrzeb.
        </p>
        {r.ciche.length === 0 && <p>Brak cichych potrzeb w tym okresie.</p>}
        <ul className="space-y-4">
          {r.ciche.map((c) => (
            <li key={`${c.powiat}-${c.obszar}`} className="space-y-2 rounded-2xl border-4 border-dashed border-accent bg-card p-5">
              <h3 className="text-xl font-bold">{c.powiat.replace("powiat ", "")}: {nazwaObszaru(c.obszar)}</h3>
              <p>
                Ryzyko wg IOSS: <strong>+{c.ryzyko.toLocaleString("pl-PL")}</strong> (odchylenia standardowe powyżej średniej regionu). Zgłoszeń: <strong>{c.zgloszen}</strong> ({c.aktywnosc.toLocaleString("pl-PL")} na 10 tys. mieszkańców wobec {c.stopaRegionu.toLocaleString("pl-PL")} średnio w regionie).
              </p>
              <ul className="list-disc pl-6 text-muted">
                {c.wskazniki.map((w) => (
                  <li key={w.nazwa}>{w.nazwa}: {w.wartosc.toLocaleString("pl-PL")}</li>
                ))}
              </ul>
              <p className="font-semibold">
                Proponowane działanie: uruchom zgłaszanie w trybie asystowanym przez ośrodki pomocy społecznej i kluby seniora w powiecie {c.powiat.replace("powiat ", "")}.
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="trendy-h" className="space-y-4">
        <h2 id="trendy-h" className="text-3xl font-bold">Trendy potrzeb</h2>
        <p className="text-muted">Zgłoszenia tygodniowo w ostatnich 12 tygodniach. Porównanie: ostatnie 4 tygodnie wobec poprzednich 4.</p>
        <ul className="grid gap-3 md:grid-cols-2">
          {[...r.trendy].sort((a, b) => b.ostatnie4 - a.ostatnie4).map((t) => (
            <li key={t.obszar} className="flex flex-wrap items-center justify-between gap-3 karta p-4">
              <div>
                <p className="font-bold">{nazwaObszaru(t.obszar)}</p>
                <p className="flex items-center gap-1 text-sm">
                  {t.zmianaProc !== null && (t.zmianaProc >= 0 ? <ArrowUpRight aria-hidden className="size-4" /> : <ArrowDownRight aria-hidden className="size-4" />)}
                  {t.ostatnie4} wobec {t.poprzednie4}
                  {t.zmianaProc !== null && ` (${t.zmianaProc > 0 ? "+" : ""}${t.zmianaProc}%)`}
                </p>
                {t.nowyTrend && (
                  <p className="inline-flex items-center gap-1 font-bold text-primary">
                    <Flame aria-hidden className="size-4" /> Nowy trend
                  </p>
                )}
              </div>
              <Sparkline wartosci={t.tygodnie} opis={`${nazwaObszaru(t.obszar)}, zgłoszenia tygodniowo: ${t.tygodnie.join(", ")}`} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
