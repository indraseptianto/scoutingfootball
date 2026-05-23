import { asNumber, asString, type SportmonksEntity } from "./common";

export function normalizeLeague(item: SportmonksEntity) {
  return {
    sportmonks_id: asNumber(item.id),
    name: asString(item.name) ?? "Unknown league",
    short_code: asString(item.short_code),
    image_path: asString(item.image_path),
    country_id: asNumber(item.country_id),
    raw: item
  };
}
