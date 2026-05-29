import { asNumber, type SportmonksEntity } from "./common";

export function normalizeTeamStatistic(item: SportmonksEntity) {
  return {
    sportmonks_id: asNumber(item.id),
    team_sportmonks_id: asNumber(item.team_id),
    season_sportmonks_id: asNumber(item.season_id),
    fixture_sportmonks_id: asNumber(item.fixture_id),
    raw: item
  };
}
