# Sportmonks Ingestion Plan

Target leagues for the Starter trial:

- La Liga
- Premier League
- Championship
- League One
- League Two

The app uses Sportmonks Football API v3 only. Data should be synced from official API endpoints into Supabase and served from Supabase to the UI.

## Recommended Order

Manual sync endpoints require:

```txt
Authorization: Bearer $CRON_SECRET
```

1. `POST /api/sync/countries`
2. `POST /api/sync/positions`
3. `POST /api/sync/leagues`
4. `POST /api/sync/seasons`
5. `POST /api/sync/teams`
6. `POST /api/sync/squads`
7. `POST /api/sync/statistics`
8. `POST /api/sync/fixtures`
9. `POST /api/sync/standings`
10. `POST /api/sync/transfers`

`teams` reads the current seasons for `SPORTMONKS_TARGET_LEAGUE_NAMES` from Supabase and then calls `GET /teams/seasons/{seasonId}`.

`squads` reads the stored club-season memberships and calls `GET /squads/seasons/{seasonId}/teams/{teamId}`. Included player data is upserted into `players`, so the app avoids a broad `/players` sync during the trial.

`statistics` loops over the current seasons for the five target leagues.

## Cron

The checked-in Vercel cron is intentionally conservative for Hobby/Free plans:

- `daily-reference`: countries, positions, leagues, seasons, teams
- `daily-market`: squads, fixtures, standings, transfers, statistics

This app is scouting/recruitment intelligence, not livescore. Fixtures and standings should be refreshed at most one or two times per day for the MVP unless you upgrade the plan.
