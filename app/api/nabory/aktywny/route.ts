import { db } from "@/lib/db";

export async function GET() {
  const { rows } = await db().query("select id, nazwa, temat, otwarty_do, przyklad from nabory where aktywny = true order by otwarty_do nulls last limit 1");
  return Response.json({ nabor: rows[0] ?? null }, { headers: { "Cache-Control": "no-store" } });
}
