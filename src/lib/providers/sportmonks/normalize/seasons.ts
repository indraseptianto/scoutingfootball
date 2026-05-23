import { asBoolean, asDate, asNumber, asString, type SportmonksEntity } from "./common";

export function normalizeSeason(item: SportmonksEntity) {
  return {
    sportmonks_id: asNumber(item.id),
    league_sportmonks_id: asNumber(item.league_id),
    name: asString(item.name) ?? "Unknown season",
    is_current: asBoolean(item.is_current),
    starting_at: asDate(item.starting_at),
    ending_at: asDate(item.ending_at),
    raw: item
  };
}
