import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BookOpen, BookOpenText, Building2, ClipboardList, FlaskConical, HandHeart, Lightbulb, MessagesSquare, Mic } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { JakToDziala } from "@/components/home/jak-to-dziala";
import { PoleOpisu } from "@/components/home/pole-opisu";

// W trybie prostym widać tylko kafelki mieszkańca; pozostałe są pod „Więcej możliwości”.
const KAFELKI: { klucz: string; ikona: LucideIcon; href: string; mieszkaniec?: boolean }[] = [
  { klucz: "wiedza", ikona: BookOpen, href: "/wiedza/biblioteka", mieszkaniec: true },
  { klucz: "moje", ikona: ClipboardList, href: "/moje", mieszkaniec: true },
  { klucz: "pomysl", ikona: Lightbulb, href: "/pomysl" },
  { klucz: "testy", ikona: FlaskConical, href: "/testy" },
  { klucz: "instytucja", ikona: Building2, href: "/wdrozenie" },
  { klucz: "rozmowa", ikona: MessagesSquare, href: "/rynek", mieszkaniec: true },
];

// „Pomagam innej osobie” jest dla pracowników i opiekunów, więc w trybie prostym go nie pokazujemy.
const INNE_SPOSOBY: { klucz: string; ikona: LucideIcon; href: string; tylkoPelny?: boolean }[] = [
  { klucz: "pomocGlos", ikona: Mic, href: "/rozmowa" },
  { klucz: "pomocLatwy", ikona: BookOpenText, href: "/latwy" },
  { klucz: "pomocOsoba", ikona: HandHeart, href: "/asystowane", tylkoPelny: true },
];

export default async function Start() {
  const t = await getTranslations("start");
  return (
    <>
      <section className="kontener grid items-start gap-10 py-10 sm:py-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14 lg:py-14 prosty:lg:grid-cols-[minmax(0,48rem)]">
        <div className="space-y-7">
          <h1 className="text-balance text-[clamp(2.5rem,1.4rem+3.6vw,4rem)] font-extrabold leading-[1.05] tracking-tight">{t("hero.tytul")}</h1>
          <p className="max-w-xl text-balance text-xl sm:text-2xl">{t("hero.opis")}</p>
          <PoleOpisu />
          <nav aria-labelledby="inne-sposoby" className="space-y-2">
            <p id="inne-sposoby" className="font-semibold">{t("inneSposoby")}</p>
            <ul className="flex flex-wrap gap-2">
              {INNE_SPOSOBY.map(({ klucz, ikona: Ikona, href, tylkoPelny }) => (
                <li key={klucz} className={tylkoPelny ? "prosty:hidden" : undefined}>
                  <Link
                    href={href}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-fg bg-card px-4 font-semibold text-fg no-underline hover:bg-fg hover:text-bg"
                  >
                    <Ikona aria-hidden className="size-5" />
                    {t(klucz)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="lg:pt-40 prosty:hidden">
          <JakToDziala />
        </div>
      </section>

      <section className="kontener space-y-6 pb-4 pt-4" aria-labelledby="wybierz-h">
        <h2 id="wybierz-h" className="text-3xl font-extrabold sm:text-4xl">{t("wybierz")}</h2>
        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {KAFELKI.map(({ klucz, ikona: Ikona, href, mieszkaniec }) => (
            <li key={klucz} className={mieszkaniec ? "flex" : "flex prosty:hidden"}>
              <Link
                href={href}
                className="karta group flex w-full items-center gap-3 p-4 text-fg no-underline transition-colors hover:border-fg sm:gap-4 sm:p-5"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-fg sm:size-14 sm:rounded-2xl">
                  <Ikona aria-hidden className="size-6 sm:size-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl font-bold leading-tight sm:text-[1.375rem]">{t(`kafelki.${klucz}.tytul`)}</span>
                  <span className="mt-1 block text-lg leading-snug text-muted">{t(`kafelki.${klucz}.opis`)}</span>
                </span>
                <ArrowRight aria-hidden className="size-5 shrink-0 sm:size-6 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
        <details className="karta-mala hidden prosty:block">
          <summary className="flex min-h-14 cursor-pointer items-center px-5 text-xl font-bold">{t("wiecej")}</summary>
          <ul className="space-y-2 border-t border-line-soft p-5">
            {KAFELKI.filter((k) => !k.mieszkaniec).map(({ klucz, ikona: Ikona, href }) => (
              <li key={klucz}>
                <Link href={href} className="inline-flex min-h-12 items-center gap-3 text-lg font-semibold">
                  <Ikona aria-hidden className="size-6 shrink-0 text-primary" />
                  {t(`kafelki.${klucz}.tytul`)}: {t(`kafelki.${klucz}.opis`)}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </>
  );
}
