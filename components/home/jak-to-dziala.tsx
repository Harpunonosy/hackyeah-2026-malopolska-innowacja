import { getTranslations } from "next-intl/server";

// Trzy kroki połączone dwiema nićmi (czerwoną i złotą), które splatają się na numerach kroków.
export async function JakToDziala() {
  const t = await getTranslations("start.jak");
  return (
    <section aria-labelledby="jak-h" className="rounded-[1.75rem] border border-line-soft bg-soft p-6 sm:p-8">
      <h2 id="jak-h" className="text-2xl font-bold sm:text-3xl">{t("tytul")}</h2>
      <div className="relative mt-6">
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 48 200"
          preserveAspectRatio="none"
          fill="none"
          strokeLinecap="round"
          className="nic-rysuj absolute bottom-6 left-0 top-6 h-[calc(100%-3rem)] w-12"
        >
          <path d="M24 0C42 33 6 67 24 100s-18 67 0 100" stroke="var(--nic-zlota)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <path d="M24 0C6 33 42 67 24 100s18 67 0 100" stroke="var(--logo-nic)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        </svg>
        <ol className="relative space-y-7">
          {(["k1", "k2", "k3"] as const).map((k, i) => (
            <li key={k} className="relative flex gap-4">
              <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-fg bg-card font-display text-xl font-bold">
                {i + 1}
              </span>
              <div className="pt-1.5">
                <h3 className="text-xl font-bold">{t(`${k}.tytul`)}</h3>
                <p className="mt-1 text-lg text-muted">{t(`${k}.opis`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
