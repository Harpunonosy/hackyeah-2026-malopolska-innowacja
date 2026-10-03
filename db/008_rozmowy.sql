alter table zgloszenia add column if not exists odpowiedz_na text;
create index if not exists zgloszenia_odp_na on zgloszenia (odpowiedz_na);
