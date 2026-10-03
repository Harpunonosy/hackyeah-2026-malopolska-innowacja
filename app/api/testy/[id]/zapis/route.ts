import { z } from "zod";
import { db } from "@/lib/db";
import { czyWolno } from "@/lib/limit";
import { utworzSprawe } from "@/lib/sprawy";

const UUID = /^[0-9a-f-]{36}$/i;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!UUID.test(id) || !czyWolno(`zapis:${ip}`, 6)) return Response.json({ blad: "odrzucone" }, { status: 400 });
  const w = z.object({ email: z.string().trim().email().max(120).optional().or(z.literal("")) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: "Podaj poprawny adres e-mail albo zostaw pole puste." }, { status: 400 });
  const c = await db().connect();
  try {
    await c.query("begin");
    const t = (await c.query("select liczba_miejsc, status, tytul, powiat, obszar from testy where id=$1 for update", [id])).rows[0];
    if (!t || t.status !== "otwarty") { await c.query("rollback"); return Response.json({ blad: "nie_znaleziono" }, { status: 404 }); }
    const zajete = (await c.query("select count(*)::int as n from zapisy_testy where test_id=$1", [id])).rows[0].n;
    if (zajete >= t.liczba_miejsc) { await c.query("rollback"); return Response.json({ blad: "pelny" }, { status: 409 }); }
    const u = await c.query("insert into uzytkownicy (rola, email) values ('mieszkaniec', $1) returning id", [w.data.email || null]);
    await c.query("insert into zapisy_testy (test_id, uzytkownik_id) values ($1,$2)", [id, u.rows[0].id]);
    await c.query("commit");
    const sprawa = await utworzSprawe({ typ: "zapis", tytul: `Zapis na test: ${t.tytul}`, tresc: `Zapis osoby na test „${t.tytul}” (${String(t.powiat ?? "").replace("powiat ", "")}).`, obiektId: id, powiat: t.powiat, obszar: t.obszar, email: w.data.email || undefined });
    return Response.json({ ok: true, numer: sprawa.numer, wolne: t.liczba_miejsc - zajete - 1 });
  } catch (e) {
    await c.query("rollback");
    console.error("Zapis na test:", e instanceof Error ? e.message : "?");
    return Response.json({ blad: "blad" }, { status: 500 });
  } finally {
    c.release();
  }
}
