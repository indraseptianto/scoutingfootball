import { sportmonksEndpoints, sportmonksIncludes } from "../endpoints";
import { normalizeFixture } from "../normalize/fixtures";
import { runSportmonksSync } from "./core";

export function syncFixtures(startDate = process.env.SPORTMONKS_FIXTURE_START_DATE, endDate = process.env.SPORTMONKS_FIXTURE_END_DATE) {
  const endpoint = startDate && endDate ? sportmonksEndpoints.fixturesBetween(startDate, endDate) : sportmonksEndpoints.fixtures;

  return runSportmonksSync({
    entity: "fixtures",
    endpoint,
    table: "fixtures",
    query: { include: sportmonksIncludes.fixtures },
    normalize: normalizeFixture
  });
}
