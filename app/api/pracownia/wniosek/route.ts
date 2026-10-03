import { z } from "zod";
import { db } from "@/lib/db";
import { czyWolno } from "@/lib/limit";
import { zamaskuj } from "@/lib/maskowanie";
import { przygotujWniosek } from "@/lib/wniosek";

export const maxDuration = 120;
const UUID = /^[0-9a-f-]{36}$/i;

// POST {naborId, dane}: generuje projekt wniosku. PUT {naborId, pola}: zapisuje (składa) wniosek.
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`wniosek:${ip}`, 4)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = z.object({ naborId: z.string().regex(UUID), dane: z.string().min(20).max(6000) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  const n = (await db().query("select nazwa, temat from nabory where id=$1 and aktywny=true", [w.data.naborId])).rows[0];
  if (!n) return Response.json({ blad: "nabor_zamkniety" }, { status: 409 });
  try {
    return Response.json({ pola: await przygotujWniosek(n, zamaskuj(w.data.dane).tekst) });
  } catch (e) {
    console.error("Wniosek: błąd AI", e instanceof Error ? e.message : "?");
    return Response.json({ blad: "ai_niedostepne" }, { status: 502 });
  }
}

export async function PUT(req: Request) {
  const w = z.object({ naborId: z.string().regex(UUID), pola: z.array(z.object({ nr: z.number(), tresc: z.string().max(4000) })).max(12) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  const n = (await db().query("select id from nabory where id=$1 and aktywny=true", [w.data.naborId])).rows[0];
  if (!n) return Response.json({ blad: "nabor_zamkniety" }, { status: 409 });
  const { rows } = await db().query("insert into wnioski (nabor_id, pola, status) values ($1,$2,'zlozony') returning id", [w.data.naborId, JSON.stringify(w.data.pola)]);
  return Response.json({ id: rows[0].id }, { status: 201 });
}
