import { sportmonksEndpoints, sportmonksIncludes } from "../endpoints";
import { normalizeFixture } from "../normalize/fixtures";
import { runSportmonksSync } from "./core";

export function syncFixtures(startDate = process.env.SPORTMONKS_FIXTURE_START_DATE, endDate = process.env.SPORTMONKS_FIXTURE_END_DATE) {
  const window = getFixtureWindow(startDate, endDate);

  return runSportmonksSync({
    entity: "fixtures",
    endpoint: sportmonksEndpoints.fixturesBetween(window.startDate, window.endDate),
    table: "fixtures",
    query: { include: sportmonksIncludes.fixtures },
    normalize: normalizeFixture
  });
}

function getFixtureWindow(startDate?: string, endDate?: string) {
  if (startDate && endDate) return { startDate, endDate };

  const now = new Date();
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 7);

  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() + 14);

  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10)
  };
}
