import { sportmonksEndpoints, sportmonksIncludes } from "../endpoints";
import { normalizeFixture } from "../normalize/fixtures";
import { runSportmonksSync } from "./core";

const TARGET_SEASONS = [
  // Premier League
  { seasonId: 21646, leagueId: 8, name: "2023/24 PL" },
  { seasonId: 23614, leagueId: 8, name: "2024/25 PL" },
  { seasonId: 25583, leagueId: 8, name: "2025/26 PL" },
  // Championship
  { seasonId: 21689, leagueId: 9, name: "2023/24 CH" },
  { seasonId: 23672, leagueId: 9, name: "2024/25 CH" },
  { seasonId: 25648, leagueId: 9, name: "2025/26 CH" },
  // League One
  { seasonId: 21690, leagueId: 12, name: "2023/24 L1" },
  { seasonId: 23671, leagueId: 12, name: "2024/25 L1" },
  { seasonId: 25649, leagueId: 12, name: "2025/26 L1" },
  // League Two
  { seasonId: 21691, leagueId: 14, name: "2023/24 L2" },
  { seasonId: 23673, leagueId: 14, name: "2024/25 L2" },
  { seasonId: 25650, leagueId: 14, name: "2025/26 L2" },
  // La Liga
  { seasonId: 21694, leagueId: 564, name: "2023/24 LL" },
  { seasonId: 23621, leagueId: 564, name: "2024/25 LL" },
  { seasonId: 25659, leagueId: 564, name: "2025/26 LL" },
];

export async function syncFixtures() {
  const results = [];
  for (const target of TARGET_SEASONS) {
    const startDate = target.name.includes("2023") ? "2023-08-01" :
                      target.name.includes("2024") ? "2024-08-01" : "2025-08-01";
    const endDate = target.name.includes("2023") ? "2024-07-31" :
                    target.name.includes("2024") ? "2025-07-31" : "2026-07-31";

    const result = await runSportmonksSync({
      entity: `fixtures:${target.name}`,
      endpoint: sportmonksEndpoints.fixturesBetween(startDate, endDate),
      table: "fixtures",
      query: {
        include: sportmonksIncludes.fixtures,
        filters: `fixtureSeasonId:${target.seasonId}`
      },
      normalize: normalizeFixture
    });
    results.push(result);
  }
  return results;
}
