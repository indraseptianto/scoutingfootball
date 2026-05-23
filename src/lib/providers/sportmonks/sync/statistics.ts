import { sportmonksEndpoints } from "../endpoints";
import { normalizePlayerStatistic } from "../normalize/statistics";
import { runSportmonksSync } from "./core";

export function syncStatistics(seasonId = process.env.SPORTMONKS_DEFAULT_SEASON_ID) {
  if (!seasonId) throw new Error("Sync statistics requires SPORTMONKS_DEFAULT_SEASON_ID or a seasonId payload.");

  return runSportmonksSync({
    entity: "statistics",
    endpoint: sportmonksEndpoints.playerSeasonStats(seasonId),
    table: "player_stats",
    normalize: (row) => normalizePlayerStatistic(row, seasonId)
  });
}
