export type RozmiarTekstu = "normalny" | "duzy" | "bardzo-duzy";
export type Kontrast = "normalny" | "wysoki";
export type UstawieniaDostepnosci = { prosty: boolean; rozmiar: RozmiarTekstu; kontrast: Kontrast };

export const COOKIE_DOSTEPNOSC = "splot_a11y";
export const COOKIE_JEZYK = "splot_lang";

export const DOMYSLNE_USTAWIENIA: UstawieniaDostepnosci = { prosty: false, rozmiar: "normalny", kontrast: "normalny" };

export function odczytajUstawienia(surowe: string | undefined): UstawieniaDostepnosci {
  if (!surowe) return DOMYSLNE_USTAWIENIA;
  try {
    const j = JSON.parse(surowe) as Partial<UstawieniaDostepnosci>;
    return {
      prosty: j.prosty === true,
      rozmiar: j.rozmiar === "duzy" || j.rozmiar === "bardzo-duzy" ? j.rozmiar : "normalny",
      kontrast: j.kontrast === "wysoki" ? "wysoki" : "normalny",
    };
  } catch {
    return DOMYSLNE_USTAWIENIA;
  }
}
