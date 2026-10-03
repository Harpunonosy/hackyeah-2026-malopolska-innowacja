import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Bricolage_Grotesque } from "next/font/google";
import { cookies } from "next/headers";
import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { PasekDostepnosci } from "@/components/a11y/pasek-dostepnosci";
import { GlownaNawigacja } from "@/components/glowna-nawigacja";
import { Logo } from "@/components/logo";
import { COOKIE_DOSTEPNOSC, odczytajUstawienia } from "@/lib/dostepnosc";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ["latin", "latin-ext"],
  variable: "--font-atkinson",
  display: "swap",
});
const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Splot – cyfrowe serce HubMI", template: "%s · Splot" },
  description:
    "Splot łączy potrzeby mieszkańców z innowacjami społecznymi Małopolski. Prototyp dla Małopolskiego Hubu Innowacji Społecznych (ROPS Kraków).",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#14213D" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = await getTranslations();
  const ustawienia = odczytajUstawienia((await cookies()).get(COOKIE_DOSTEPNOSC)?.value);

  return (
    <html
      lang={locale}
      data-prosty={ustawienia.prosty ? "tak" : "nie"}
      data-rozmiar={ustawienia.rozmiar}
      data-kontrast={ustawienia.kontrast}
      className={`${atkinson.variable} ${bricolage.variable}`}
    >
      <body className="flex flex-col">
        <NextIntlClientProvider>
          <a
            href="#tresc"
            className="sr-only z-50 rounded-lg bg-fg px-4 py-3 font-semibold text-bg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            {t("nav.przejdzDoTresci")}
          </a>
          <PasekDostepnosci poczatkowe={ustawienia} />
          <header className="nie-drukuj border-b border-line-soft bg-bg">
            <div className="kontener flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
              <Link href="/" className="flex items-center gap-3 text-fg no-underline">
                <Logo className="size-11 text-fg" />
                <span>
                  <span className="block font-display text-2xl font-bold leading-none">{t("marka.nazwa")}</span>
                  
                </span>
              </Link>
              <GlownaNawigacja
                etykieta={t("nav.glowna")}
                linki={[
                  { href: "/", etykieta: t("nav.start") },
                  { href: "/wiedza/biblioteka", etykieta: t("nav.wiedza") },
                  { href: "/galeria", etykieta: t("nav.galeria") },
                  { href: "/moje", etykieta: t("nav.moje") },
                ]}
              />
            </div>
          </header>
          <main id="tresc" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <footer className="nie-drukuj mt-20 bg-hero text-hero-fg">
            <div className="kontener flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-8">
              <p className="flex items-center gap-3 font-display text-2xl font-bold">
                <Logo className="size-9 text-hero-fg" />
                {t("marka.nazwa")}
              </p>
              <p className="max-w-xl">{t("stopka.ai")}</p>
              <Link href="/centrala" className="inline-flex min-h-12 items-center font-semibold text-hero-fg">{t("stopka.centrala")}</Link>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
