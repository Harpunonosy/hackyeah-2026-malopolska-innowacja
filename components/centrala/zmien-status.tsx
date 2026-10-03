"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ETYKIETY_STATUSOW, type Status } from "@/lib/statusy";

const RUCHY: Status[] = ["w_analizie", "u_eksperta", "potrzebne_info", "zamkniete"];

export function ZmienStatus({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  return (
    <div role="group" aria-label="Zmień status" className="flex flex-wrap gap-2">
      {RUCHY.map((s) => (
        <Button
          key={s}
          type="button"
          wariant="obrys"
          aria-pressed={status === s}
          onClick={async () => {
            await fetch(`/api/admin/zgloszenia/${id}/status`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: s }) });
            router.refresh();
          }}
        >
          {ETYKIETY_STATUSOW[s].etykieta}
        </Button>
      ))}
    </div>
  );
}
