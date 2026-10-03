import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { COOKIE_JEZYK } from "@/lib/dostepnosc";

export const JEZYKI = ["pl", "uk", "en"] as const;
export type Jezyk = (typeof JEZYKI)[number];

export default getRequestConfig(async () => {
  const z = (await cookies()).get(COOKIE_JEZYK)?.value;
  const locale: Jezyk = (JEZYKI as readonly string[]).includes(z ?? "") ? (z as Jezyk) : "pl";
  return { locale, messages: (await import(`../messages/${locale}.json`)).default };
});
