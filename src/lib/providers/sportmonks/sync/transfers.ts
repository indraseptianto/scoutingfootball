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
  const metadataErrors: string[] = [];

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
        try {
          recordsProcessed += await upsertPlayersFromTransfers(transferRows);
        } catch (error) {
          metadataErrors.push(serializeError(error));
        }
      },
      {
        maxPages: Number.isFinite(maxPageCount) && maxPageCount > 0 ? maxPageCount : pageNumber > 0 ? 1 : 2
      }
    );

    const warning = metadataErrors.length > 0 ? `Player metadata enrichment skipped: ${metadataErrors.slice(0, 3).join(" | ")}` : undefined;
    await finishSyncLog(logId, "success", recordsProcessed, warning);
    return { entity, status: "success", recordsProcessed, error: warning };
  } catch (error) {
    const message = serializeError(error);
    await finishSyncLog(logId, "failed", recordsProcessed, message);
    return { entity, status: "failed", recordsProcessed, error: message };
  }
}

function serializeError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const message = [record.message, record.details, record.hint, record.code].filter(Boolean).join(" ");
    return message || JSON.stringify(record);
  }
  return String(error);
}
