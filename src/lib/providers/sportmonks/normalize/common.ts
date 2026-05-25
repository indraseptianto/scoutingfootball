export type SportmonksEntity = Record<string, unknown>;

export function asString(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return String(value);
  return null;
}

export function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function asDate(value: unknown) {
  if (typeof value !== "string" || value.length === 0) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return value.slice(0, 10);
}

export function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

export function readNestedNumber(entity: SportmonksEntity, key: string) {
  const value = entity[key];
  return typeof value === "number" ? value : null;
}
