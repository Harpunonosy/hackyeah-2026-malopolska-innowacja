// Pola formularza naboru IWS 2.0 (1-11), z data/nabory_rops.json. Pole 12 (oświadczenia) składa wnioskodawca.
export const POLA_IWS = [
 {
  "nr": 1,
  "pole": "Tytuł innowacji",
  "podpowiedz": "Krótki i kojarzący się z przedmiotem innowacji."
 },
 {
  "nr": 2,
  "pole": "Dane pomysłodawcy",
  "podpowiedz": "Osoba fizyczna / podmiot (KRS, REGON, NIP, reprezentant, osoba do kontaktu) / grupa nieformalna (do 5 partnerów + reprezentant)."
 },
 {
  "nr": 3,
  "pole": "Opis innowacji",
  "podpowiedz": "Na czym polega? Jaki ma charakter (produkt, aplikacja, model pracy, rozwiązanie technologiczne)? Jak realizuje cel: włączenie społeczne / przeciwdziałanie wykluczeniu? Jak wpisuje się w ideę deinstytucjonalizacji?"
 },
 {
  "nr": 4,
  "pole": "Innowacyjność rozwiązania",
  "podpowiedz": "Czy podobne rozwiązania są stosowane w Polsce lub na świecie? Jaką nową wartość wnosi? Czym się wyróżnia?"
 },
 {
  "nr": 5,
  "pole": "Diagnoza problemu",
  "podpowiedz": "Na jaki problem odpowiada? Dane statystyczne o skali problemu, podstawy diagnozy (raporty, badania). Czy problem jest zgodny z Mapą Wyzwań Społecznych, a jeśli tak, to z jakim tematem?"
 },
 {
  "nr": 6,
  "pole": "Opis odbiorców innowacji",
  "podpowiedz": "Do kogo jest skierowana? Co wyróżnia tę grupę? Jakie ma potrzeby? Dlaczego są to osoby wykluczone lub zagrożone wykluczeniem?"
 },
 {
  "nr": 7,
  "pole": "Zmiana, jaką wprowadza innowacja",
  "podpowiedz": "Jak wpłynie na problem? Co zmieni w życiu odbiorców? Jak wpłynie na ich włączenie społeczne?"
 },
 {
  "nr": 8,
  "pole": "Wizja przyszłości innowacji",
  "podpowiedz": "Potencjał zastosowania na dużą skalę, rozszerzenie na inne grupy, konteksty i miejsca. Łatwość stosowania i wdrażalność."
 },
 {
  "nr": 9,
  "pole": "Plan działania i koszty",
  "podpowiedz": "Okres przygotowawczy (max 3 mies.): działanie, termin, koszt. Okres testowania (max 9 mies., faza I i II): jak przebiega test, kogo zaangażować, ile osób testuje, jak uzyskać wiarygodne wyniki."
 },
 {
  "nr": 10,
  "pole": "Wnioskowana kwota grantu",
  "podpowiedz": "Całościowa kwota, zgodna z kosztami z planu działania."
 },
 {
  "nr": 11,
  "pole": "Zespół projektowy i jego doświadczenie",
  "podpowiedz": "Kto odpowiada za realizację? Doświadczenie w pracy z odbiorcami, planowaniu i wdrażaniu innowacji społecznych."
 }
] as const;
