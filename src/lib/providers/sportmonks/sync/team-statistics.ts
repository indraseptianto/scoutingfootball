import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { sportmonksFetch } from "../client";
import { sportmonksEndpoints } from "../endpoints";
import { normalizeTeamStatistic } from "../normalize/team-statistics";
import { finishSyncLog, startSyncLog, type SyncJobResult } from "./core";

const ALL_TARGET_SEASONS = [
  21646, 23614, 25583,
  21689, 23672, 25648,
  21690, 23671, 25649,
  21691, 23673, 25650,
  21694, 23621, 25659,
];

export async function syncTeamStatistics(): Promise<SyncJobResult> {
  const supabase = getSupabaseServiceClient();
  const logId = await startSyncLog("team-statistics");
  let recordsProcessed = 0;

  try {
    const { data: memberships, error } = await supabase
      .from("club_season_memberships")
      .select("team_sportmonks_id,season_sportmonks_id")
      .in("season_sportmonks_id", ALL_TARGET_SEASONS);

    if (error) throw error;
    if (!memberships || memberships.length === 0) {
      await finishSyncLog(logId, "success", 0, "No memberships found for target seasons. Run syncTeams first.");
      return { entity: "team-statistics", status: "success", recordsProcessed: 0, error: "No memberships found" };
    }

    const errors: string[] = [];
    for (const m of memberships) {
      const teamId = Number(m.team_sportmonks_id);
      const seasonId = Number(m.season_sportmonks_id);
      try {
        const response = await sportmonksFetch(sportmonksEndpoints.teamStatistics(teamId), { season_id: seasonId });
        const items = Array.isArray(response.data) ? response.data : [response.data];
        const rows = items.map(normalizeTeamStatistic).filter((r) => r.sportmonks_id);
        if (rows.length) {
          const { error: upsertError } = await supabase.from("team_statistics").upsert(rows, { onConflict: "sportmonks_id" });
          if (upsertError) throw upsertError;
          recordsProcessed += rows.length;
        }
      } catch (e) {
        errors.push(`${teamId}-${seasonId}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    const errorSummary = errors.length > 0 ? errors.slice(0, 5).join(" | ") : undefined;
    await finishSyncLog(logId, errors.length > 0 ? "failed" : "success", recordsProcessed, errorSummary);
    return { entity: "team-statistics", status: errors.length > 0 ? "failed" : "success", recordsProcessed, error: errorSummary };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await finishSyncLog(logId, "failed", recordsProcessed, message);
    return { entity: "team-statistics", status: "failed", recordsProcessed, error: message };
  }
}
