// Automatyczne powiadomienia o naborach: otwarcie, zmiana terminu lub schematu, zamknięcie.
// Adresaci: autorzy pomysłów (fiszek), których temat pasuje do naboru (obszar), a przy naborze ogólnym wszyscy.
import { db } from "./db";
import { nazwaObszaru, type ObszarId } from "./obszary";
import { powiadom, type TypPowiadomienia } from "./powiadomienia";

export async function powiadomONaborze(naborId: string, typ: Extract<TypPowiadomienia, "nabor_otwarty" | "nabor_zmiana" | "nabor_zamkniety">, szczegol?: string): Promise<number> {
  const c = db();
  const n = (await c.query("select nazwa, temat, otwarty_do from nabory where id=$1", [naborId])).rows[0];
  if (!n) return 0;
  const { rows } = await c.query(
    `select f.tytul, f.numer, z.obszar from fiszki f left join zgloszenia z on z.numer = f.numer
     where f.numer is not null and f.status <> 'odrzucona' limit 300`,
  );
  const temat = String(n.temat ?? "").toLowerCase();
  const wszystkie = !temat || !temat.includes(";");
  const pasujace = rows.filter((f) => wszystkie || (f.obszar && temat.includes(nazwaObszaru(f.obszar as ObszarId).toLowerCase())));
  const doKiedy = n.otwarty_do ? ` Termin: ${new Date(n.otwarty_do).toLocaleDateString("pl-PL")}.` : "";
  const tresci = {
    nabor_otwarty: (t: string) => `Nabór „${n.nazwa}” jest otwarty. Twój pomysł „${t}” może do niego pasować: w Pracowni przygotujesz wniosek.${doKiedy}`,
    nabor_zmiana: (t: string) => `W naborze „${n.nazwa}” coś się zmieniło${szczegol ? `: ${szczegol}` : ""}. Dotyczy to też Twojego pomysłu „${t}”.${doKiedy}`,
    nabor_zamkniety: (t: string) => `Nabór „${n.nazwa}” został zamknięty. Twój pomysł „${t}” zostaje w Splocie, a o kolejnym naborze damy znać.`,
  } as const;
  for (const f of pasujace) {
    await powiadom({ adresat: "autor", typ, tresc: tresci[typ](f.tytul), link: typ === "nabor_zamkniety" ? `/moje/${f.numer}` : "/pomysl", numerSprawy: f.numer, kanal: "email" });
  }
  await powiadom({ adresat: "rops", typ, tytul: `Nabór „${n.nazwa}”: wysłano ${pasujace.length} powiadomień`, tresc: `Zdarzenie: ${typ.replace("nabor_", "")}. Autorzy pasujących pomysłów dostali wiadomość.`, link: "/centrala/nabory" });
  return pasujace.length;
}
