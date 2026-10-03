alter table zgloszenia add column if not exists ekspert_id uuid;
alter table wiadomosci add column if not exists nadawca text;
create index if not exists zgloszenia_ekspert_idx on zgloszenia (ekspert_id);
