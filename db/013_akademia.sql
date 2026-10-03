-- Oryginalne lekcje z data/akademia.json są bazą; zapisujemy tylko nadpisania i nowe lekcje.
-- Szkic jest niezależny od publicznej wersji. Publikacja oraz dziennik w jednej transakcji.
create table if not exists akademia_lekcje (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 100),
  szkic jsonb not null check (jsonb_typeof(szkic) = 'object' and szkic->>'slug' = slug),
  opublikowana jsonb check (opublikowana is null or (jsonb_typeof(opublikowana) = 'object' and opublikowana->>'slug' = slug)),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  check ((opublikowana is null) = (published_at is null))
);

-- Bez publicznych policies: dostęp wyłącznie przez backend z rolą właściciela.
-- Szkice nie mogą być odczytane przez Supabase anon/authenticated.
alter table akademia_lekcje enable row level security;
