import { sportmonksEndpoints } from "../endpoints";
import { normalizeStanding } from "../normalize/standings";
import { runSportmonksSync } from "./core";

const TARGET_SEASONS = [
  21646, 23614, 25583,  // PL
  21689, 23672, 25648,  // Championship
  21690, 23671, 25649,  // League One
  21691, 23673, 25650,  // League Two
  21694, 23621, 25659,  // La Liga
];

export async function syncStandings() {
  const results = [];
  for (const seasonId of TARGET_SEASONS) {
    const result = await runSportmonksSync({
      entity: `standings:season:${seasonId}`,
      endpoint: sportmonksEndpoints.standingsBySeason(seasonId),
      table: "standings",
      normalize: normalizeStanding
    });
    results.push(result);
  }
  return results;
}
