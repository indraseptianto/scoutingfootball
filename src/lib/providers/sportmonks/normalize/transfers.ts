import { asBoolean, asDate, asNumber, asString, type SportmonksEntity } from "./common";

export function normalizeTransfer(item: SportmonksEntity, source = "latest") {
  const type = item.type as SportmonksEntity | undefined;
  const amount = item.amount as SportmonksEntity | string | number | null | undefined;
  const amountRecord = amount && typeof amount === "object" && !Array.isArray(amount) ? amount as SportmonksEntity : {};

  return {
    sportmonks_id: asNumber(item.id),
    player_sportmonks_id: asNumber(item.player_id),
    from_team_sportmonks_id: asNumber(item.from_team_id),
    to_team_sportmonks_id: asNumber(item.to_team_id),
    transfer_date: asDate(item.date),
    type_name: asString(item.type) ?? asString(type?.name) ?? asString(type?.developer_name),
    position_sportmonks_id: asNumber(item.position_id),
    detailed_position_sportmonks_id: asNumber(item.detailed_position_id),
    completed: asBoolean(item.completed),
    completed_at: asDate(item.completed_at),
    career_ended: asBoolean(item.career_ended),
    amount: asNumber(amount) ?? asNumber(amountRecord.value) ?? asNumber(amountRecord.amount),
    currency: asString(amountRecord.currency) ?? asString(item.currency),
    transfer_source: source,
    raw: item
  };
}
