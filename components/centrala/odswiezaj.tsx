"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

/** Odświeża stronę co kilka sekund, dopóki serwer nie przestanie jej renderować (np. do końca oceny AI). Limit: 3 minuty. */
export function Odswiezaj({ co = 4000, children }: { co?: number; children: React.ReactNode }) {
  const router = useRouter();
  React.useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      if (Date.now() - start > 180_000) return clearInterval(id);
      router.refresh();
    }, co);
    return () => clearInterval(id);
  }, [co, router]);
  return <p role="status" className="flex items-center gap-2"><span aria-hidden className="size-3 animate-pulse rounded-full bg-primary" />{children}</p>;
}
