-- Wspólny model "sprawy": każde zgłoszenie (problem, pomysł, pytanie, wniosek, zapis, ogłoszenie) ma numer, wątek i oś czasu.
alter table zgloszenia
  add column if not exists typ text not null default 'problem',
  add column if not exists tytul text,
  add column if not exists obiekt_id text,
  add column if not exists pierwsza_odpowiedz_at timestamptz;
create index if not exists zgloszenia_typ_idx on zgloszenia (typ, created_at desc);

-- Magistrala powiadomień: adresat 'rops' (Centrala) albo 'autor' (po numerze sprawy / e-mailu). E-mail i SMS są w MVP symulowane.
alter table powiadomienia
  add column if not exists adresat text not null default 'autor',
  add column if not exists numer_sprawy text,
  add column if not exists tytul text,
  add column if not exists symulowane boolean not null default true;
create index if not exists powiadomienia_adresat_idx on powiadomienia (adresat, created_at desc);
create index if not exists powiadomienia_numer_idx on powiadomienia (numer_sprawy);

-- Rozszerzenia fiszek i naborów (galeria, nabór na miarę).
alter table fiszki add column if not exists numer text, add column if not exists powiat text, add column if not exists asystent jsonb;
alter table nabory add column if not exists zmiana_at timestamptz default now();
