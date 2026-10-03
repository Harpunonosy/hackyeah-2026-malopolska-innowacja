-- Integracje: webhooki z podpisem HMAC (nowe zgłoszenie, nowy pomysł, zmiana naboru) i dziennik dostaw.
-- W dzienniku nie zapisujemy treści wiadomości, tylko zdarzenie, wynik i czas.
create table if not exists webhooki (
  id uuid primary key default gen_random_uuid(),
  nazwa text not null,
  url text not null,
  sekret text not null,
  zdarzenia text[] not null,
  aktywny boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists webhooki_dostawy (
  id bigserial primary key,
  webhook_id uuid not null references webhooki(id) on delete cascade,
  zdarzenie text not null,
  status_http int,
  czas_ms int,
  blad text,
  created_at timestamptz not null default now()
);
create index if not exists webhooki_dostawy_idx on webhooki_dostawy (webhook_id, created_at desc);
alter table webhooki enable row level security;
alter table webhooki_dostawy enable row level security;

-- Wnioski grantowe: decyzja i eksport do bazy grantowej (W-35).
alter table wnioski add column if not exists decyzja text, add column if not exists decyzja_at timestamptz, add column if not exists eksport_at timestamptz;
alter table wnioski add column if not exists etapy jsonb not null default '{}'::jsonb;
