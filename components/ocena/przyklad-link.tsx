"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** Wypełnia opis w Swatce i od razu uruchamia wyszukiwanie (tekst nie trafia do adresu URL). */
export function PrzykladLink({ tekst, etykieta }: { tekst: string; etykieta: string }) {
  const router = useRouter();
  return (
    <Button type="button" wariant="obrys" onClick={() => {
      try { sessionStorage.setItem("splot_opis", tekst); } catch {}
      router.push("/problem?auto=1");
    }}>
      {etykieta}
    </Button>
  );
}
