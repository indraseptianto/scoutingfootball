import { asNumber, type SportmonksEntity } from "./common";

export function normalizePlayerStatistic(item: SportmonksEntity, seasonId?: number | string) {
  return {
    sportmonks_id: asNumber(item.id),
    player_sportmonks_id: asNumber(item.player_id),
    season_sportmonks_id: Number(seasonId ?? item.season_id),
    team_sportmonks_id: asNumber(item.team_id),
    raw: item
  };
}
