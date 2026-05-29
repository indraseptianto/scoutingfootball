# PRD — ScoutFlow SportMonks Sync Layer
**Product Requirements Document | SportMonks API v3 Data Ingestion**

---

## 1. Overview

Sync layer pulls football data from SportMonks API v3 into Supabase for 5 target leagues across 3 seasons (15 season IDs total). All sync jobs are idempotent, use `upsert` on `sportmonks_id`, and write to `data_sync_logs` for observability.

**Key constraint:** API key must never reach the client. All SportMonks calls run server-side only (API routes, server actions, or cron).

---

## 2. Data Coverage

### 2.1 Target Leagues

| League | SportMonks ID | Country |
|--------|--------------|---------|
| Premier League | 8 | England |
| Championship | 9 | England |
| League One | 12 | England |
| League Two | 14 | England |
| La Liga | 564 | Spain |

### 2.2 Seasons (3 Years)

| Season Name | Season ID | League |
|------------|-----------|--------|
| 2023/2024 | 21646 | Premier League |
| 2024/2025 | 23614 | Premier League |
| 2025/2026 | 25583 | Premier League |
| 2023/2024 | 21689 | Championship |
| 2024/2025 | 23672 | Championship |
| 2025/2026 | 25648 | Championship |
| 2023/2024 | 21690 | League One |
| 2024/2025 | 23671 | League One |
| 2025/2026 | 25649 | League One |
| 2023/2024 | 21691 | League Two |
| 2024/2025 | 23673 | League Two |
| 2025/2026 | 25650 | League Two |
| 2023/2024 | 21694 | La Liga |
| 2024/2025 | 23621 | La Liga |
| 2025/2026 | 25659 | La Liga |

**Source of truth:** `src/lib/providers/sportmonks/season-config.json`

---

## 3. SportMonks API v3 Integration

### 3.1 Base URLs

```
Football API: https://api.sportmonks.com/v3/football
Core API:     https://api.sportmonks.com/v3/core
```

### 3.2 Authentication

`Authorization` header with raw token. Query-param `api_token` also accepted. Token stored in `SPORTMONKS_API_TOKEN` env var.

### 3.3 Rate Limiting

`src/lib/providers/sportmonks/rateLimit.ts` implements token-bucket wait. Default: conservative pacing to avoid 429.

### 3.4 Pagination

`sportmonksFetchPaginated` auto-follows `pagination.has_more`. Default `per_page=50`. `maxPages` option caps depth.

---

## 4. Sync Architecture

```
API Route /api/sync/[entity]  →  syncJobs[entity]  →  runSportmonksSync(core)
                                       ↓
                              sportmonksFetch / sportmonksFetchPaginated
                                       ↓
                              normalize()  →  supabase.from(table).upsert()
```

### 4.1 Core (`sync/core.ts`)

- `startSyncLog(entity)` → writes `data_sync_logs` row with `status=running`
- `runSportmonksSync(config)` → paginates endpoint, normalizes, upserts, finishes log
- `finishSyncLog(id, status, count, error?)` → updates final state

### 4.2 Normalize Layer

Every entity has a `normalize/<entity>.ts` that transforms SportMonks JSON into flat Supabase row shape with `sportmonks_id` as natural key.

### 4.3 Cache Layer

`src/lib/providers/sportmonks/cache.ts` provides in-memory LRU for identical API calls within a request lifecycle.

---

## 5. Sync Jobs Catalog

### 5.1 Static / Master Data

| Job | Endpoint | Table | Notes |
|-----|----------|-------|-------|
| `countries` | `GET /core/countries` | `countries` | Run once |
| `positions` | hardcoded array | `positions` | SportMonks has no positions endpoint; seed data used |
| `leagues` | `GET /football/leagues` | `leagues` | All leagues; target leagues filtered downstream |
| `seasons` | `GET /football/seasons` | `seasons` | All seasons; filtered by league later |
| `coaches` | `GET /football/coaches` | `coaches` | **NEW** |

### 5.2 Teams & Squads

| Job | Endpoint | Table | Notes |
|-----|----------|-------|-------|
| `teams` | `GET /football/teams/seasons/{seasonId}` | `clubs` + `club_season_memberships` | `allSeasons=true` param syncs all 15 seasons |
| `squads` | `GET /football/squads/seasons/{seasonId}/teams/{teamId}` | `squad_players` | Requires `club_season_memberships` to iterate |
| `players` | `GET /football/players` | `players` | Paginated; optional `page`/`maxPages` params |

### 5.3 Fixtures & Events

| Job | Endpoint | Table | Notes |
|-----|----------|-------|-------|
| `fixtures` | `GET /football/fixtures/between/{start}/{end}` | `fixtures` | Loops all 15 seasons with `fixtureSeasonId` filter |
| `fixture-events` | `GET /football/fixtures/{id}/events` | `fixture_events` | **NEW**; auto-runs on latest N fixtures if no `fixtureId` |
| `fixture-lineups` | `GET /football/fixtures/{id}/lineups` | `fixture_lineups` | **NEW**; same auto-run pattern |

### 5.4 Statistics

| Job | Endpoint | Table | Notes |
|-----|----------|-------|-------|
| `standings` | `GET /football/standings/seasons/{seasonId}` | `standings` | All 15 seasons |
| `team-statistics` | `GET /football/statistics/seasons/teams/{teamId}?season_id={sid}` | `team_statistics` | **NEW**; iterates `club_season_memberships` |
| `season-statistics` | `GET /football/statistics/seasons/players/{seasonId}` | `statistic_details` | All 15 seasons |
| `statistics` | `GET /football/fixtures/{id}?include=lineups.details.type` | `player_match_statistics` | Per-fixture player stats; limited to latest N fixtures |

### 5.5 Transfers

| Job | Endpoint | Table | Notes |
|-----|----------|-------|-------|
| `transfers` | `GET /football/transfers` | `transfers` | Paginated; optional page/maxPages |

---

## 6. API Routes

### 6.1 Manual Sync Trigger

```
POST /api/sync/{entity}
Headers: Authorization: Bearer {CRON_SECRET}
Body:    { teamId?, seasonId?, page?, maxPages?, fixtureId?, refresh? }
```

`entity` must be a key in `syncJobs`.

### 6.2 Cron Sync (Vercel Cron)

```
GET /api/cron/sync?entity={entity}&secret={CRON_SECRET}
```

Runs single job. Configured in `vercel.json`.

### 6.3 Entity-Specific Payloads

| Entity | Payload Field | Type |
|--------|--------------|------|
| `players`, `transfers` | `page`, `maxPages` | string/number |
| `squads` | `teamId`, `seasonId` | string |
| `standings`, `season-statistics` | `seasonId` | string |
| `statistics` | `seasonId`, `refresh` | string, boolean |
| `fixture-events`, `fixture-lineups` | `fixtureId` | string/number |
| all others | none | — |

---

## 7. Bug Fixes Applied

### 7.1 `/types` Endpoint 404

**Problem:** `sportmonksEndpoints.types = "/types"` resolved to `/v3/football/types` → 404.

**Fix:** Changed to `` `${SPORTMONKS_CORE_BASE_URL}/types` `` → `/v3/core/types` → 200.

### 7.2 Positions Sync

**Problem:** No dedicated `/positions` endpoint in SportMonks v3.

**Fix:** `syncPositions()` uses hardcoded array of 16 position records seeded directly to `positions` table.

### 7.3 Fixtures Season Filtering

**Problem:** Fetching all fixtures between two dates returns fixtures from every league globally.

**Fix:** Each fixture sync call adds `filters: fixtureSeasonId:{seasonId}` to scope to target season.

### 7.4 Team Statistics Endpoint

**Problem:** No bulk endpoint for all team stats in a season; must query per-team.

**Fix:** `syncTeamStatistics()` iterates `club_season_memberships` rows and calls `/statistics/seasons/teams/{teamId}?season_id={sid}` per membership.

---

## 8. Environment Variables

```
# Required
SPORTMONKS_API_TOKEN=3Kil...

# Optional
SPORTMONKS_TARGET_LEAGUE_NAMES=La Liga,Premier League,Championship,League One,League Two
SPORTMONKS_DEFAULT_TEAM_ID=
SPORTMONKS_DEFAULT_SEASON_ID=
SPORTMONKS_FIXTURE_START_DATE=   # ISO date override
SPORTMONKS_FIXTURE_END_DATE=     # ISO date override
SPORTMONKS_STATS_FIXTURE_LIMIT=  # Max fixtures per stats sync (default 10, max 25)

# Cron
CRON_SECRET=                     # Required for /api/sync/* and /api/cron/*
```

---

## 9. Database Schema

### 9.1 Tables (SportMonks-specific)

- `leagues` — upsert via `sportmonks_id`
- `seasons` — upsert via `sportmonks_id`
- `clubs` — upsert via `sportmonks_id`
- `club_season_memberships` — junction table; upsert via `(team_sportmonks_id, season_sportmonks_id)`
- `players` — upsert via `sportmonks_id`
- `squad_players` — upsert via `sportmonks_id`
- `fixtures` — upsert via `sportmonks_id`
- `fixture_events` — upsert via `sportmonks_id` **NEW**
- `fixture_lineups` — upsert via `sportmonks_id` **NEW**
- `standings` — upsert via composite (season + team)
- `statistic_details` — upsert via `sportmonks_id`
- `team_statistics` — upsert via `sportmonks_id` **NEW**
- `player_match_statistics` — upsert via `(fixture, player, team)`
- `transfers` — upsert via `sportmonks_id`
- `coaches` — upsert via `sportmonks_id` **NEW**
- `countries` — upsert via `sportmonks_id`
- `positions` — upsert via `sportmonks_id` (seeded, not API)
- `data_sync_logs` — audit log of every sync run

### 9.2 RLS

All tables have `authenticated` SELECT policies. Sync jobs use service role key (server-side only).

---

## 10. Runbook

### 10.1 Initial Full Sync Order

```
1. countries        → seed master data
2. positions        → seed master data
3. leagues          → fetch all leagues
4. seasons          → fetch all seasons
5. teams            → fetch all teams for all 15 seasons (allSeasons=true)
6. squads           → fetch squads per membership
7. players          → paginated full player dump
8. fixtures         → fetch fixtures per season
9. standings        → fetch standings per season
10. season-statistics → fetch player season stats per season
11. team-statistics   → fetch team stats per membership
12. transfers         → paginated transfer dump
13. fixture-events    → optional, per-fixture
14. fixture-lineups   → optional, per-fixture
15. statistics        → per-fixture player match stats (expensive, run last)
```

### 10.2 Daily Incremental

```
fixtures          → last 7 days + next 14 days
standings         → current season only
statistics        → latest 10 unsynced fixtures
transfers         → latest page
fixture-events    → latest 10 fixtures
fixture-lineups   → latest 10 fixtures
```

### 10.3 Trigger via curl

```bash
curl -X POST "https://your-domain.com/api/sync/teams" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"allSeasons":true}'
```

---

## 11. Future Work (Out of Scope for Now)

- Odds API integration (`/odds` endpoints)
- Widget API (live match widgets)
- Real-time webhook sync instead of poll-based
- Player injury / suspension tracking
- Coach-team history sync (`team_coaches` table exists but not populated)
