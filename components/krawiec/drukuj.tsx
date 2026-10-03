"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Drukuj({ etykieta }: { etykieta: string }) {
  return (
    <Button type="button" wariant="obrys" onClick={() => window.print()}>
      <Printer aria-hidden className="size-5" />
      {etykieta}
    </Button>
  );
}
