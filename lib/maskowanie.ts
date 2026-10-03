// Maskowanie danych osobowych PRZED wysłaniem tekstu do modelu AI i przed zapisem.
// Regex łapie dane o stałym formacie. Imiona i nazwiska w zgłoszeniach zapisywanych w bazie
// dodatkowo czyści osobny krok AI (patrz PLAN.md, rozdz. 14 i 15).
export type WynikMaskowania = { tekst: string; zamaskowano: string[] };

const IMIONA = "Kub|Zosi|Basi|Gosi|Tomk|Piotrk|Krzysi|Staszk|Janek|Jank|Asi|Magd|Wojtk|Marcel|Mari|Przemysław|Mieczysław|Aleksander|Aleksandr|Eugeniusz|Kazimierz|Sebastian|Stanisław|Małgorzat|Krzysztof|Władysław|Agnieszk|Waldemar|Magdalen|Grzegorz|Jarosław|Swietłan|Francisz|Katarzyn|Mirosław|Bolesław|Zbigniew|Radosław|Wojciech|Bernadet|Dariusz|Mateusz|Zygmunt|Bartosz|Tadeusz|Czesław|Andrzej|Weronik|Mariann|Wiesław|Mariusz|Ryszard|Gabriel|Elżbiet|Genowef|Krystyn|Wiktor|Maciej|Szymon|Cezary|Łukasz|Stefan|Jadwig|Justyn|Kornel|Henryk|Tomasz|Bogdan|Witold|Izabel|Urszul|Patryk|Leokad|Edward|Janusz|Barbar|Robert|Jolant|Antoni|Zuzann|Adrian|Marcin|Grażyn|Józef|Danut|Zenon|Renat|Karol|Dawid|Jakub|Piotr|Joann|Monik|Celin|Filip|Janin|Lucyn|Kamil|Jerzy|Helen|Teres|Halin|Natal|Paweł|Alicj|Roman|Bożen|Oksan|Dorot|Lesz|King|Beat|Mart|Olga|Lech|Sylw|Mich|Adam|Ania|Alin|Olen|Iren|Iwon|Anna|Wand|Agat|Edyt|Hann|Iryn|Kas|Jan|Jul|Raf|Zof|Jac|Ewa|Mar";

const REGULY: { rodzaj: string; re: RegExp; zamiennik: string }[] = [
  { rodzaj: "e-mail", re: /[\p{L}0-9._%+-]+@[\p{L}0-9.-]+\.\p{L}{2,}/gu, zamiennik: "[e-mail]" },
  { rodzaj: "numer konta", re: /\b(?:PL\s?)?\d{2}(?:\s?\d{4}){6}\b/gi, zamiennik: "[numer konta]" },
  { rodzaj: "PESEL", re: /(?<!\d)\d{11}(?!\d)/g, zamiennik: "[PESEL]" },
  {
    rodzaj: "telefon",
    re: /(?<!\d)(?:\+?48[\s-]?)?(?:\d{3}[\s-]?\d{3}[\s-]?\d{3}|\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2})(?!\d)/g,
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
    re: /(?:nazywam się|mam na imię|moje imię to|moje nazwisko to|nazywa się|na imię mu|na imię jej|na imię ma)\s+\p{Lu}[\p{L}-]+(?:\s+\p{Lu}[\p{L}-]+)?/giu,
    zamiennik: "[imię i nazwisko]",
  },
  {
    rodzaj: "imię i nazwisko",
    re: new RegExp(`(?<![\\p{L}])(?:${IMIONA})[\\p{Ll}]{0,4}\\s+\\p{Lu}[\\p{Ll}-]{2,}(?:-\\p{Lu}[\\p{Ll}]+)?`, "gu"),
    zamiennik: "[imię i nazwisko]",
  },
  {
    rodzaj: "imię",
    re: new RegExp(`(?<=\\b(?:córk|syn|mam|tat|żon|mąż|mężu|brat|siostr|babci|dziadk|wnuczk|wnuk|sąsiad|koleżank|kolega|znajom|opiekuję się|opiekuje się)[\\p{Ll}]{0,6}[\\s,]+)(?:${IMIONA})[\\p{Ll}]{0,4}(?![\\p{L}])`, "gu"),
    zamiennik: "[imię]",
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
