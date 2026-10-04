import { bledyWniosku, naborOtwarty } from "@/lib/wniosek-walidacja";
import { z } from "zod";
import { db } from "@/lib/db";
import { czyWolno } from "@/lib/limit";
import { zamaskuj } from "@/lib/maskowanie";
import { schematNaboru } from "@/lib/nabor-schemat";
import { utworzSprawe } from "@/lib/sprawy";
import { ocenWniosek, przygotujWniosek } from "@/lib/wniosek";

export const maxDuration = 120;
const UUID = /^[0-9a-f-]{36}$/i;

// POST {naborId, dane}: generuje projekt wniosku. PUT {naborId, pola}: zapisuje (składa) wniosek.
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`wniosek:${ip}`, 4)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = z.object({ naborId: z.string().regex(UUID), dane: z.string().min(20).max(6000) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  const n = (await db().query("select nazwa, temat, schemat, aktywny, otwarty_od, otwarty_do from nabory where id=$1 and aktywny=true", [w.data.naborId])).rows[0];
  if (!n || !naborOtwarty(n)) return Response.json({ blad: "nabor_zamkniety" }, { status: 409 });
  try {
    return Response.json({ pola: await przygotujWniosek(n, schematNaboru(n.schemat), zamaskuj(w.data.dane).tekst) });
  } catch (e) {
    console.error("Wniosek: błąd AI", e instanceof Error ? e.message : "?");
    return Response.json({ blad: "ai_niedostepne" }, { status: 502 });
  }
}

export async function PUT(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`wniosek-zapis:${ip}`, 6)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = z.object({ naborId: z.string().regex(UUID), pola: z.array(z.object({ nr: z.number(), tresc: z.string().max(4000) })).max(30) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  const client = await db().connect();
  try {
    await client.query("begin");
    const n = (await client.query("select id, nazwa, schemat, aktywny, otwarty_od, otwarty_do from nabory where id=$1 for share", [w.data.naborId])).rows[0];
    if (!n || !naborOtwarty(n)) { await client.query("rollback"); return Response.json({ blad: "nabor_zamkniety" }, { status: 409 }); }
    const bledy = bledyWniosku(w.data.pola, schematNaboru(n.schemat));
    if (bledy.length) { await client.query("rollback"); return Response.json({ blad: "walidacja", komunikat: bledy[0], bledy }, { status: 400 }); }
    const pola = w.data.pola.map((p) => ({ nr: p.nr, tresc: zamaskuj(p.tresc).tekst }));
    const { rows } = await client.query("insert into wnioski (nabor_id, pola, status) values ($1,$2,'zlozony') returning id", [w.data.naborId, JSON.stringify(pola)]);
    const tytul = pola.find((p) => p.nr === 1)?.tresc.slice(0, 100) || n.nazwa;
    const sprawa = await utworzSprawe({ typ: "wniosek", tytul: `Wniosek: ${tytul}`, tresc: `Wniosek w naborze ${n.nazwa}. ${pola.slice(0, 3).map((p) => p.tresc).join(" ")}`.slice(0, 1500), obiektId: rows[0].id }, client);
    await client.query("commit");
    return Response.json({ id: rows[0].id, numer: sprawa.numer }, { status: 201 });
  } catch {
    await client.query("rollback");
    return Response.json({ blad: "zapis_nieudany" }, { status: 500 });
  } finally { client.release(); }
}

// PATCH {naborId, pola}: wstępna ocena wniosku według kryteriów tego naboru (pomoc, nie decyzja komisji).
export async function PATCH(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`wniosek:${ip}`, 4)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = z.object({ naborId: z.string().regex(UUID), pola: z.array(z.object({ nr: z.number(), tresc: z.string().max(4000) })).max(30) }).safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  const n = (await db().query("select nazwa, schemat from nabory where id=$1", [w.data.naborId])).rows[0];
  if (!n) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  try {
    return Response.json(await ocenWniosek(n, schematNaboru(n.schemat), w.data.pola.map((p) => ({ nr: p.nr, tresc: zamaskuj(p.tresc).tekst }))));
  } catch (e) {
    console.error("Ocena wniosku: błąd AI", e instanceof Error ? e.message : "?");
    return Response.json({ blad: "ai_niedostepne" }, { status: 502 });
  }
}
