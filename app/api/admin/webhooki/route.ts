import { z } from "zod";
import { db } from "@/lib/db";
import { zapiszWDzienniku } from "@/lib/dziennik";
import { czyAdmin } from "@/lib/sesja";
import { nowySekret, ZDARZENIA } from "@/lib/webhooki";

const Demo = z.object({ demo: z.literal(true) });
const Wejscie = z.object({
  nazwa: z.string().trim().min(2).max(80),
  url: z.url().max(500).refine((u) => u.startsWith("https://") || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(u), "Adres musi zaczynać się od https://"),
  zdarzenia: z.array(z.enum(ZDARZENIA)).min(1),
});

// Dodanie odbiorcy webhooków. Sekret pokazujemy tylko raz, w odpowiedzi na to żądanie.
export async function POST(req: Request) {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (Demo.safeParse(body).success) {
    // Odbiornik demonstracyjny w samym Splocie: pokazuje pełną drogę wiadomości razem ze sprawdzeniem podpisu.
    const sekret = nowySekret();
    const c = db();
    const { rows } = await c.query("insert into webhooki (nazwa, url, sekret, zdarzenia) values ('Baza grantowa (demo)', '', $1, $2) returning id", [sekret, ZDARZENIA]);
    await c.query("update webhooki set url=$2 where id=$1", [rows[0].id, `${new URL(req.url).origin}/api/v1/odbiornik-testowy/${rows[0].id}`]);
    await zapiszWDzienniku("webhook_dodany", rows[0].id, "Dodano odbiornik demonstracyjny");
    return Response.json({ id: rows[0].id, sekret }, { status: 201 });
  }
  const w = Wejscie.safeParse(body);
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  const sekret = nowySekret();
  const { rows } = await db().query("insert into webhooki (nazwa, url, sekret, zdarzenia) values ($1,$2,$3,$4) returning id", [w.data.nazwa, w.data.url, sekret, w.data.zdarzenia]);
  await zapiszWDzienniku("webhook_dodany", rows[0].id, `Dodano odbiorcę webhooków „${w.data.nazwa}”`);
  return Response.json({ id: rows[0].id, sekret }, { status: 201 });
}
