/** Wczytuje dane ROPS do bazy: obszary, innowacje, wskaźniki IOSS, fakty.  npx tsx --env-file=.env.local scripts/seed.ts */
import { readFileSync } from "node:fs";
import { db } from "../lib/db";
import { innowacje } from "../lib/biblioteka";
import { OBSZAR_KATEGORII } from "../lib/obszary";

const wczytaj = (p: string) => JSON.parse(readFileSync(p, "utf8"));

async function main() {
  const c = await db().connect();
  try {
    await c.query("begin");
    const mapa = wczytaj("data/mapa_wyzwan.json");
    for (const o of mapa.obszary) {
      await c.query(
        "insert into obszary (id, nazwa, dane) values ($1,$2,$3) on conflict (id) do update set nazwa=$2, dane=$3",
        [o.id, o.nazwa, o],
      );
    }
    for (const i of innowacje) {
      await c.query(
        `insert into innowacje (id, nazwa, kategoria, obszary, na_czym_polega, problem, grupa_docelowa, kto_moze_skorzystac,
           czy_to_dziala, autor_organizacja, upowszechniana_w, film, folder_pdf, materialy_zip, url)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         on conflict (id) do update set nazwa=excluded.nazwa, kategoria=excluded.kategoria, obszary=excluded.obszary,
           na_czym_polega=excluded.na_czym_polega, problem=excluded.problem, grupa_docelowa=excluded.grupa_docelowa,
           kto_moze_skorzystac=excluded.kto_moze_skorzystac, czy_to_dziala=excluded.czy_to_dziala, url=excluded.url, updated_at=now()`,
        [i.id, i.nazwa, i.kategoria, [OBSZAR_KATEGORII[i.kategoria]].filter(Boolean), i.naCzymPolega, i.problem, i.grupaDocelowa,
          i.ktoMozeSkorzystac, i.czyToDziala, i.autor, i.upowszechnianaW, i.film[0] ?? null, i.folderPdf[0] ?? null, i.materialyZip[0] ?? null, i.url],
      );
    }
    const ioss = wczytaj("data/zrodla/ioss_powiaty.json");
    let n = 0;
    for (const r of ioss.dane) {
      if (r.wartosc === null || r.rok === null) continue;
      await c.query(
        `insert into ioss (wskaznik_id, kategoria, wskaznik, rok, powiat, wartosc) values ($1,$2,$3,$4,$5,$6)
         on conflict (wskaznik_id, powiat, rok) do update set wartosc=$6`,
        [r.id, r.kategoria, r.wskaznik, Number(r.rok), r.powiat, r.wartosc],
      );
      n++;
    }
    await c.query("truncate fakty restart identity");
    const kond = wczytaj("data/kondycja_malopolski.json");
    for (const f of kond.fakty) {
      await c.query("insert into fakty (temat, tekst, zrodlo, strona) values ($1,$2,$3,$4)", [f.temat, f.tekst, f.zrodlo, f.strona ?? null]);
    }
    await c.query("commit");
    console.log(`obszary ${mapa.obszary.length}, innowacje ${innowacje.length}, ioss ${n}, fakty ${kond.fakty.length}`);
  } catch (e) {
    await c.query("rollback");
    throw e;
  } finally {
    c.release();
    await db().end();
  }
}
main();
