import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { sportmonksFetchPaginated } from "../client";

export type SyncJobResult = {
  entity: string;
  status: "success" | "failed";
  recordsProcessed: number;
  error?: string;
};

type SyncConfig<T> = {
  entity: string;
  endpoint: string;
  table: string;
  query?: Record<string, string | number | boolean | undefined>;
  normalize: (row: T) => Record<string, unknown>;
};

export async function startSyncLog(entity: string) {
  const supabase = getSupabaseServiceClient();
  const { data } = await supabase
    .from("data_sync_logs")
    .insert({
      entity,
      status: "running",
      provider: "sportmonks",
      started_at: new Date().toISOString()
    })
    .select("id")
    .single();

  return data?.id as string | undefined;
}

export async function finishSyncLog(logId: string | undefined, status: "success" | "failed", recordsProcessed: number, error?: string) {
  if (!logId) return;
  const supabase = getSupabaseServiceClient();
  await supabase
    .from("data_sync_logs")
    .update({
      status,
      records_processed: recordsProcessed,
      error_message: error ?? null,
      finished_at: new Date().toISOString()
    })
    .eq("id", logId);
}

export async function runSportmonksSync<T extends Record<string, unknown>>(config: SyncConfig<T>): Promise<SyncJobResult> {
  const supabase = getSupabaseServiceClient();
  let recordsProcessed = 0;
  const logId = await startSyncLog(config.entity);

  try {
    await sportmonksFetchPaginated<T>(config.endpoint, config.query, async (rows) => {
      const normalized = rows.map(config.normalize).filter((row) => row.sportmonks_id);
      if (normalized.length === 0) return;

      const { error } = await supabase.from(config.table).upsert(normalized, {
        onConflict: "sportmonks_id"
      });

      if (error) throw error;
      recordsProcessed += normalized.length;
    });

    await finishSyncLog(logId, "success", recordsProcessed);
    return { entity: config.entity, status: "success", recordsProcessed };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown sync error";
    await finishSyncLog(logId, "failed", recordsProcessed, message);
    return { entity: config.entity, status: "failed", recordsProcessed, error: message };
  }
}
