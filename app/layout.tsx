import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next, Bricolage_Grotesque } from "next/font/google";
import { cookies } from "next/headers";
import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { PasekDostepnosci } from "@/components/a11y/pasek-dostepnosci";
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
          <header className="border-b-2 border-line">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <Link href="/" className="flex items-center gap-3 text-fg no-underline">
                <Logo className="size-11 text-fg" />
                <span>
                  <span className="block font-display text-2xl font-bold leading-none">{t("marka.nazwa")}</span>
                  <span className="zaawansowane hidden text-sm text-muted sm:block">cyfrowe serce HubMI</span>
                </span>
              </Link>
              <nav aria-label={t("nav.glowna")}>
                <ul className="flex flex-wrap gap-1">
                  {[
                    { href: "/", etykieta: t("nav.start") },
                    { href: "/problem", etykieta: t("nav.problem") },
                    { href: "/wiedza/biblioteka", etykieta: t("nav.wiedza") },
                    { href: "/moje", etykieta: t("nav.moje") },
                  ].map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="inline-flex min-h-12 items-center rounded-lg px-4 font-semibold text-fg hover:bg-fg hover:text-bg"
                      >
                        {l.etykieta}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </header>
          <main id="tresc" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none sm:px-6">
            {children}
          </main>
          <footer className="nie-drukuj mt-8 border-t-2 border-line bg-card">
            <div className="mx-auto max-w-6xl space-y-1 px-4 py-6 text-sm text-muted sm:px-6">
              <p>{t("stopka.ai")}</p>
              <p>{t("stopka.zrodlo")}</p>
              <p>{t("stopka.dane")}</p>
              <p><Link href="/centrala">Panel dla pracowników ROPS (Centrala)</Link></p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
