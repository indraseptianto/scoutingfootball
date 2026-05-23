import { asDate, asNumber, asString, type SportmonksEntity } from "./common";

export function normalizePlayer(item: SportmonksEntity) {
  const position = item.position as SportmonksEntity | undefined;
  const nationality = item.nationality as SportmonksEntity | undefined;

  return {
    sportmonks_id: asNumber(item.id),
    display_name: asString(item.display_name) ?? asString(item.name) ?? "Unknown player",
    firstname: asString(item.firstname),
    lastname: asString(item.lastname),
    date_of_birth: asDate(item.date_of_birth),
    gender: asString(item.gender),
    image_path: asString(item.image_path),
    height: asNumber(item.height),
    weight: asNumber(item.weight),
    position_name: position ? asString(position.name) : null,
    nationality_name: nationality ? asString(nationality.name) : null,
    raw: item
  };
}
