import { asNumber, asString, type SportmonksEntity } from "./common";

export function normalizeCountry(item: SportmonksEntity) {
  return {
    sportmonks_id: asNumber(item.id),
    name: asString(item.name) ?? "Unknown country",
    iso2: asString(item.iso2),
    iso3: asString(item.iso3),
    raw: item
  };
}
