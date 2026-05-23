type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

export function getSportmonksCache<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry || entry.expiresAt < Date.now()) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setSportmonksCache<T>(key: string, value: T, ttlMs = 60_000) {
  memoryCache.set(key, {
    expiresAt: Date.now() + ttlMs,
    value
  });
}
