import { OPISY_ZDARZEN, ZDARZENIA } from "./webhooki";

const tekst = { type: "string" } as const;
const lista = (items: object) => ({ type: "array", items });

/** Opis publicznego API Splotu w standardzie OpenAPI 3.1 (serwowany pod /api/v1/openapi.json). */
export function opisApi(serwer: string) {
  const Innowacja = {
    type: "object",
    properties: {
      id: tekst, nazwa: tekst, kategoria: tekst, naCzymPolega: tekst, problem: tekst, grupaDocelowa: tekst,
      ktoMozeSkorzystac: tekst, czyToDziala: tekst, autor: tekst, filmy: lista(tekst), folderyPdf: lista(tekst),
      url: { ...tekst, description: "Karta w Bibliotece Innowacji ROPS" }, link: { ...tekst, description: "Karta w Splocie (ścieżka względna)" },
    },
  };
  const Dopasowanie = {
    type: "object",
    properties: { id: tekst, nazwa: tekst, kategoria: tekst, trafnosc: { type: ["integer", "null"], description: "0–100" }, dlaczego: tekst, ktoMozeWdrozyc: tekst, film: { type: ["string", "null"] }, link: tekst },
  };
  const json = (schema: object) => ({ content: { "application/json": { schema } } });
  return {
    openapi: "3.1.0",
    info: {
      title: "Splot API",
      version: "1.0.0",
      description: "Publiczne API Splotu, cyfrowego serca Małopolskiego Hubu Innowacji Społecznych (ROPS Kraków). Odczyt katalogu innowacji, naborów i zbiorczych statystyk potrzeb oraz matchmaking. Odpowiedzi nie zawierają danych osobowych.",
      license: { name: "Dane: Biblioteka Innowacji Społecznych ROPS Kraków" },
    },
    servers: [{ url: serwer }],
    paths: {
      "/api/v1/innowacje": {
        get: {
          summary: "Katalog innowacji społecznych",
          parameters: [
            { name: "q", in: "query", schema: tekst, description: "Słowa kluczowe (wszystkie muszą wystąpić)" },
            { name: "kategoria", in: "query", schema: tekst },
            { name: "zFilmem", in: "query", schema: { type: "string", enum: ["1"] } },
          ],
          responses: { 200: { description: "Lista innowacji", ...json({ type: "object", properties: { wersja: tekst, liczba: { type: "integer" }, innowacje: lista(Innowacja) } }) } },
        },
      },
      "/api/v1/innowacje/{id}": {
        get: {
          summary: "Jedna innowacja",
          parameters: [{ name: "id", in: "path", required: true, schema: tekst }],
          responses: { 200: { description: "Innowacja", ...json(Innowacja) }, 404: { description: "Nie znaleziono" } },
        },
      },
      "/api/v1/nabory": {
        get: {
          summary: "Nabory grantowe ROPS",
          responses: { 200: { description: "Nabory", ...json({ type: "object", properties: { nabory: lista({ type: "object", properties: { id: tekst, nazwa: tekst, program: tekst, temat: tekst, otwartyOd: tekst, otwartyDo: tekst, otwarty: { type: "boolean" }, ostatniaZmiana: tekst } }) } }) } },
        },
      },
      "/api/v1/potrzeby": {
        get: {
          summary: "Zbiorcze statystyki potrzeb (12 miesięcy)",
          description: "Liczba zgłoszeń według obszaru Mapy Wyzwań i powiatu. Komórki z mniej niż 3 zgłoszeniami są ukryte.",
          responses: { 200: { description: "Statystyki", ...json({ type: "object", properties: { progUkrycia: { type: "integer" }, potrzeby: lista({ type: "object", properties: { obszar: tekst, powiat: tekst, liczba: { type: "integer" } } }) } }) } },
        },
      },
      "/api/v1/dopasuj": {
        post: {
          summary: "Matchmaking: opis problemu → propozycje innowacji",
          description: "Dane osobowe są maskowane przed wysłaniem do modelu AI. Treść opisu nie jest zapisywana. Limit: ok. 12 zapytań na minutę z jednego adresu.",
          requestBody: { required: true, ...json({ type: "object", required: ["tekst"], properties: { tekst: { type: "string", minLength: 3, maxLength: 1500 }, rola: { type: "string", enum: ["mieszkaniec", "instytucja", "organizacja"] }, powiat: tekst, jezyk: { type: "string", enum: ["pl", "uk", "en"] } } }) },
          responses: {
            200: { description: "Propozycje", ...json({ type: "object", properties: { tryb: { type: "string", enum: ["ai", "awaryjny"] }, obszar: tekst, potrzeby: lista(tekst), kryzys: { type: ["string", "null"] }, brakDopasowania: { type: "boolean" }, dopasowania: lista(Dopasowanie), najblizsze: lista(Dopasowanie), pytanie: { type: ["string", "null"] } } }) },
            400: { description: "Błędne dane" },
            429: { description: "Za dużo zapytań" },
          },
        },
      },
    },
    webhooks: Object.fromEntries(ZDARZENIA.map((z) => [z, {
      post: {
        summary: OPISY_ZDARZEN[z],
        description: "Nagłówki: X-Splot-Zdarzenie, X-Splot-Czas (sekundy Unix), X-Splot-Podpis: v1=HMAC-SHA256(sekret, `${czas}.${treść}`) w zapisie szesnastkowym.",
        requestBody: json({ type: "object", properties: { id: tekst, zdarzenie: { const: z }, czas: tekst, zrodlo: { const: "splot" }, dane: { type: "object", properties: { numerSprawy: { type: ["string", "null"] }, typ: tekst, tytul: { type: ["string", "null"] }, link: { type: ["string", "null"] } } } } }),
        responses: { 200: { description: "Odebrano" } },
      },
    }])),
  };
}
