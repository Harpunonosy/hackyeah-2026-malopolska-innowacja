import { innowacjaPoIdAsync } from "@/lib/katalog";
import { innowacjaPubliczna } from "@/lib/api-v1";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const i = await innowacjaPoIdAsync(id);
  if (!i) return Response.json({ blad: "nie_znaleziono" }, { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
  return Response.json(innowacjaPubliczna(i), { headers: { "Cache-Control": "public, max-age=60", "Access-Control-Allow-Origin": "*" } });
}
