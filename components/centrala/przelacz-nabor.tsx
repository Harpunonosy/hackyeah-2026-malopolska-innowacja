"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PrzelaczNabor({ id, aktywny }: { id: string; aktywny: boolean }) {
  const router = useRouter();
  return (
    <Button type="button" wariant={aktywny ? "obrys" : "glowny"} onClick={async () => {
      await fetch(`/api/admin/nabory/${id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ aktywny: !aktywny }) });
      router.refresh();
    }}>
      {aktywny ? "Zamknij nabór" : "Otwórz nabór"}
    </Button>
  );
}
