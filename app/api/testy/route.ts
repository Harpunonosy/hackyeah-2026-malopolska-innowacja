import { db } from "@/lib/db";
import { czyWolno } from "@/lib/limit";
import { zamaskuj } from "@/lib/maskowanie";
import { normalizujPowiat } from "@/lib/powiaty";
import { utworzSprawe } from "@/lib/sprawy";
import { OgloszenieTestu } from "@/lib/testy";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`test-ogl:${ip}`, 4)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = OgloszenieTestu.safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });
  const d = w.data;
  const powiat = normalizujPowiat(d.powiat);
  if (!powiat) return Response.json({ blad: "walidacja", komunikat: "Wybierz powiat z listy." }, { status: 400 });
  const { rows } = await db().query(
    `insert into testy (innowacja_id, tytul, opis, kogo_szukamy, powiat, termin, liczba_miejsc, dostepnosc, obszar, status)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'do_akceptacji') returning id`,
    [d.innowacjaId || null, zamaskuj(d.tytul).tekst, zamaskuj(d.opis).tekst, JSON.stringify({ opis: zamaskuj(d.kogo).tekst }), powiat, zamaskuj(d.termin).tekst, d.liczbaMiejsc, zamaskuj(d.dostepnosc).tekst, d.obszar],
  );
  const sprawa = await utworzSprawe({ typ: "ogloszenie", tytul: `Ogłoszenie testu: ${d.tytul}`, tresc: `${d.tytul}. ${d.opis} Kogo szukamy: ${d.kogo}`.slice(0, 1500), obiektId: rows[0].id, powiat, obszar: d.obszar, email: d.email || undefined });
  await db().query("update testy set numer=$2 where id=$1", [rows[0].id, sprawa.numer]);
  return Response.json({ numer: sprawa.numer }, { status: 201 });
}
