import { SPORTMONKS_BASE_URL } from "./endpoints";
import { getSportmonksCache, setSportmonksCache } from "./cache";
import { retryDelayMs, waitForSportmonksSlot } from "./rateLimit";

export type SportmonksResponse<T> = {
  data: T;
  pagination?: {
    count: number;
    per_page: number;
    current_page: number;
    next_page: string | null;
    has_more: boolean;
  };
  rate_limit?: {
    resets_in_seconds?: number;
    remaining?: number;
    requested_entity?: string;
  };
};

export type SportmonksQuery = Record<string, string | number | boolean | undefined>;

function getSportmonksToken() {
  const token = process.env.SPORTMONKS_API_TOKEN;
  if (!token) throw new Error("Missing SPORTMONKS_API_TOKEN.");
  return token;
}

export async function sportmonksFetch<T>(
  path: string,
  query: SportmonksQuery = {},
  options: { cacheTtlMs?: number; retries?: number } = {}
) {
  const url = new URL(`${SPORTMONKS_BASE_URL}${path}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });

  const cacheKey = url.toString();
  const cached = getSportmonksCache<SportmonksResponse<T>>(cacheKey);
  if (cached) return cached;

  const retries = options.retries ?? 3;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    await waitForSportmonksSlot();

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${getSportmonksToken()}`,
        Accept: "application/json"
      },
      cache: "no-store"
    });

    if (response.ok) {
      const json = (await response.json()) as SportmonksResponse<T>;
      setSportmonksCache(cacheKey, json, options.cacheTtlMs);
      return json;
    }

    if ((response.status === 429 || response.status >= 500) && attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs(attempt, response.headers.get("retry-after"))));
      continue;
    }

    const body = await response.text();
    throw new Error(`Sportmonks request failed: ${response.status} ${response.statusText} ${body}`);
  }

  throw new Error("Sportmonks request failed after retries.");
}

export async function sportmonksFetchPaginated<T>(
  path: string,
  query: SportmonksQuery = {},
  onPage?: (rows: T[], page: number) => Promise<void>
) {
  const allRows: T[] = [];
  let page = Number(query.page ?? 1);
  let hasMore = true;

  while (hasMore) {
    const response = await sportmonksFetch<T[]>(path, { per_page: 50, ...query, page });
    const rows = response.data ?? [];
    allRows.push(...rows);
    if (onPage) await onPage(rows, page);

    hasMore = Boolean(response.pagination?.has_more);
    page += 1;
  }

  return allRows;
}
