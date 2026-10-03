// Ścieżka wniosku grantowego (W-35): złożony → ocena formalna → ocena merytoryczna → decyzja.
// Każdy krok zmienia status sprawy, zapisuje datę i powiadamia autora (numer sprawy w „Moje sprawy”).
import { db } from "./db";
import { zapiszWDzienniku } from "./dziennik";
import { powiadom } from "./powiadomienia";
import type { Status } from "./statusy";
import { wyslijZdarzenie } from "./webhooki";
import { zmienStatus } from "./zgloszenia";

export const ETAPY_WNIOSKU = ["zlozony", "ocena_formalna", "ocena_merytoryczna", "decyzja"] as const;
export type EtapWniosku = (typeof ETAPY_WNIOSKU)[number];
export const DECYZJE = ["przyznano", "lista_rezerwowa", "odrzucono"] as const;
export type Decyzja = (typeof DECYZJE)[number];

const STATUS_SPRAWY: Record<Exclude<EtapWniosku, "zlozony">, Status> = {
  ocena_formalna: "w_analizie",
  ocena_merytoryczna: "u_eksperta",
  decyzja: "odpowiedz",
};

const TRESC: Record<Exclude<EtapWniosku, "zlozony">, (d?: Decyzja) => string> = {
  ocena_formalna: () => "Twój wniosek przeszedł do oceny formalnej. Sprawdzamy, czy jest kompletny i zgodny z regulaminem naboru.",
  ocena_merytoryczna: () => "Wniosek przeszedł ocenę formalną. Teraz oceniają go eksperci według karty oceny naboru.",
  decyzja: (d) =>
    d === "przyznano" ? "Jest decyzja: wniosek otrzymał dofinansowanie. Pracownik ROPS skontaktuje się w sprawie umowy."
    : d === "lista_rezerwowa" ? "Jest decyzja: wniosek jest na liście rezerwowej. Jeśli zwolnią się środki, damy znać."
    : "Jest decyzja: tym razem wniosek nie otrzymał dofinansowania. Uzasadnienie jest w wiadomości od ROPS. Pomysł zostaje w Splocie.",
};

export async function zmienEtapWniosku(wniosekId: string, etap: Exclude<EtapWniosku, "zlozony">, decyzja?: Decyzja, uzasadnienie?: string) {
  const c = db();
  const w = (await c.query("select w.id, n.nazwa as nabor from wnioski w left join nabory n on n.id=w.nabor_id where w.id=$1", [wniosekId])).rows[0];
  if (!w) return null;
  await c.query(
    `update wnioski set status=$2, etapy = etapy || jsonb_build_object($2::text, now()),
       decyzja = coalesce($3, decyzja), decyzja_at = case when $2 = 'decyzja' then now() else decyzja_at end where id=$1`,
    [wniosekId, etap, etap === "decyzja" ? (decyzja ?? null) : null],
  );
  const s = (await c.query("select id, numer from zgloszenia where typ='wniosek' and obiekt_id=$1", [wniosekId])).rows[0];
  const tresc = TRESC[etap](decyzja) + (uzasadnienie ? ` ${uzasadnienie}` : "");
  if (s) {
    if (etap === "ocena_formalna" && (await c.query("update zgloszenia set status='przeczytane' where id=$1 and status='wyslane'", [s.id])).rowCount) {
      await c.query("insert into historia_statusu (zgloszenie_id, status, notatka) values ($1,'przeczytane','Wniosek otwarty w Centrali')", [s.id]);
    }
    await zmienStatus(s.id, STATUS_SPRAWY[etap], tresc);
    if (etap === "decyzja") await c.query("update zgloszenia set pierwsza_odpowiedz_at = coalesce(pierwsza_odpowiedz_at, now()) where id=$1", [s.id]);
    await powiadom({ adresat: "autor", typ: "wniosek_status", tresc, link: `/moje/${s.numer}`, numerSprawy: s.numer, kanal: "email" });
  }
  wyslijZdarzenie("wniosek.zmiana", { numerSprawy: s?.numer ?? null, typ: etap === "decyzja" ? `decyzja:${decyzja}` : etap, tytul: w.nabor, link: "/centrala/nabory" });
  await zapiszWDzienniku(`wniosek_${etap}`, wniosekId, decyzja);
  return { numer: s?.numer ?? null };
}

export async function oznaczEksport(wniosekId: string) {
  await db().query("update wnioski set eksport_at = now() where id=$1", [wniosekId]);
  await zapiszWDzienniku("wniosek_eksport", wniosekId, "Przekazano do bazy grantowej");
}
