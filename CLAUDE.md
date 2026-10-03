@AGENTS.md

# Splot (HackYeah 2026, HubMI)

- Plan, dane i decyzje: `PLAN.md` (rozdz. 1a i 1b nadpisują resztę). Interfejs po polsku, proste zdania.
- Dostępność jest kryterium oceny (20%): WCAG 2.1 AA, cele dotykowe min. 48 px, widoczny fokus, brak `maximum-scale`, każda ikona z tekstem. Nowe teksty do `messages/pl.json` (next-intl), nie na sztywno w komponentach.
- Dane osobowe: do modelu AI idzie tylko tekst po `lib/maskowanie.ts`. W logach nie zapisujemy treści zgłoszeń. Dane demo są syntetyczne.
- Sekrety tylko w `.env.local`. Repozytorium ma pozostać prywatne (umowa: utwór nieopublikowany).
- Model AI wywołujemy wyłącznie przez `lib/ai.ts` (`zapytajJson`, strukturalne wyjście zod).
- Licencje zależności: tylko MIT/Apache/BSD/ISC (wykaz jest elementem umowy).
