// Przywraca dane demonstracyjne: usuwa wszystko, co wprowadzili goście i Jury, a zostawia syntetyczne dane startowe.
import { db } from "./db";
import { uniewaznijKatalog } from "./katalog";

export async function przywrocDaneDemo(): Promise<Record<string, number>> {
  const c = await db().connect();
  const usuniete: Record<string, number> = {};
  const wykonaj = async (nazwa: string, sql: string) => {
    usuniete[nazwa] = (await c.query(sql)).rowCount ?? 0;
  };
  try {
    await c.query("begin");
    await wykonaj("wiadomosci", "delete from wiadomosci");
    await wykonaj("watki", "delete from watki");
    await wykonaj("powiadomienia", "delete from powiadomienia");
    await wykonaj("zgloszenia", "delete from zgloszenia where not syntetyczne");
    await c.query("update zgloszenia set ekspert_id=null, pierwsza_odpowiedz_at=null, ocena_pomocy=null, status = case when status = 'zamkniete' then status else 'zamkniete' end, odpowiedz_na=null where syntetyczne");
    await wykonaj("zapisy_testy", "delete from zapisy_testy");
    await wykonaj("opinie", "delete from opinie");
    await wykonaj("testy", "delete from testy where numer is not null");
    await wykonaj("fiszki", "delete from fiszki where not syntetyczne");
    await wykonaj("partnerstwa", "delete from partnerstwa where not syntetyczne");
    await wykonaj("wnioski", "delete from wnioski");
    await wykonaj("plany_wdrozenia", "delete from plany_wdrozenia");
    await wykonaj("nabory", "delete from nabory where not przyklad");
    await wykonaj("reakcje", "delete from reakcje where not syntetyczne");
    await wykonaj("innowacje", "delete from innowacje where zrodlo in ('dodana','nadpisana')");
    await wykonaj("dziennik", "delete from dziennik");
    await wykonaj("webhooki", "delete from webhooki");
    await wykonaj("uzytkownicy", "delete from uzytkownicy where rola <> 'ekspert'");
    await c.query("commit");
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
  }
  uniewaznijKatalog();
  return usuniete;
}
