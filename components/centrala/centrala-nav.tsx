import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";

type Aktywna = "skrzynka" | "pomysly" | "nabory" | "tresci" | "radar" | "powiadomienia" | "integracje" | "puls" | "akademia" | "dane";

async function liczniki() {
  try {
    const [z, f, p] = await Promise.all([
      db().query("select count(*)::int as n from zgloszenia where status = 'wyslane'"),
      db().query("select count(*)::int as n from fiszki where status = 'zgloszona'"),
      db().query("select count(*)::int as n from powiadomienia where adresat='rops' and przeczytane_at is null"),
    ]);
    return { zgloszenia: z.rows[0].n as number, fiszki: f.rows[0].n as number, powiadomienia: p.rows[0].n as number };
  } catch {
    return { zgloszenia: 0, fiszki: 0, powiadomienia: 0 };
  }
}

export async function CentralaNav({ aktywna }: { aktywna: Aktywna }) {
  const n = await liczniki();
  const t = await getTranslations("centralaNav");
  const linki = [
    { id: "skrzynka", href: "/centrala/zgloszenia", etykieta: t("skrzynka"), licznik: n.zgloszenia },
    { id: "pomysly", href: "/centrala/pomysly", etykieta: t("pomysly"), licznik: n.fiszki },
    { id: "nabory", href: "/centrala/nabory", etykieta: t("nabory"), licznik: 0 },
    { id: "tresci", href: "/centrala/tresci", etykieta: t("tresci"), licznik: 0 },
    { id: "akademia", href: "/centrala/akademia", etykieta: t("akademia"), licznik: 0 },
    { id: "dane", href: "/centrala/dane", etykieta: t("dane"), licznik: 0 },
    { id: "radar", href: "/centrala/radar", etykieta: t("radar"), licznik: 0 },
    { id: "puls", href: "/centrala/puls", etykieta: t("puls"), licznik: 0 },
    { id: "powiadomienia", href: "/centrala/powiadomienia", etykieta: t("powiadomienia"), licznik: n.powiadomienia },
    { id: "integracje", href: "/centrala/integracje", etykieta: t("integracje"), licznik: 0 },
  ] as const;
  return (
    <nav aria-label={t("etykieta")} className="mb-6 flex flex-wrap gap-2 border-b-2 border-line-soft pb-4">
      {linki.map((l) => (
        <Link
          key={l.id}
          href={l.href}
          aria-current={aktywna === l.id ? "page" : undefined}
          className={`inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-fg px-5 font-semibold no-underline ${aktywna === l.id ? "bg-fg text-bg" : "text-fg hover:bg-fg hover:text-bg"}`}
        >
          {l.etykieta}
          {l.licznik > 0 && (
            <span className="rounded-full bg-primary px-2 text-sm font-bold text-primary-fg">
              {l.licznik}<span className="sr-only"> {t("nowych")}</span>
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
