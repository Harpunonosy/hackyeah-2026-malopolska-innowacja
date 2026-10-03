-- Szybka aktualizacja Skarbnicy (PDF, moduł II): fakty z nowych raportów dodawane w Centrali (AI wyciąga, człowiek zatwierdza).
alter table fakty add column if not exists dodane_at timestamptz not null default now();
alter table fakty enable row level security;
alter table fakty add column if not exists dodany boolean not null default false;
