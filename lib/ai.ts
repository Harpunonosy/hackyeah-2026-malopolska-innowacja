// Jedyne miejsce, w którym aplikacja rozmawia z modelem AI. Zmiana dostawcy (PLLuM, Bielik)
// oznacza podmianę tego pliku, reszta kodu zna tylko zapytajJson().
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { z } from "zod";

export type Effort = "low" | "medium" | "high";

export class AiNiedostepneError extends Error {
  constructor(
    public powod: "brak_klucza" | "odmowa" | "zly_format" | "przerwane" | "blad",
    wiadomosc?: string,
  ) {
    super(wiadomosc ?? powod);
  }
}

export type UzycieAi = {
  model: string;
  wejscie: number;
  wyjscie: number;
  cacheZapis: number;
  cacheOdczyt: number;
};

export const DOMYSLNY_MODEL = () => process.env.AI_MODEL || "claude-sonnet-5-5";

let klient: Anthropic | null = null;
function pobierzKlienta(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new AiNiedostepneError("brak_klucza");
  klient ??= new Anthropic({ maxRetries: 1, timeout: 50_000 });
  return klient;
}

export type BlokSystemowy = { tekst: string; cache?: "5m" | "1h" };

export async function zapytajJson<S extends z.ZodType>(opcje: {
  schemat: S;
  system: BlokSystemowy[];
  uzytkownik: string;
  model?: string;
  effort?: Effort;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<{ dane: z.infer<S>; uzycie: UzycieAi }> {
  const model = opcje.model ?? DOMYSLNY_MODEL();
  let odpowiedz;
  try {
    odpowiedz = await pobierzKlienta().messages.parse({
      model,
      max_tokens: opcje.maxTokens ?? 8000,
      system: opcje.system.map((b) => ({
        type: "text" as const,
        text: b.tekst,
        ...(b.cache
          ? { cache_control: b.cache === "1h" ? { type: "ephemeral" as const, ttl: "1h" as const } : { type: "ephemeral" as const } }
          : {}),
      })),
      messages: [{ role: "user", content: opcje.uzytkownik }],
      output_config: { effort: opcje.effort ?? "medium", format: zodOutputFormat(opcje.schemat) },
    }, opcje.timeoutMs ? { timeout: opcje.timeoutMs } : undefined);
  } catch (e) {
    if (e instanceof AiNiedostepneError) throw e;
    if (e instanceof Anthropic.APIError) throw new AiNiedostepneError("blad", `API ${e.status}: ${e.message}`);
    throw new AiNiedostepneError("blad", e instanceof Error ? e.message : "nieznany błąd");
  }

  if (odpowiedz.stop_reason === "refusal") throw new AiNiedostepneError("odmowa");
  if (odpowiedz.stop_reason === "max_tokens") throw new AiNiedostepneError("przerwane");
  if (!odpowiedz.parsed_output) throw new AiNiedostepneError("zly_format");

  const u = odpowiedz.usage;
  return {
    dane: odpowiedz.parsed_output,
    uzycie: {
      model,
      wejscie: u.input_tokens,
      wyjscie: u.output_tokens,
      cacheZapis: u.cache_creation_input_tokens ?? 0,
      cacheOdczyt: u.cache_read_input_tokens ?? 0,
    },
  };
}
