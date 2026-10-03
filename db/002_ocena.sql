-- Ocena AI zgłoszenia, szkic odpowiedzi i ocena pomocy przez autora.
alter table zgloszenia
  add column if not exists streszczenie text,
  add column if not exists ocena_ai jsonb,
  add column if not exists szkic_odpowiedzi text,
  add column if not exists ocena_pomocy smallint,
  add column if not exists przeczytane_at timestamptz;
create index if not exists zgloszenia_created_idx on zgloszenia (created_at desc);
create index if not exists historia_zgl_idx on historia_statusu (zgloszenie_id, at);
