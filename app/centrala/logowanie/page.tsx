import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logowanie } from "@/components/centrala/logowanie";
import { czyAdmin } from "@/lib/sesja";

export const metadata: Metadata = { title: "Centrala: logowanie" };

export default async function Page() {
  if (await czyAdmin()) redirect("/centrala/zgloszenia");
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Centrala ROPS</h1>
      <p className="max-w-2xl text-lg text-muted">
        Panel dla pracowników ROPS. W wersji demonstracyjnej wejście chroni hasło. Docelowo logowanie przez login.gov.pl.
      </p>
      <Logowanie />
    </div>
  );
}
