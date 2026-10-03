-- Struktura formularza i kryteriów konkretnego naboru, używana przez Centralę
-- oraz generator wniosku. NULL zachowuje domyślny schemat IWS w aplikacji.
-- Dotychczas kolumny brakowało w wersjonowanych migracjach.
alter table nabory add column if not exists schemat jsonb;
