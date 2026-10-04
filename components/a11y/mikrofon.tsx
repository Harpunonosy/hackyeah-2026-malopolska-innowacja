"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

// Minimalne typy Web Speech API (nie ma ich w standardowym lib.dom).
type Rozpoznawanie = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type Konstruktor = new () => Rozpoznawanie;

function pobierzKonstruktor(): Konstruktor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: Konstruktor; webkitSpeechRecognition?: Konstruktor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function Mikrofon({ onZdanie, jezyk, etykieta, className = "space-y-1" }: { onZdanie: (tekst: string) => void; jezyk: string; etykieta?: string; className?: string }) {
  const t = useTranslations("swatka");
  const [stan, setStan] = React.useState<"bezczynny" | "slucham" | "blad">("bezczynny");
  const dostepny = React.useSyncExternalStore(
    () => () => {},
    () => pobierzKonstruktor() !== null,
    () => true,
  );
  const ref = React.useRef<Rozpoznawanie | null>(null);

  React.useEffect(() => {
    return () => ref.current?.stop();
  }, []);

  function przelacz() {
    if (stan === "slucham") return ref.current?.stop();
    const K = pobierzKonstruktor();
    if (!K) return;
    const r = new K();
    r.lang = jezyk === "uk" ? "uk-UA" : jezyk === "en" ? "en-GB" : "pl-PL";
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) onZdanie(e.results[i][0].transcript.trim());
      }
    };
    r.onerror = () => setStan("blad");
    r.onend = () => setStan((s) => (s === "blad" ? s : "bezczynny"));
    ref.current = r;
    try {
      r.start();
      setStan("slucham");
    } catch {
      setStan("blad");
    }
  }

  if (!dostepny) return <p className="text-sm text-muted">{t("mikrofonNiedostepny")}</p>;

  return (
    <div className={className}>
      <Button type="button" wariant={stan === "slucham" ? "glowny" : "obrys"} rozmiar="lg" onClick={przelacz} aria-pressed={stan === "slucham"}>
        {stan === "slucham" ? <Square aria-hidden className="size-5" /> : <Mic aria-hidden className="size-5" />}
        {etykieta ?? t("mikrofon")}
      </Button>
      <p role="status" className="text-sm text-muted">
        {stan === "slucham" && t("mikrofonSluchamy")}
        {stan === "blad" && t("mikrofonBlad")}
        {stan === "bezczynny" && <span>{t("mikrofonInfo")}</span>}
      </p>
    </div>
  );
}
