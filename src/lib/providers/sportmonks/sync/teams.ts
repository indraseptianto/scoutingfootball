import { sportmonksEndpoints } from "../endpoints";
import { normalizeTeam } from "../normalize/teams";
import { runSportmonksSync } from "./core";

export function syncTeams() {
  return runSportmonksSync({
    entity: "teams",
    endpoint: sportmonksEndpoints.teams,
    table: "clubs",
    query: { include: "country;league;activeseason;statistics.season" },
    normalize: normalizeTeam
  });
}
