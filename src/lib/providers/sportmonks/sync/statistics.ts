import { sportmonksEndpoints } from "../endpoints";
import { normalizePlayerStatistic } from "../normalize/statistics";
import { runSportmonksSync, type SyncJobResult } from "./core";
import { getTargetCurrentSeasonIds } from "./teams";

export async function syncStatistics(seasonId = process.env.SPORTMONKS_DEFAULT_SEASON_ID) {
  if (seasonId) {
    return runSportmonksSync({
      entity: "statistics",
      endpoint: sportmonksEndpoints.playerSeasonStats(seasonId),
      table: "player_stats",
      normalize: (row) => normalizePlayerStatistic(row, seasonId)
    });
  }

  const seasons = await getTargetCurrentSeasonIds();
  const results: SyncJobResult[] = [];
  for (const season of seasons) {
    results.push(
      await runSportmonksSync({
        entity: `statistics:${season.seasonId}`,
        endpoint: sportmonksEndpoints.playerSeasonStats(season.seasonId),
        table: "player_stats",
        normalize: (row) => normalizePlayerStatistic(row, season.seasonId)
      })
    );
  }

  const failed = results.find((result) => result.status === "failed");
  return {
    entity: "statistics",
    status: failed ? "failed" : "success",
    recordsProcessed: results.reduce((sum, result) => sum + result.recordsProcessed, 0),
    error: failed?.error
  } satisfies SyncJobResult;
}
