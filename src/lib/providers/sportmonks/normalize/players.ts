import { asDate, asNumber, asString, type SportmonksEntity } from "./common";

export function normalizePlayer(item: SportmonksEntity) {
  const position = item.position as SportmonksEntity | undefined;
  const detailedPosition = item.detailedPosition as SportmonksEntity | undefined;
  const nationality = item.nationality as SportmonksEntity | undefined;
  const country = item.country as SportmonksEntity | undefined;
  const metadata = Array.isArray(item.metadata) ? item.metadata as SportmonksEntity[] : [];
  const preferredFoot =
    metadataValue(metadata, ["preferred foot", "preferred_foot", "foot", "footed"]) ??
    asString(item.preferred_foot);
  const metadataHeight = asNumber(metadataValue(metadata, ["height"]));
  const metadataWeight = asNumber(metadataValue(metadata, ["weight"]));

  return {
    sportmonks_id: asNumber(item.id),
    display_name: asString(item.display_name) ?? asString(item.name) ?? "Unknown player",
    firstname: asString(item.firstname),
    lastname: asString(item.lastname),
    date_of_birth: asDate(item.date_of_birth),
    gender: asString(item.gender),
    image_path: asString(item.image_path),
    height: asNumber(item.height) ?? metadataHeight,
    weight: asNumber(item.weight) ?? metadataWeight,
    preferred_foot: preferredFoot,
    contract_expires_at: findContractDate(item) ?? asDate(metadataValue(metadata, ["contract until", "contract expires", "contract end", "contract"])),
    country_sportmonks_id: asNumber(item.country_id) ?? (country ? asNumber(country.id) : null),
    position_sportmonks_id: asNumber(item.position_id) ?? (position ? asNumber(position.id) : null),
    detailed_position_sportmonks_id: asNumber(item.detailed_position_id) ?? (detailedPosition ? asNumber(detailedPosition.id) : null),
    position_name: position ? asString(position.name) : null,
    nationality_name: nationality ? asString(nationality.name) : null,
    raw: item
  };
}

function metadataValue(metadata: SportmonksEntity[], names: string[]) {
  const normalized = names.map((name) => name.toLowerCase());
  for (const item of metadata) {
    const type = item.type as SportmonksEntity | undefined;
    const keys = [
      asString(item.name),
      asString(item.code),
      asString(item.developer_name),
      asString(type?.name),
      asString(type?.code),
      asString(type?.developer_name)
    ].filter(Boolean).map((value) => String(value).toLowerCase());

    if (keys.some((key) => normalized.some((name) => key.includes(name)))) {
      return firstScalar(item.value) ?? firstScalar(item.data) ?? firstScalar(item.description);
    }
  }
  return null;
}

function findContractDate(value: unknown): string | null {
  const date = findDateByKey(value, [
    "contract_expires_at",
    "contract_until",
    "contract_end",
    "contract_end_date",
    "contract_expiry",
    "contract_expiry_date",
    "contract_expiration",
    "contract_expiration_date",
    "contract_to",
    "end_date",
    "expires_at",
    "expiry_date"
  ]);
  return date ? asDate(date) : null;
}

function findDateByKey(value: unknown, keys: string[], depth = 0): unknown {
  if (!value || depth > 5) return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const match = findDateByKey(item, keys, depth + 1);
      if (match) return match;
    }
    return null;
  }
  if (typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  for (const [key, item] of Object.entries(record)) {
    if (keys.includes(key.toLowerCase()) && typeof item === "string") return item;
  }
  for (const item of Object.values(record)) {
    const match = findDateByKey(item, keys, depth + 1);
    if (match) return match;
  }
  return null;
}

function firstScalar(value: unknown): string | null {
  const direct = asString(value);
  if (direct) return direct;
  if (Array.isArray(value)) {
    for (const item of value) {
      const scalar = firstScalar(item);
      if (scalar) return scalar;
    }
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["value", "date", "end_date", "expires_at", "name", "description"]) {
      const scalar = asString(record[key]);
      if (scalar) return scalar;
    }
  }
  return null;
}
