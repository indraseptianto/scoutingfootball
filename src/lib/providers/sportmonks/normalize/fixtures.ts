import { asDate, asNumber, asString, type SportmonksEntity } from "./common";

export function normalizeFixture(item: SportmonksEntity) {
  return {
    sportmonks_id: asNumber(item.id),
    league_sportmonks_id: asNumber(item.league_id),
    season_sportmonks_id: asNumber(item.season_id),
    name: asString(item.name),
    starting_at: asDate(item.starting_at),
    result_info: asString(item.result_info),
    raw: item
  };
}
