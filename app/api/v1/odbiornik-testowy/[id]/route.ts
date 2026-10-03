import { db } from "@/lib/db";
import { sprawdzPodpis } from "@/lib/webhooki";

// Odbiornik demonstracyjny: udaje zewnętrzny system (np. bazę grantową) i sprawdza podpis HMAC tak,
// jak powinien to robić prawdziwy odbiorca. Nie zapisuje treści wiadomości.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ blad: "walidacja" }, { status: 400 });
  const w = (await db().query("select sekret from webhooki where id=$1", [id])).rows[0];
  if (!w) return Response.json({ blad: "nie_znaleziono" }, { status: 404 });
  const tresc = await req.text();
  const ok = sprawdzPodpis(w.sekret, req.headers.get("x-splot-czas") ?? "", tresc, req.headers.get("x-splot-podpis") ?? "");
  return Response.json({ podpis: ok ? "poprawny" : "niepoprawny" }, { status: ok ? 200 : 401 });
}
