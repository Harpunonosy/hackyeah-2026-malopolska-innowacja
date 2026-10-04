// Jedyne miejsce, w którym aplikacja rozmawia z modelem AI.
// Moduły korzystają z zapytajJson(); dostawca i format transportu pozostają tutaj.
import { z } from "zod";

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

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-flash";
const modelDeepSeek = (model: string | undefined) => model?.trim().startsWith("deepseek-") ? model.trim() : null;
/** Stare AI_MODEL=claude-* nie blokuje przełączenia całej aplikacji na DeepSeek. */
export const DOMYSLNY_MODEL = () => modelDeepSeek(process.env.AI_MODEL) ?? MODEL;

export type BlokSystemowy = { tekst: string; cache?: "5m" | "1h" };

const Tokeny = z.number().int().nonnegative();
const OdpowiedzDeepSeek = z.object({
  choices: z.array(z.object({
    finish_reason: z.string().nullable(),
    message: z.object({ content: z.string().nullable().optional(), refusal: z.string().nullable().optional() }),
  })).min(1),
  usage: z.object({
    prompt_tokens: Tokeny.optional(), completion_tokens: Tokeny.optional(),
    prompt_cache_hit_tokens: Tokeny.optional(), prompt_cache_miss_tokens: Tokeny.optional(),
  }).optional(),
});

export async function zapytajJson<S extends z.ZodType>(opcje: {
  schemat: S;
  system: BlokSystemowy[];
  uzytkownik: string;
  model?: string;
  effort?: Effort;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<{ dane: z.infer<S>; uzycie: UzycieAi }> {
  const klucz = process.env.DEEPSEEK_API_KEY?.trim();
  if (!klucz) throw new AiNiedostepneError("brak_klucza");
  const model = modelDeepSeek(opcje.model) ?? DOMYSLNY_MODEL();
  let body: string;
  try {
    body = JSON.stringify({
      model,
      max_tokens: opcje.maxTokens ?? 8000,
      thinking: { type: "disabled" },
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: [
          ...opcje.system.map(b => b.tekst),
          "Zwróć wyłącznie obiekt JSON zgodny z poniższym schematem JSON Schema, bez Markdown ani dodatkowego tekstu.",
          JSON.stringify(z.toJSONSchema(opcje.schemat)),
        ].join("\n\n") },
        { role: "user", content: opcje.uzytkownik },
      ],
    });
  } catch { throw new AiNiedostepneError("zly_format"); }

  const timeoutMs = opcje.timeoutMs ?? 50_000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new AiNiedostepneError("przerwane");
  const kontroler = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  // Race ogranicza również odczyt body oraz transport, który nie zareaguje na abort.
  const limit = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      kontroler.abort();
      reject(new AiNiedostepneError("przerwane"));
    }, timeoutMs);
  });
  const zLimitem = <T>(p: Promise<T>): Promise<T> => Promise.race([p, limit]);
  try {
    for (let proba = 0; proba < 2; proba++) {
      let odpowiedz: Response;
      let json: unknown;
      try {
        odpowiedz = await zLimitem(fetch(DEEPSEEK_URL, {
          method: "POST",
          headers: { "content-type": "application/json", authorization: `Bearer ${klucz}` },
          body, signal: kontroler.signal,
        }));
        if (!odpowiedz.ok) {
          // Nie odczytujemy ani nie logujemy błędów dostawcy: mogą zawierać dane lub klucz.
          void odpowiedz.body?.cancel().catch(() => {});
          if (proba === 0 && (odpowiedz.status === 429 || odpowiedz.status >= 500)) continue;
          throw new AiNiedostepneError("blad");
        }
        json = await zLimitem(odpowiedz.json());
      } catch (e) {
        if (kontroler.signal.aborted) throw new AiNiedostepneError("przerwane");
        if (e instanceof AiNiedostepneError) throw e;
        if (e instanceof SyntaxError) throw new AiNiedostepneError("zly_format");
        if (proba === 0) continue;
        throw new AiNiedostepneError("blad");
      }
      const wynik = OdpowiedzDeepSeek.safeParse(json);
      if (!wynik.success) throw new AiNiedostepneError("zly_format");
      const wybor = wynik.data.choices[0];
      if (wybor.finish_reason === "refusal" || wybor.finish_reason === "content_filter" || wybor.message.refusal) throw new AiNiedostepneError("odmowa");
      if (["length", "aborted", "insufficient_system_resource"].includes(wybor.finish_reason ?? "")) throw new AiNiedostepneError("przerwane");
      if (!wybor.message.content?.trim()) throw new AiNiedostepneError("zly_format");
      let dane: z.infer<S>;
      try {
        const walidacja = opcje.schemat.safeParse(JSON.parse(wybor.message.content));
        if (!walidacja.success) throw new AiNiedostepneError("zly_format");
        dane = walidacja.data;
      } catch { throw new AiNiedostepneError("zly_format"); }
      const usage = wynik.data.usage;
      return {
        dane,
        uzycie: {
          model,
          wejscie: usage?.prompt_tokens ?? 0,
          wyjscie: usage?.completion_tokens ?? 0,
          cacheZapis: 0, // DeepSeek nie podaje osobnego kosztu tworzenia cache.
          cacheOdczyt: usage?.prompt_cache_hit_tokens ?? 0,
        },
      };
    }
    throw new AiNiedostepneError("blad");
  } finally { clearTimeout(timer!); }
}
