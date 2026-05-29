import { asNumber, asString, type SportmonksEntity } from "./common";

export function normalizeFixtureEvent(item: SportmonksEntity) {
  return {
    sportmonks_id: asNumber(item.id),
    fixture_sportmonks_id: asNumber(item.fixture_id),
    team_sportmonks_id: asNumber(item.team_id),
    player_sportmonks_id: asNumber(item.player_id),
    related_player_sportmonks_id: asNumber(item.related_player_id),
    type_sportmonks_id: asNumber(item.type_id),
    minute: asNumber(item.minute),
    extra_minute: asNumber(item.extra_minute),
    result: asString(item.result),
    info: asString(item.info),
    raw: item
  };
}
