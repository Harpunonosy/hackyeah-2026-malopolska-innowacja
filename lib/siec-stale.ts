// Stałe sieci liderów bez zależności serwerowych (używane też w komponentach klienckich).
export const SEKTORY = ["ngo", "samorzad", "nauka", "biznes", "es", "grupa"] as const;
export type Sektor = (typeof SEKTORY)[number];

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
/** Identyfikator lidera-autora z Biblioteki (kotwica na stronie /siec). */
export const idAutora = (nazwa: string) => `b-${slug(nazwa.trim())}`;
