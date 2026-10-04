// Znak "Splot": dwie nici tworzą serce i krzyżują się pod nim jak węzeł.
// U góry czerwona nić leży na wierzchu, u dołu granatowa: prawdziwy przeplot.
// Przerwę przy skrzyżowaniu maluje kolor tła (--logo-tlo), więc znak działa na jasnym i ciemnym tle.
const LEWA = "M33 45C27.5 40.5 9.5 30 7.5 20C6 12 11 7 16.5 7c4 0 7 2.5 7.5 7.5";
const PRAWA = "M15 45c5.5-4.5 23.5-15 25.5-25C42 12 37 7 31.5 7c-4 0-7 2.5-7.5 7.5";

export function Logo({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5">
      <path d={PRAWA} stroke="var(--logo-nic)" />
      <path d={LEWA} stroke="var(--logo-tlo, var(--bg))" strokeWidth="8.5" />
      <path d={LEWA} stroke="currentColor" />
      <path d="M24 14.5c.5-5 3.5-7.5 7.5-7.5" stroke="var(--logo-nic)" />
    </svg>
  );
}
