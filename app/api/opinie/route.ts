import { OpiniaSchema as W } from "@/lib/opinia-walidacja";
import { innowacjaPoIdAsync } from "@/lib/katalog";
import { db } from "@/lib/db";
import { czyWolno } from "@/lib/limit";
import { zamaskuj } from "@/lib/maskowanie";


export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`opinia:${ip}`, 6)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = W.safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja" }, { status: 400 });
  const d = w.data;
  if (d.testId && !(await db().query("select id from testy where id=$1 and status in ('otwarty','zakonczony')", [d.testId])).rowCount) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  if (d.innowacjaId && !(await innowacjaPoIdAsync(d.innowacjaId))) return Response.json({ blad: "walidacja" }, { status: 400 });
  await db().query(
    "insert into opinie (innowacja_id, ocena, odpowiedzi, propozycja, test_id) values ($1,$2,$3,$4,$5)",
    [d.innowacjaId ?? null, d.ocena, JSON.stringify({ latwe: zamaskuj(d.latwe).tekst, trudne: zamaskuj(d.trudne).tekst, polecilbys: d.polecilbys }), zamaskuj(d.propozycja).tekst, d.testId ?? null],
  );
  return Response.json({ ok: true }, { status: 201 });
}
