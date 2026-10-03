import { db } from "@/lib/db";

// Nabory grantowe ROPS: otwarte i zakończone (bez formularzy roboczych).
export async function GET() {
  const { rows } = await db().query("select id, nazwa, program, temat, otwarty_od, otwarty_do, aktywny, zmiana_at from nabory order by aktywny desc, otwarty_do desc nulls last limit 50");
  return Response.json(
    { wersja: "1", nabory: rows.map((n) => ({ id: n.id, nazwa: n.nazwa, program: n.program, temat: n.temat, otwartyOd: n.otwarty_od, otwartyDo: n.otwarty_do, otwarty: n.aktywny, ostatniaZmiana: n.zmiana_at, link: "/pomysl" })) },
    { headers: { "Cache-Control": "public, max-age=60", "Access-Control-Allow-Origin": "*" } },
  );
}
