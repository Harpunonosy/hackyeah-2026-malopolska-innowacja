alter table testy add column if not exists obszar text, add column if not exists numer text, add column if not exists created_at timestamptz default now();
alter table zgloszenia add column if not exists zgoda_testy boolean default false;
alter table fiszki add column if not exists syntetyczne boolean default false, add column if not exists wyniki_testu text;
alter table partnerstwa add column if not exists numer text;
