import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BookOpen, Building2, ClipboardList, FlaskConical, Lightbulb, MessagesSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PoleOpisu } from "@/components/home/pole-opisu";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const KAFELKI: { klucz: string; ikona: LucideIcon; href?: string }[] = [
  { klucz: "wiedza", ikona: BookOpen, href: "/wiedza/biblioteka" },
  { klucz: "moje", ikona: ClipboardList, href: "/moje" },
  { klucz: "pomysl", ikona: Lightbulb, href: "/pomysl" },
  { klucz: "testy", ikona: FlaskConical, href: "/testy" },
  { klucz: "instytucja", ikona: Building2, href: "/wdrozenie" },
  { klucz: "rozmowa", ikona: MessagesSquare, href: "/rynek" },
];

export default async function Start() {
  const t = await getTranslations("start");
  return (
    <>
      <section className="kontener grid items-center gap-12 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
        <div className="space-y-7">
          <h1 className="text-balance text-[clamp(2.5rem,1.4rem+3.6vw,4.25rem)] font-extrabold leading-[1.05]">{t("hero.tytul")}</h1>
          <p className="max-w-xl text-balance text-xl text-muted sm:text-2xl">{t("hero.opis")}</p>
          <PoleOpisu />
        </div>

        <div aria-hidden="true" className="relative mx-auto hidden aspect-square w-full max-w-lg lg:block">
          <div className="absolute inset-[6%] rounded-full bg-soft" />
          <div className="absolute inset-0 rounded-full border-[3px] border-dotted border-accent" />
          <Logo className="absolute left-1/2 top-[44%] size-[62%] -translate-x-1/2 -translate-y-1/2 text-fg" />
        </div>
      </section>

      <section className="kontener space-y-7 pb-4" aria-labelledby="wybierz-h">
        <h2 id="wybierz-h" className="text-3xl font-extrabold sm:text-4xl">{t("wybierz")}</h2>
        <ul className="grid auto-rows-fr gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {KAFELKI.map(({ klucz, ikona: Ikona, href }) => {
            const wnetrze = (
              <>
                <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl sm:size-[4.5rem] sm:rounded-[1.25rem]", href ? "bg-primary text-primary-fg" : "bg-soft text-fg")}>
                  <Ikona aria-hidden className="size-8" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-2xl font-bold leading-tight">{t(`kafelki.${klucz}.tytul`)}</span>
                  <span className="mt-1 block text-lg text-muted">{t(`kafelki.${klucz}.opis`)}</span>
                  {!href && <span className="mt-2 inline-block rounded-full bg-soft px-3 py-0.5 text-sm font-bold text-muted">{t("wkrotce")}</span>}
                </span>
                {href && <ArrowRight aria-hidden className="size-6 shrink-0 text-primary" />}
              </>
            );
            return (
              <li key={klucz} className="flex">
                {href ? (
                  <Link href={href} className="karta flex w-full items-center gap-4 p-5 sm:gap-5 sm:p-6 text-fg no-underline transition-transform hover:-translate-y-0.5">
                    {wnetrze}
                  </Link>
                ) : (
                  <div className="flex w-full items-center gap-4 rounded-[1.25rem] border-2 border-line-soft p-5 sm:gap-5 sm:p-6">{wnetrze}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
