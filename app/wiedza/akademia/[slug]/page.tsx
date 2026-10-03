import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Lekcja } from "@/components/akademia/lekcja";
import { NaglowekStrony } from "@/components/naglowek-strony";
import { Strona } from "@/components/strona";
import akademia from "@/data/akademia.json";

export const metadata: Metadata = { title: "Akademia Splotu: lekcja" };

export default async function Page(props: PageProps<"/wiedza/akademia/[slug]">) {
  const { slug } = await props.params;
  const l = akademia.lekcje.find((x) => x.slug === slug);
  if (!l) notFound();
  return (
    <Strona>
      <p><Link href="/wiedza/akademia">← Akademia</Link></p>
      <NaglowekStrony nadtytul={`Lekcja, ${l.minuty} min`} tytul={l.tytul} />
      <Lekcja akapity={l.akapity} latwe={l.latwe} quiz={l.quiz} />
      <section aria-labelledby="zr-h" className="max-w-3xl space-y-2">
        <h2 id="zr-h" className="text-xl font-bold">Źródła</h2>
        <ul>{l.zrodla.map((z) => <li key={z.url}>{z.url.startsWith("http") ? <a href={z.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold">{z.nazwa}<ExternalLink aria-hidden className="size-4" /></a> : <Link href={z.url} className="font-semibold">{z.nazwa}</Link>}</li>)}</ul>
        <p className="text-sm text-muted">Streszczenie przygotowane przez zespół Splotu na podstawie dokumentów ROPS Kraków.</p>
      </section>
    </Strona>
  );
}
