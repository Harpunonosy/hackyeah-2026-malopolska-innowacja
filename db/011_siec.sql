-- Sieć liderów innowacji (PDF §9): organizacje, które dołączyły przez formularz. Autorzy z Biblioteki są liczeni z katalogu.
-- E-mail kontaktowy widzi tylko ROPS; kontakt z liderem idzie przez Hub jako sprawa z numerem.
create table if not exists liderzy (
  id uuid primary key default gen_random_uuid(),
  nazwa text not null,
  sektor text not null check (sektor in ('ngo','samorzad','nauka','biznes','es','grupa')),
  powiat text,
  obszary text[] not null default '{}',
  oferuje text,
  szuka text,
  email text,
  status text not null default 'oczekuje' check (status in ('oczekuje','zatwierdzony','odrzucony')),
  created_at timestamptz not null default now()
);
create index if not exists liderzy_status_idx on liderzy (status, created_at desc);
alter table liderzy enable row level security;
