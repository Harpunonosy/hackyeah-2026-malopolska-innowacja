import { db } from "@/lib/db";
import { czyAdmin } from "@/lib/sesja";

const csv = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;

// Eksport zgłoszeń (treść już zamaskowana) do CSV, np. dla bazy grantowej lub raportów.
export async function GET() {
  if (!(await czyAdmin())) return Response.json({ blad: "brak_dostepu" }, { status: 401 });
  const { rows } = await db().query("select numer, created_at, status, priorytet, kryzys, obszar, powiat, najlepsze_dopasowanie, streszczenie, tresc_zamaskowana from zgloszenia where not coalesce(syntetyczne,false) order by created_at desc");
  const naglowek = "numer,data,status,priorytet,kryzys,obszar,powiat,najlepsze_dopasowanie,streszczenie,tresc";
  const wiersze = rows.map((r) => [r.numer, r.created_at.toISOString(), r.status, r.priorytet, r.kryzys, r.obszar, r.powiat, r.najlepsze_dopasowanie, r.streszczenie, r.tresc_zamaskowana].map(csv).join(","));
  return new Response("﻿" + [naglowek, ...wiersze].join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="zgloszenia.csv"' } });
}
