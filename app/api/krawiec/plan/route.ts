import { zamaskuj } from "@/lib/maskowanie";
import { db } from "@/lib/db";
import { przygotujPlan, ProfilInstytucji } from "@/lib/krawiec";
import { czyWolno } from "@/lib/limit";

export const maxDuration = 120;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "lokalnie";
  if (!czyWolno(`krawiec:${ip}`, 4)) return Response.json({ blad: "za_duzo_zapytan" }, { status: 429 });
  const w = ProfilInstytucji.safeParse(await req.json().catch(() => null));
  if (!w.success) return Response.json({ blad: "walidacja", komunikat: w.error.issues[0]?.message }, { status: 400 });

  const profil = { ...w.data, partnerzy: zamaskuj(w.data.partnerzy).tekst };
  try {
    const wynik = await przygotujPlan(profil);
    const { rows } = await db().query(
      "insert into plany_wdrozenia (innowacja_id, profil, plan, kwalifikowalnosc) values ($1,$2,$3,$4) returning id",
      [w.data.innowacjaId, JSON.stringify(profil), JSON.stringify({ plan: wynik.plan, dane: wynik.dane }), JSON.stringify(wynik.kwalifikowalnosc)],
    );
    return Response.json({ id: rows[0].id });
  } catch (e) {
    console.error("Krawiec: błąd planu", e instanceof Error ? e.message : "?");
    return Response.json({ blad: "ai_niedostepne" }, { status: 502 });
  }
}
