import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BookOpen, ClipboardList, FlaskConical, HandHeart, Lightbulb, MessagesSquare, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Kafelek = { klucz: string; ikona: LucideIcon; href?: string };

const KAFELKI: Kafelek[] = [
  { klucz: "problem", ikona: HandHeart, href: "/problem" },
  { klucz: "instytucja", ikona: Building2 },
  { klucz: "pomysl", ikona: Lightbulb },
  { klucz: "testy", ikona: FlaskConical },
  { klucz: "wiedza", ikona: BookOpen, href: "/wiedza/biblioteka" },
  { klucz: "rozmowa", ikona: MessagesSquare },
  { klucz: "moje", ikona: ClipboardList, href: "/moje" },
];

export default async function Start() {
  const t = await getTranslations("start");
  return (
    <div className="space-y-8">
      <div className="max-w-3xl space-y-3">
        <h1 className="text-4xl font-bold sm:text-5xl">{t("tytul")}</h1>
        <p className="text-xl text-muted">{t("podtytul")}</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {KAFELKI.map(({ klucz, ikona: Ikona, href }) => {
          const tresc = (
            <>
              <Ikona aria-hidden className="size-9 shrink-0" />
              <span className="space-y-1">
                <span className="block font-display text-xl font-bold">{t(`kafelki.${klucz}.tytul`)}</span>
                <span className="block text-base">{t(`kafelki.${klucz}.opis`)}</span>
                {!href && <span className="mt-1 inline-block rounded-full border-2 border-line px-3 text-sm font-semibold">{t("wkrotce")}</span>}
              </span>
            </>
          );
          const klasy = "flex min-h-32 items-start gap-4 rounded-2xl border-2 p-5 no-underline";
          return (
            <li key={klucz}>
              {href ? (
                <Link href={href} className={cn(klasy, "border-fg bg-card text-fg hover:bg-fg hover:text-bg")}>
                  {tresc}
                </Link>
              ) : (
                <div className={cn(klasy, "border-dashed border-line bg-transparent text-muted")}>{tresc}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
