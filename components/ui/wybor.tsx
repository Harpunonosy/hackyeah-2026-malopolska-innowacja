/** Wybór jednej opcji jako duże przyciski radio zamiast listy rozwijanej (łatwiejsze dla seniorów, PLAN 10.1). */
export function Wybor<T extends string>({ nazwa, legenda, opcje, wartosc, zmien, malaLegenda, klasaLegendy }: { nazwa: string; legenda: string; opcje: [T, string][]; wartosc: T; zmien: (v: T) => void; malaLegenda?: boolean; klasaLegendy?: string }) {
  return (
    <fieldset className="space-y-2">
      <legend className={klasaLegendy ?? (malaLegenda ? "font-bold" : "text-lg font-bold")}>{legenda}</legend>
      <div className="flex flex-wrap gap-2">
        {opcje.map(([v, e]) => (
          <label key={v} className="flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 border-line-soft bg-card px-4 py-1 hover:border-fg has-[:checked]:border-fg has-[:checked]:bg-accent has-[:checked]:text-accent-fg has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2">
            <input type="radio" name={nazwa} checked={wartosc === v} onChange={() => zmien(v)} className="size-4 shrink-0 accent-current" />
            {e}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
