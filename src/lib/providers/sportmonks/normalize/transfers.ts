import { asDate, asNumber, asString, type SportmonksEntity } from "./common";

export function normalizeTransfer(item: SportmonksEntity) {
  return {
    sportmonks_id: asNumber(item.id),
    player_sportmonks_id: asNumber(item.player_id),
    from_team_sportmonks_id: asNumber(item.from_team_id),
    to_team_sportmonks_id: asNumber(item.to_team_id),
    transfer_date: asDate(item.date),
    type_name: asString(item.type),
    raw: item
  };
}
