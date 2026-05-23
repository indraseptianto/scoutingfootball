import { sportmonksEndpoints } from "../endpoints";
import { normalizeStanding } from "../normalize/standings";
import { runSportmonksSync } from "./core";

export function syncStandings(seasonId = process.env.SPORTMONKS_DEFAULT_SEASON_ID) {
  if (!seasonId) throw new Error("Sync standings requires SPORTMONKS_DEFAULT_SEASON_ID or a seasonId payload.");

  return runSportmonksSync({
    entity: "standings",
    endpoint: sportmonksEndpoints.standingsBySeason(seasonId),
    table: "standings",
    normalize: (row) => normalizeStanding(row, seasonId)
  });
}
