import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { sportmonksFetch } from "../client";
import { sportmonksEndpoints, sportmonksIncludes } from "../endpoints";
import { normalizeTransfer } from "../normalize/transfers";
import { finishSyncLog, startSyncLog, type SyncJobResult } from "./core";

export async function syncTransfers(): Promise<SyncJobResult> {
  const supabase = getSupabaseServiceClient();
  const logId = await startSyncLog("transfers");
  let recordsProcessed = 0;

  try {
    const response = await sportmonksFetch<Record<string, unknown>[]>(sportmonksEndpoints.latestTransfers, {
      include: sportmonksIncludes.transfers,
      per_page: 25,
      page: 1
    });

    const rows = (response.data ?? []).map(normalizeTransfer).filter((row) => row.sportmonks_id);
    if (rows.length > 0) {
      const { error } = await supabase.from("transfers").upsert(rows, { onConflict: "sportmonks_id" });
      if (error) throw error;
      recordsProcessed = rows.length;
    }

    await finishSyncLog(logId, "success", recordsProcessed);
    return { entity: "transfers", status: "success", recordsProcessed };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown transfers sync error";
    await finishSyncLog(logId, "failed", recordsProcessed, message);
    return { entity: "transfers", status: "failed", recordsProcessed, error: message };
  }
}
