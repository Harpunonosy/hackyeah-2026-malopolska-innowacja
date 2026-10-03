-- Schemat Splot (z PLAN.md, rozdz. 12). Zastosuj: psql "$DATABASE_URL" -1 -f db/schema.sql
create extension if not exists vector;
create extension if not exists pg_trgm;

create type rola as enum ('mieszkaniec','organizacja','jst','ekspert','admin');
create type status_zgloszenia as enum ('wyslane','przeczytane','w_analizie','u_eksperta','potrzebne_info','odpowiedz','zamkniete');

create table uzytkownicy (
  id uuid primary key default gen_random_uuid(),
  rola rola not null default 'mieszkaniec',
  nazwa text, email text, telefon text,
  powiat text, gmina text, jezyk text default 'pl',
  ustawienia_dostepnosci jsonb default '{}'::jsonb,   -- tryb prosty, rozmiar, kontrast, czytanie na głos
  created_at timestamptz default now()
);

create table organizacje (
  id uuid primary key default gen_random_uuid(),
  nazwa text not null,
  typ text check (typ in ('ngo','gmina','powiat','cus','ops','dps','pes','szkola','firma','uczelnia')),
  powiat text, gmina text, lata_doswiadczenia int, obszary text[] default '{}'
);

create table obszary (id text primary key, nazwa text not null, dane jsonb);   -- 8 obszarów Mapy Wyzwań

create table innowacje (
  id text primary key,                                -- slug z Biblioteki ROPS
  nazwa text not null, kategoria text not null, obszary text[] default '{}',
  na_czym_polega text, problem text, grupa_docelowa text, kto_moze_skorzystac text, czy_to_dziala text,
  autor_organizacja text, upowszechniana_w text[] default '{}',
  film text, folder_pdf text, materialy_zip text, url text,
  gotowosc text default 'gotowe', tagi text[] default '{}',
  streszczenie text, streszczenie_etr text,          -- generowane przez AI, zatwierdzane
  embedding vector(1024),
  status text default 'opublikowana', zrodlo text default 'rops',
  updated_at timestamptz default now()
);
create index innowacje_trgm on innowacje using gin ((nazwa || ' ' || coalesce(problem,'') || ' ' || coalesce(grupa_docelowa,'') || ' ' || coalesce(na_czym_polega,'')) gin_trgm_ops);

create table zgloszenia (
  id uuid primary key default gen_random_uuid(),
  numer text unique,                                   -- np. SPL-2026-000123 (do śledzenia)
  autor_id uuid references uzytkownicy(id),
  kanal text default 'web' check (kanal in ('web','glos','asystowane','papier')),
  tresc_zamaskowana text not null,                     -- surowej treści z danymi osobowymi nie przechowujemy
  obszar text references obszary(id), tagi text[] default '{}', grupa_docelowa text,
  powiat text, gmina text,
  priorytet smallint default 2,                        -- 0 kryzys, 1 wysoki, 2 normalny, 3 niski
  kryzys boolean default false,
  status status_zgloszenia default 'wyslane',
  przypisane_do uuid references uzytkownicy(id),
  termin_sla timestamptz,
  najlepsze_dopasowanie smallint,                      -- 0–100, do białych plam
  zgoda_kontakt boolean default false, kanal_kontaktu text,
  syntetyczne boolean default false,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table dopasowania (
  zgloszenie_id uuid references zgloszenia(id) on delete cascade,
  innowacja_id text references innowacje(id),
  pozycja smallint, trafnosc smallint, dlaczego text, kto_moze_wdrozyc text, dowod text,
  ocena_uzytkownika smallint,                          -- 1 przydatne, -1 nieprzydatne
  primary key (zgloszenie_id, innowacja_id)
);

create table historia_statusu (
  id bigserial primary key, zgloszenie_id uuid references zgloszenia(id) on delete cascade,
  status status_zgloszenia, kto uuid references uzytkownicy(id), notatka text, at timestamptz default now()
);

create table fiszki (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid references uzytkownicy(id), organizacja_id uuid references organizacje(id),
  tytul text, opis text, istota text, dla_kogo text,
  etap text check (etap in ('pomysl','prototyp','przetestowane','gotowe')),
  kanwa jsonb default '{}'::jsonb,                     -- odpowiedzi wg data/kanwa_inno_agh.json
  wskazniki jsonb, ocena_wstepna jsonb, podobne jsonb, wizualizacja_url text,
  publiczna boolean default false, status text default 'robocza',
  created_at timestamptz default now()
);

create table nabory (
  id uuid primary key default gen_random_uuid(),
  nazwa text, program text, opis text, temat text,
  otwarty_od date, otwarty_do date, aktywny boolean default false,
  regulamin text, formularz jsonb, kryteria jsonb, przyklad boolean default true
);

create table wnioski (
  id uuid primary key default gen_random_uuid(),
  nabor_id uuid references nabory(id), fiszka_id uuid references fiszki(id),
  pola jsonb, status text default 'roboczy', created_at timestamptz default now()
);

create table plany_wdrozenia (
  id uuid primary key default gen_random_uuid(),
  innowacja_id text references innowacje(id), organizacja_id uuid references organizacje(id),
  profil jsonb, plan jsonb, kwalifikowalnosc jsonb, created_at timestamptz default now()
);

create table testy (
  id uuid primary key default gen_random_uuid(),
  fiszka_id uuid references fiszki(id), innowacja_id text references innowacje(id),
  tytul text, opis text, kogo_szukamy jsonb, powiat text, termin text, liczba_miejsc int,
  dostepnosc text, status text default 'otwarty'
);
create table testerzy (
  uzytkownik_id uuid primary key references uzytkownicy(id),
  grupa_wiekowa text, powiat text, zainteresowania text[], potrzeby_dostepnosci text[]
);
create table zapisy_testy (
  test_id uuid references testy(id) on delete cascade, uzytkownik_id uuid references uzytkownicy(id),
  status text default 'zapisany', primary key (test_id, uzytkownik_id)
);
create table opinie (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references testy(id), innowacja_id text references innowacje(id),
  autor_id uuid references uzytkownicy(id),
  ocena smallint check (ocena between 1 and 5), odpowiedzi jsonb, transkrypcja text, propozycja text,
  created_at timestamptz default now()
);

create table watki (
  id uuid primary key default gen_random_uuid(),
  typ text check (typ in ('zgloszenie','fiszka','innowacja','partnerstwo','pytanie')),
  obiekt_id text, temat text, created_at timestamptz default now()
);
create table wiadomosci (
  id uuid primary key default gen_random_uuid(),
  watek_id uuid references watki(id) on delete cascade, autor_id uuid references uzytkownicy(id),
  tresc text, wygenerowane_przez_ai boolean default false, created_at timestamptz default now()
);
create table eksperci (
  uzytkownik_id uuid primary key references uzytkownicy(id),
  dziedziny text[], obszary text[], opis text, dyzury text
);
create table partnerstwa (
  id uuid primary key default gen_random_uuid(),
  organizacja_id uuid references organizacje(id),
  szuka text check (szuka in ('taniej','dotrzec','wartosc')), obszar text, powiat text, opis text,
  created_at timestamptz default now()
);

create table powiadomienia (
  id bigserial primary key, uzytkownik_id uuid references uzytkownicy(id),
  typ text, tresc text, link text, kanal text default 'aplikacja',
  przeczytane_at timestamptz, created_at timestamptz default now()
);

create table ioss (
  wskaznik_id int, kategoria text, wskaznik text, rok int, powiat text, wartosc numeric,
  primary key (wskaznik_id, powiat, rok)
);
create table fakty (id serial primary key, temat text, tekst text, zrodlo text, strona int, url text, obszar text);
create table dziennik (id bigserial primary key, kto uuid, akcja text, obiekt text, szczegoly jsonb, at timestamptz default now());

-- RLS: klucz publiczny (anon) nie ma dostępu do niczego; aplikacja łączy się po stronie serwera.
alter table uzytkownicy enable row level security;
alter table organizacje enable row level security;
alter table obszary enable row level security;
alter table innowacje enable row level security;
alter table zgloszenia enable row level security;
alter table dopasowania enable row level security;
alter table historia_statusu enable row level security;
alter table fiszki enable row level security;
alter table nabory enable row level security;
alter table wnioski enable row level security;
alter table plany_wdrozenia enable row level security;
alter table testy enable row level security;
alter table testerzy enable row level security;
alter table zapisy_testy enable row level security;
alter table opinie enable row level security;
alter table watki enable row level security;
alter table wiadomosci enable row level security;
alter table eksperci enable row level security;
alter table partnerstwa enable row level security;
alter table powiadomienia enable row level security;
alter table ioss enable row level security;
alter table fakty enable row level security;
alter table dziennik enable row level security;
