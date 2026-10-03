import { z } from "zod";
import { db } from "@/lib/db";
import { hasloEkspertaZgodne, ustawSesjeEksperta } from "@/lib/ekspert";
import { czyWolno } from "@/lib/limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`login-eks:${ip}`, 6)) return Response.json({ blad: "za_duzo_prob" }, { status: 429 });
  const w = z.object({ id: z.string().uuid(), haslo: z.string().max(100) }).safeParse(await req.json().catch(() => null));
  if (!w.success || !hasloEkspertaZgodne(w.data.haslo)) return Response.json({ blad: "zle_dane" }, { status: 401 });
  const e = (await db().query("select 1 from eksperci where uzytkownik_id=$1", [w.data.id])).rows[0];
  if (!e) return Response.json({ blad: "zle_dane" }, { status: 401 });
  await ustawSesjeEksperta(w.data.id);
  return Response.json({ ok: true });
}
