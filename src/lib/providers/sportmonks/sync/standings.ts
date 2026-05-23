import { sportmonksEndpoints } from "../endpoints";
import { normalizeStanding } from "../normalize/standings";
import { runSportmonksSync, type SyncJobResult } from "./core";
import { getTargetCurrentSeasonIds } from "./teams";

export async function syncStandings(seasonId = process.env.SPORTMONKS_DEFAULT_SEASON_ID) {
  if (seasonId) {
    return runSportmonksSync({
      entity: "standings",
      endpoint: sportmonksEndpoints.standingsBySeason(seasonId),
      table: "standings",
      normalize: (row) => normalizeStanding(row, seasonId)
    });
  }

  const seasons = await getTargetCurrentSeasonIds();
  const results: SyncJobResult[] = [];
  for (const season of seasons) {
    results.push(
      await runSportmonksSync({
        entity: `standings:${season.seasonId}`,
        endpoint: sportmonksEndpoints.standingsBySeason(season.seasonId),
        table: "standings",
        normalize: (row) => normalizeStanding(row, season.seasonId)
      })
    );
  }

  const failed = results.find((result) => result.status === "failed");
  return {
    entity: "standings",
    status: failed ? "failed" : "success",
    recordsProcessed: results.reduce((sum, result) => sum + result.recordsProcessed, 0),
    error: failed?.error
  } satisfies SyncJobResult;
}
