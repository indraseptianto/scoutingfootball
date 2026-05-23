import { sportmonksEndpoints, sportmonksIncludes } from "../endpoints";
import { normalizeSquadPlayer } from "../normalize/squads";
import { runSportmonksSync } from "./core";

export function syncSquads(teamId = process.env.SPORTMONKS_DEFAULT_TEAM_ID, seasonId = process.env.SPORTMONKS_DEFAULT_SEASON_ID) {
  if (!teamId) throw new Error("Sync squads requires SPORTMONKS_DEFAULT_TEAM_ID or a teamId payload.");

  return runSportmonksSync({
    entity: "squads",
    endpoint: seasonId ? sportmonksEndpoints.squadsBySeasonTeam(seasonId, teamId) : sportmonksEndpoints.squadsByTeam(teamId),
    table: "squad_players",
    query: { include: sportmonksIncludes.squad },
    normalize: (row) => normalizeSquadPlayer(row, teamId, seasonId)
  });
}
