import { sportmonksEndpoints } from "../endpoints";
import { normalizeSeason } from "../normalize/seasons";
import { runSportmonksSync } from "./core";

export function syncSeasons() {
  return runSportmonksSync({
    entity: "seasons",
    endpoint: sportmonksEndpoints.seasons,
    table: "seasons",
    normalize: normalizeSeason
  });
}
