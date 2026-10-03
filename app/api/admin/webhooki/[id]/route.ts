import { z } from "zod";
import { db } from "@/lib/db";
import { zapiszWDzienniku } from "@/lib/dziennik";
import { czyAdmin } from "@/lib/sesja";
import { wyslijTest } from "@/lib/webhooki";

const Wejscie = z.object({ akcja: z.enum(["test", "wlacz", "wylacz", "usun"]) });

// Test, włączenie, wyłączenie albo usunięcie odbiorcy webhooków.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { id } = await ctx.params;
  const w = Wejscie.safeParse(await req.json().catch(() => null));
  if (!w.success || !/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ blad: "walidacja" }, { status: 400 });
  const c = db();
  if (w.data.akcja === "test") {
    const wynik = await wyslijTest(id);
    return wynik ? Response.json(wynik) : Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  }
  if (w.data.akcja === "usun") await c.query("delete from webhooki where id=$1", [id]);
  else await c.query("update webhooki set aktywny=$2 where id=$1", [id, w.data.akcja === "wlacz"]);
  await zapiszWDzienniku(`webhook_${w.data.akcja}`, id);
  return Response.json({ ok: true });
}
