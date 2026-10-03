"use client";

import * as React from "react";
import { Play, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

export function idFilmu(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    return u.searchParams.get("v");
  } catch {
    return null;
  }
}

/** Film ROPS bez śledzenia: odtwarzacz youtube-nocookie ładuje się dopiero po kliknięciu. Zawsze jest też link do filmu. */
export function Film({ url, tytul, etykieta }: { url: string; tytul: string; etykieta: string }) {
  const [wlaczony, setWlaczony] = React.useState(false);
  const id = idFilmu(url);
  if (!id) {
    return (
      <Button asChild wariant="obrys" className="w-full"><a href={url} target="_blank" rel="noopener noreferrer"><Video aria-hidden className="size-5" />{etykieta} (nowa karta)</a></Button>
    );
  }
  return (
    <div className="space-y-2">
      {wlaczony ? (
        <div className="aspect-video overflow-hidden rounded-xl border-2 border-line-soft">
          <iframe
            title={`Film: ${tytul}`}
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&cc_load_policy=1&hl=pl`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        </div>
      ) : (
        <button type="button" onClick={() => setWlaczony(true)} className="group flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-fg bg-hero text-hero-fg hover:opacity-90">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-fg group-hover:scale-105"><Play aria-hidden className="size-8" /></span>
          <span className="text-lg font-bold">Obejrzyj film: {tytul}</span>
          <span className="text-sm opacity-80">Odtwarzacz YouTube załaduje się po kliknięciu</span>
        </button>
      )}
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center text-sm font-semibold">{etykieta} na YouTube (nowa karta)</a>
    </div>
  );
}
