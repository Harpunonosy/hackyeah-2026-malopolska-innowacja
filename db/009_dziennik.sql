-- Dziennik zmian treści: kto, co, kiedy (tabela z schema.sql, rozszerzona o opis i tekstowego autora).
alter table dziennik alter column kto type text using kto::text;
alter table dziennik alter column kto set default 'admin';
alter table dziennik add column if not exists opis text;
