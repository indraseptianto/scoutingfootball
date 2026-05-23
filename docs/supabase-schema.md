# Supabase Schema

ScoutFlow AI stores Sportmonks Football API v3 data as canonical, cached tables in Supabase. The API token stays server-side; the UI reads from Supabase.

## Migration Order

Run these in order on a fresh Supabase project:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_target_league_sync.sql`
3. `supabase/migrations/003_sportmonks_end_to_end_schema.sql`

## Covered Sportmonks Areas

- Geography: countries, continents, regions, cities, venues
- Competition structure: leagues, seasons, stages, rounds
- Teams: clubs, club-season memberships, coaches
- Players: players, squads, player team history, player stats
- Fixtures: fixtures, participants, scores, states, events, lineups
- Tables: standings
- Transfers: transfers
- Statistics: statistic details, Sportmonks type reference
- Operations: sync logs and API cache
- Product workflow: profiles, shortlists, watchlist, scout notes, AI reports, subscriptions

## Target Leagues

The migration seeds:

- La Liga
- Premier League
- Championship
- League One
- League Two

League IDs can be corrected later if Sportmonks returns different IDs in your plan. The sync layer still prefers API data over hardcoded names.
