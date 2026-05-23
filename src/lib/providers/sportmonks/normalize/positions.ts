import { asNumber, asString, type SportmonksEntity } from "./common";

export function normalizePosition(item: SportmonksEntity) {
  return {
    sportmonks_id: asNumber(item.id),
    name: asString(item.name) ?? "Unknown position",
    code: asString(item.code),
    developer_name: asString(item.developer_name),
    raw: item
  };
}
