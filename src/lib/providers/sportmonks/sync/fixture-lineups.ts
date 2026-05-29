import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { sportmonksFetch } from "../client";
import { sportmonksEndpoints } from "../endpoints";
import { normalizeFixtureLineup } from "../normalize/fixture-lineups";
import { finishSyncLog, startSyncLog, type SyncJobResult } from "./core";

const DEFAULT_FIXTURE_LIMIT = 10;

export async function syncFixtureLineups(fixtureId?: number): Promise<SyncJobResult> {
  if (fixtureId) {
    return syncLineupsForFixture(fixtureId);
  }

  const supabase = getSupabaseServiceClient();
  const entity = "fixture-lineups";
  const logId = await startSyncLog(entity);
  let recordsProcessed = 0;

  try {
    const limit = getFixtureLimit();
    const { data: fixtures, error } = await supabase
      .from("fixtures")
      .select("sportmonks_id")
      .not("starting_at", "is", null)
      .lte("starting_at", new Date().toISOString())
      .order("starting_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const errors: string[] = [];
    for (const fixture of fixtures ?? []) {
      try {
        const result = await syncLineupsForFixture(Number(fixture.sportmonks_id));
        recordsProcessed += result.recordsProcessed;
      } catch (e) {
        errors.push(`${fixture.sportmonks_id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    const errorSummary = errors.length > 0 ? errors.slice(0, 5).join(" | ") : undefined;
    await finishSyncLog(logId, errors.length > 0 ? "failed" : "success", recordsProcessed, errorSummary);
    return { entity, status: errors.length > 0 ? "failed" : "success", recordsProcessed, error: errorSummary };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await finishSyncLog(logId, "failed", recordsProcessed, message);
    return { entity, status: "failed", recordsProcessed, error: message };
  }
}

async function syncLineupsForFixture(fixtureId: number): Promise<SyncJobResult> {
  const supabase = getSupabaseServiceClient();
  const entity = `fixture-lineups:${fixtureId}`;
  const logId = await startSyncLog(entity);
  let recordsProcessed = 0;

  try {
    const response = await sportmonksFetch(sportmonksEndpoints.fixtureLineups(fixtureId));
    const items = Array.isArray(response.data) ? response.data : [];
    const rows = items.map(normalizeFixtureLineup).filter((r) => r.sportmonks_id);
    if (rows.length) {
      const { error } = await supabase.from("fixture_lineups").upsert(rows, { onConflict: "sportmonks_id" });
      if (error) throw error;
      recordsProcessed = rows.length;
    }
    await finishSyncLog(logId, "success", recordsProcessed);
    return { entity, status: "success", recordsProcessed };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await finishSyncLog(logId, "failed", recordsProcessed, message);
    return { entity, status: "failed", recordsProcessed, error: message };
  }
}

function getFixtureLimit() {
  const value = Number(process.env.SPORTMONKS_STATS_FIXTURE_LIMIT);
  return Number.isFinite(value) && value > 0 ? Math.min(value, 25) : DEFAULT_FIXTURE_LIMIT;
}
