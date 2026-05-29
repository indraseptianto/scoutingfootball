import { sportmonksEndpoints } from "../endpoints";
import { normalizeCoach } from "../normalize/coaches";
import { runSportmonksSync } from "./core";

export function syncCoaches() {
  return runSportmonksSync({
    entity: "coaches",
    endpoint: sportmonksEndpoints.coaches,
    table: "coaches",
    normalize: normalizeCoach
  });
}
