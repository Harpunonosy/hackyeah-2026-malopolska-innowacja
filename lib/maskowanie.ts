// Maskowanie danych osobowych PRZED wysłaniem tekstu do modelu AI i przed zapisem.
// Regex łapie dane o stałym formacie. Imiona i nazwiska w zgłoszeniach zapisywanych w bazie
// dodatkowo czyści osobny krok AI (patrz PLAN.md, rozdz. 14 i 15).
export type WynikMaskowania = { tekst: string; zamaskowano: string[] };

const REGULY: { rodzaj: string; re: RegExp; zamiennik: string }[] = [
  { rodzaj: "e-mail", re: /[\p{L}0-9._%+-]+@[\p{L}0-9.-]+\.\p{L}{2,}/gu, zamiennik: "[e-mail]" },
  { rodzaj: "numer konta", re: /\b(?:PL\s?)?\d{2}(?:\s?\d{4}){6}\b/gi, zamiennik: "[numer konta]" },
  { rodzaj: "PESEL", re: /(?<!\d)\d{11}(?!\d)/g, zamiennik: "[PESEL]" },
  {
    rodzaj: "telefon",
    re: /(?<![\d.])(?:\+?48[\s-]?)?(?:\d{3}[\s-]?\d{3}[\s-]?\d{3}|\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2})(?![\d.])/g,
    zamiennik: "[telefon]",
  },
  { rodzaj: "numer dokumentu", re: /\b[A-Z]{3}\s?\d{6}\b/g, zamiennik: "[numer dokumentu]" },
  { rodzaj: "kod pocztowy", re: /\b\d{2}-\d{3}\b/g, zamiennik: "[kod pocztowy]" },
  {
    rodzaj: "adres",
    re: /\b(?:ul\.|ulica|al\.|aleja|pl\.|plac|os\.|osiedle)\s+[\p{L}0-9.\- ]{2,40}?\s\d+[a-zA-Z]?(?:\/\d+[a-zA-Z]?)?/giu,
    zamiennik: "[adres]",
  },
  {
    rodzaj: "imię i nazwisko",
    re: /(?:nazywam się|mam na imię|moje imię to|moje nazwisko to|nazywa się)\s+\p{Lu}[\p{L}-]+(?:\s+\p{Lu}[\p{L}-]+)?/gu,
    zamiennik: "[imię i nazwisko]",
  },
];

export function zamaskuj(wejscie: string): WynikMaskowania {
  let tekst = wejscie;
  const zamaskowano: string[] = [];
  for (const { rodzaj, re, zamiennik } of REGULY) {
    tekst = tekst.replace(re, () => {
      if (!zamaskowano.includes(rodzaj)) zamaskowano.push(rodzaj);
      return zamiennik;
    });
  }
  return { tekst, zamaskowano };
}
