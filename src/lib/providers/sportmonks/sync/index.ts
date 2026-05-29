import { syncCoaches } from "./coaches";
import { syncCountries } from "./countries";
import { syncFixtureEvents } from "./fixture-events";
import { syncFixtureLineups } from "./fixture-lineups";
import { syncFixtures } from "./fixtures";
import { syncLeagues } from "./leagues";
import { syncPlayers } from "./players";
import { syncPositions } from "./positions";
import { syncSeasons } from "./seasons";
import { syncSeasonStatistics } from "./season-statistics";
import { syncSquads } from "./squads";
import { syncStandings } from "./standings";
import { syncStatistics } from "./statistics";
import { syncTeamStatistics } from "./team-statistics";
import { syncTeams } from "./teams";
import { syncTransfers } from "./transfers";

export const syncJobs = {
  countries: syncCountries,
  positions: syncPositions,
  leagues: syncLeagues,
  seasons: syncSeasons,
  teams: syncTeams,
  players: syncPlayers,
  squads: syncSquads,
  fixtures: syncFixtures,
  standings: syncStandings,
  transfers: syncTransfers,
  coaches: syncCoaches,
  "fixture-events": syncFixtureEvents,
  "fixture-lineups": syncFixtureLineups,
  "team-statistics": syncTeamStatistics,
  "season-statistics": syncSeasonStatistics,
  statistics: syncStatistics
} as const;

export type SyncEntity = keyof typeof syncJobs;

export function isSyncEntity(value: string): value is SyncEntity {
  return value in syncJobs;
}
