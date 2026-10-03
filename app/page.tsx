import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { JakWolisz } from "@/components/a11y/jak-wolisz";
import { PoleOpisu } from "@/components/home/pole-opisu";
import { Logo } from "@/components/logo";

export default async function Start() {
  const t = await getTranslations("start");
  const pokazWybor = !(await cookies()).get("splot_a11y_wybor");
  return (
    <>
      {pokazWybor && <JakWolisz />}
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

    </>
  );
}
