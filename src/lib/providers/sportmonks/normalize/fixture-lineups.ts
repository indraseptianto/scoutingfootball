import { asNumber, asString, type SportmonksEntity } from "./common";

export function normalizeFixtureLineup(item: SportmonksEntity) {
  return {
    sportmonks_id: asNumber(item.id),
    fixture_sportmonks_id: asNumber(item.fixture_id),
    team_sportmonks_id: asNumber(item.team_id),
    player_sportmonks_id: asNumber(item.player_id),
    position_sportmonks_id: asNumber(item.position_id),
    formation_position: asNumber(item.formation_position),
    shirt_number: asNumber(item.shirt_number),
    type_name: asString(item.type_name),
    captain: typeof item.captain === "boolean" ? item.captain : null,
    raw: item
  };
}
