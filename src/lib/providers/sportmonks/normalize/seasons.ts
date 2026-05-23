import { asNumber, asString, type SportmonksEntity } from "./common";

export function normalizeSeason(item: SportmonksEntity) {
  return {
    sportmonks_id: asNumber(item.id),
    league_sportmonks_id: asNumber(item.league_id),
    name: asString(item.name) ?? "Unknown season",
    raw: item
  };
}
