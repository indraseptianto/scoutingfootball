export type SportmonksEntity = Record<string, unknown>;

export function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

export function asNumber(value: unknown) {
  return typeof value === "number" ? value : null;
}

export function asDate(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

export function readNestedNumber(entity: SportmonksEntity, key: string) {
  const value = entity[key];
  return typeof value === "number" ? value : null;
}
