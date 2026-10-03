import { after } from "next/server";
import { czyWolno } from "@/lib/limit";
import { oceńZgloszenie, utworzZgloszenie, WejscieZgloszenia } from "@/lib/zgloszenia";

export const maxDuration = 60;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`zgl:${ip}`, 5)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ blad: "zle_zapytanie" }, { status: 400 });
  }
  const w = WejscieZgloszenia.safeParse(body);
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });

  const { id, numer } = await utworzZgloszenie(w.data);
  after(() => oceńZgloszenie(id)); // ocena AI nie opóźnia odpowiedzi dla autora
  return Response.json({ numer }, { status: 201 });
}
