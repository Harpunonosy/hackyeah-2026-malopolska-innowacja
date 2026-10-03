import { czyWolno } from "@/lib/limit";
import { haslaZgodne, ustawSesjeAdmina } from "@/lib/sesja";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`login:${ip}`, 6)) return Response.json({ blad: "za_duzo_prob" }, { status: 429 });
  const body = (await req.json().catch(() => null)) as { haslo?: string } | null;
  if (!haslaZgodne(body?.haslo ?? "")) return Response.json({ blad: "zle_haslo" }, { status: 401 });
  await ustawSesjeAdmina();
  return Response.json({ ok: true });
}
