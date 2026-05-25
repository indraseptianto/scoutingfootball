import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { sportmonksFetchPaginated } from "../client";
import { sportmonksEndpoints, sportmonksIncludes } from "../endpoints";
import { normalizeTransfer } from "../normalize/transfers";
import { finishSyncLog, startSyncLog, type SyncJobResult } from "./core";
import { upsertPlayersFromTransfers } from "./transfer-metadata";

export async function syncTransfers(page = "", maxPages = ""): Promise<SyncJobResult> {
  const supabase = getSupabaseServiceClient();
  const pageNumber = Number(page);
  const maxPageCount = Number(maxPages);
  const entity = pageNumber > 0 ? `transfers:page:${pageNumber}` : "transfers";
  const logId = await startSyncLog(entity);
  let recordsProcessed = 0;

  try {
    await sportmonksFetchPaginated<Record<string, unknown>>(
      sportmonksEndpoints.latestTransfers,
      {
        include: sportmonksIncludes.transfers,
        order: "desc",
        page: pageNumber > 0 ? pageNumber : undefined
      },
      async (transferRows) => {
        const rows = transferRows.map((row) => normalizeTransfer(row, "latest")).filter((row) => row.sportmonks_id);
        if (rows.length > 0) {
          const { error } = await supabase.from("transfers").upsert(rows, { onConflict: "sportmonks_id" });
          if (error) throw error;
          recordsProcessed += rows.length;
        }
        recordsProcessed += await upsertPlayersFromTransfers(transferRows);
      },
      {
        maxPages: Number.isFinite(maxPageCount) && maxPageCount > 0 ? maxPageCount : pageNumber > 0 ? 1 : 2
      }
    );

    await finishSyncLog(logId, "success", recordsProcessed);
    return { entity, status: "success", recordsProcessed };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown transfers sync error";
    await finishSyncLog(logId, "failed", recordsProcessed, message);
    return { entity, status: "failed", recordsProcessed, error: message };
  }
}
