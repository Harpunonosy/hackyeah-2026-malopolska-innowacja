import { czyWolno } from "@/lib/limit";
import { db } from "@/lib/db";
import { zapiszWDzienniku } from "@/lib/dziennik";
import { zamaskuj } from "@/lib/maskowanie";
import { powiadom } from "@/lib/powiadomienia";
import { normalizujPowiat } from "@/lib/powiaty";
import { ZgloszenieLidera } from "@/lib/siec";

// Dołączenie do sieci liderów: wpis czeka na weryfikację pracownika ROPS (Centrala → Treści).
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`siec:${ip}`, 3)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = ZgloszenieLidera.safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  const d = w.data;
  const { rows } = await db().query(
    "insert into liderzy (nazwa, sektor, powiat, obszary, oferuje, szuka, email) values ($1,$2,$3,$4,$5,$6,$7) returning id",
    [d.nazwa, d.sektor, normalizujPowiat(d.powiat) ?? null, d.obszary, zamaskuj(d.oferuje).tekst, d.szuka ? zamaskuj(d.szuka).tekst : null, d.email],
  );
  await powiadom({ adresat: "rops", typ: "nowy_lider", tresc: `„${d.nazwa}” chce dołączyć do sieci liderów innowacji. Sprawdź i zatwierdź wpis.`, link: "/centrala/tresci#siec-h" });
  await zapiszWDzienniku("lider_zgloszony", rows[0].id, d.nazwa, "formularz");
  return Response.json({ ok: true }, { status: 201 });
}
