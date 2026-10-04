import { cn } from "@/lib/utils";

export function NaglowekStrony({
  tytul,
  opis,
  nadtytul,
  children,
  className,
}: {
  tytul: string;
  opis?: string;
  nadtytul?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("max-w-3xl space-y-3", className)}>
      {nadtytul && <p className="text-base font-bold text-primary prosty:hidden">{nadtytul}</p>}
      <h1 className="text-[clamp(2rem,1.2rem+2.6vw,3.25rem)] font-bold">{tytul}</h1>
      {opis && <p className="text-xl text-muted">{opis}</p>}
      {children}
    </header>
  );
}
