import { asNumber, asString, type SportmonksEntity } from "./common";

export function normalizeStanding(item: SportmonksEntity, seasonId?: number | string) {
  return {
    sportmonks_id: asNumber(item.id),
    season_sportmonks_id: Number(seasonId ?? item.season_id),
    team_sportmonks_id: asNumber(item.participant_id),
    position: asNumber(item.position),
    points: asNumber(item.points),
    result: asString(item.result),
    raw: item
  };
}
