import Link from "next/link";

export function CentralaNav({ aktywna }: { aktywna: "skrzynka" | "radar" }) {
  const linki = [
    { id: "skrzynka", href: "/centrala/zgloszenia", etykieta: "Skrzynka zgłoszeń" },
    { id: "radar", href: "/centrala/radar", etykieta: "Radar potrzeb" },
  ] as const;
  return (
    <nav aria-label="Centrala" className="mb-6 flex flex-wrap gap-2 border-b-2 border-line pb-4">
      {linki.map((l) => (
        <Link
          key={l.id}
          href={l.href}
          aria-current={aktywna === l.id ? "page" : undefined}
          className={`inline-flex min-h-12 items-center rounded-lg border-2 border-fg px-4 font-semibold no-underline ${aktywna === l.id ? "bg-fg text-bg" : "text-fg hover:bg-fg hover:text-bg"}`}
        >
          {l.etykieta}
        </Link>
      ))}
    </nav>
  );
}
