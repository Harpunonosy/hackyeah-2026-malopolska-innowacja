-- Rynek: wątki dwustronne, eksperci, tablica partnerstw.
alter table wiadomosci add column if not exists od text default 'rops';
alter table partnerstwa add column if not exists tytul text, add column if not exists syntetyczne boolean default false;
alter table eksperci add column if not exists nazwa text;
