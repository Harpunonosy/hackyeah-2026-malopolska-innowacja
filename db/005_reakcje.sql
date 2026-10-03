-- Anonimowe reakcje "To mi pomoże" / "To nie to" przy wynikach Swatki: z nich powstaje "Co pomogło innym".
create table if not exists reakcje (
  id bigserial primary key,
  innowacja_id text not null,
  obszar text,
  wartosc smallint not null check (wartosc in (-1, 1)),
  syntetyczne boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reakcje_obszar_idx on reakcje (obszar, innowacja_id);
alter table reakcje enable row level security;
