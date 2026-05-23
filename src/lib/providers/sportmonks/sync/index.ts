import { syncFixtures } from "./fixtures";
import { syncLeagues } from "./leagues";
import { syncPlayers } from "./players";
import { syncSeasons } from "./seasons";
import { syncSquads } from "./squads";
import { syncStandings } from "./standings";
import { syncStatistics } from "./statistics";
import { syncTeams } from "./teams";
import { syncTransfers } from "./transfers";

export const syncJobs = {
  leagues: syncLeagues,
  seasons: syncSeasons,
  teams: syncTeams,
  players: syncPlayers,
  squads: syncSquads,
  fixtures: syncFixtures,
  standings: syncStandings,
  transfers: syncTransfers,
  statistics: syncStatistics
} as const;

export type SyncEntity = keyof typeof syncJobs;

export function isSyncEntity(value: string): value is SyncEntity {
  return value in syncJobs;
}
