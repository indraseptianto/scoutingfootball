import { sportmonksFetch } from "../client";
import { sportmonksEndpoints } from "../endpoints";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { finishSyncLog, startSyncLog, type SyncJobResult } from "./core";

const TARGET_SEASONS = [
  21646, 23614, 25583,
  21689, 23672, 25648,
  21690, 23671, 25649,
  21691, 23673, 25650,
  21694, 23621, 25659,
];

export async function syncSeasonStatistics(): Promise<SyncJobResult[]> {
  const results: SyncJobResult[] = [];
  for (const seasonId of TARGET_SEASONS) {
    const supabase = getSupabaseServiceClient();
    const logId = await startSyncLog(`season-statistics:${seasonId}`);
    let recordsProcessed = 0;
    try {
      const response = await sportmonksFetch(sportmonksEndpoints.playerSeasonStats(seasonId));
      const rows = (response.data ?? []).map((item: any) => ({
        sportmonks_id: item.id,
        season_sportmonks_id: seasonId,
        player_sportmonks_id: item.player_id,
        team_sportmonks_id: item.team_id,
        fixture_sportmonks_id: item.fixture_id,
        type_sportmonks_id: item.type_id,
        value_numeric: item.value,
        value_text: item.value?.toString(),
        raw: item
      }));
      if (rows.length) {
        const { error } = await supabase.from("statistic_details").upsert(rows, { onConflict: "sportmonks_id" });
        if (error) throw error;
        recordsProcessed = rows.length;
      }
      await finishSyncLog(logId, "success", recordsProcessed);
      results.push({ entity: `season-statistics:${seasonId}`, status: "success", recordsProcessed });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await finishSyncLog(logId, "failed", recordsProcessed, message);
      results.push({ entity: `season-statistics:${seasonId}`, status: "failed", recordsProcessed, error: message });
    }
  }
  return results;
}
