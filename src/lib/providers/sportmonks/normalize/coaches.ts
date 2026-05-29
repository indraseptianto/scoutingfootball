import { asDate, asNumber, asString, type SportmonksEntity } from "./common";

export function normalizeCoach(item: SportmonksEntity) {
  return {
    sportmonks_id: asNumber(item.id),
    display_name: asString(item.display_name) ?? asString(item.name) ?? "Unknown coach",
    firstname: asString(item.firstname),
    lastname: asString(item.lastname),
    date_of_birth: asDate(item.date_of_birth),
    gender: asString(item.gender),
    image_path: asString(item.image_path),
    country_sportmonks_id: asNumber(item.country_id),
    raw: item
  };
}
