import { syncCountries } from "./countries";
import { syncFixtures } from "./fixtures";
import { syncLeagues } from "./leagues";
import { syncPlayers } from "./players";
import { syncPositions } from "./positions";
import { syncSeasons } from "./seasons";
import { syncSeasonStatistics } from "./season-statistics";
import { syncSquads } from "./squads";
import { syncStandings } from "./standings";
import { syncStatistics } from "./statistics";
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
  "season-statistics": syncSeasonStatistics,
  statistics: syncStatistics
} as const;

export type SyncEntity = keyof typeof syncJobs;

export function isSyncEntity(value: string): value is SyncEntity {
  return value in syncJobs;
}
