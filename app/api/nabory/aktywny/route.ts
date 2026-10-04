import { naborOtwarty } from "@/lib/wniosek-walidacja";
import { db } from "@/lib/db";
import { schematNaboru } from "@/lib/nabor-schemat";

export async function GET() {
  const { rows } = await db().query("select id, nazwa, temat, aktywny, otwarty_od, otwarty_do, przyklad, schemat from nabory where aktywny = true order by otwarty_do nulls last, nazwa");
  const nabory = rows.filter(n => naborOtwarty(n)).slice(0, 20).map((n) => ({ id: n.id, nazwa: n.nazwa, temat: n.temat, otwarty_do: n.otwarty_do, przyklad: n.przyklad, schemat: schematNaboru(n.schemat) }));
  return Response.json({ nabor: nabory[0] ?? null, nabory }, { headers: { "Cache-Control": "no-store" } });
}
