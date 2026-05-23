import { asNumber, asString, type SportmonksEntity } from "./common";

export function normalizeTeam(item: SportmonksEntity) {
  return {
    sportmonks_id: asNumber(item.id),
    name: asString(item.name) ?? "Unknown club",
    short_code: asString(item.short_code),
    country_id: asNumber(item.country_id),
    founded: asNumber(item.founded),
    image_path: asString(item.image_path),
    raw: item
  };
}
