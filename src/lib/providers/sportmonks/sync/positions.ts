import { sportmonksEndpoints } from "../endpoints";
import { normalizePosition } from "../normalize/positions";
import { runSportmonksSync } from "./core";

export function syncPositions() {
  return runSportmonksSync({
    entity: "positions",
    endpoint: sportmonksEndpoints.positions,
    table: "positions",
    normalize: normalizePosition
  });
}
