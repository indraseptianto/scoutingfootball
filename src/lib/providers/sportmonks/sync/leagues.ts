import { sportmonksEndpoints } from "../endpoints";
import { normalizeLeague } from "../normalize/leagues";
import { runSportmonksSync } from "./core";

export function syncLeagues() {
  return runSportmonksSync({
    entity: "leagues",
    endpoint: sportmonksEndpoints.leagues,
    table: "leagues",
    normalize: normalizeLeague
  });
}
