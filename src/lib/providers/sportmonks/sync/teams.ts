import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { getTargetLeagueNames } from "../config";
import { sportmonksFetchPaginated } from "../client";
import { sportmonksEndpoints } from "../endpoints";
import { normalizeTeam } from "../normalize/teams";
import { finishSyncLog, startSyncLog, type SyncJobResult } from "./core";

export async function syncTeams() {
  const targetSeasonIds = await getTargetCurrentSeasonIds();
  if (targetSeasonIds.length === 0) {
    return {
      entity: "teams",
      status: "success",
      recordsProcessed: 0
    } satisfies SyncJobResult;
  }

  const results: SyncJobResult[] = [];
  for (const season of targetSeasonIds) {
    results.push(await syncTeamsForSeason(season.seasonId, season.leagueId));
  }

  const failed = results.find((result) => result.status === "failed");
  return {
    entity: "teams",
    status: failed ? "failed" : "success",
    recordsProcessed: results.reduce((sum, result) => sum + result.recordsProcessed, 0),
    error: failed?.error
  } satisfies SyncJobResult;
}

async function syncTeamsForSeason(seasonId: number, leagueId: number): Promise<SyncJobResult> {
  const supabase = getSupabaseServiceClient();
  const entity = `teams:${seasonId}`;
  const logId = await startSyncLog(entity);
  let recordsProcessed = 0;

  try {
    await sportmonksFetchPaginated<Record<string, unknown>>(
      sportmonksEndpoints.teamsBySeason(seasonId),
      { include: "country;league;activeseason" },
      async (rows) => {
        const clubs = rows.map(normalizeTeam).filter((row) => row.sportmonks_id);
        if (clubs.length === 0) return;

        const { error: clubsError } = await supabase.from("clubs").upsert(clubs, { onConflict: "sportmonks_id" });
        if (clubsError) throw clubsError;

        const memberships = clubs.map((club) => ({
          team_sportmonks_id: club.sportmonks_id,
          league_sportmonks_id: leagueId,
          season_sportmonks_id: seasonId
        }));

        const { error: membershipError } = await supabase
          .from("club_season_memberships")
          .upsert(memberships, { onConflict: "team_sportmonks_id,season_sportmonks_id" });
        if (membershipError) throw membershipError;

        recordsProcessed += clubs.length;
      }
    );

    await finishSyncLog(logId, "success", recordsProcessed);
    return { entity, status: "success", recordsProcessed };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown teams sync error";
    await finishSyncLog(logId, "failed", recordsProcessed, message);
    return { entity, status: "failed", recordsProcessed, error: message };
  }
}

export async function getTargetCurrentSeasonIds() {
  const supabase = getSupabaseServiceClient();
  const leagueNames = getTargetLeagueNames();
  const { data: leagues, error: leaguesError } = await supabase
    .from("leagues")
    .select("sportmonks_id,name")
    .in("name", leagueNames);

  if (leaguesError) throw leaguesError;
  const leagueIds = (leagues ?? []).map((league) => Number(league.sportmonks_id)).filter(Boolean);
  if (leagueIds.length === 0) return [];

  const { data: seasons, error: seasonsError } = await supabase
    .from("seasons")
    .select("sportmonks_id,league_sportmonks_id,is_current,starting_at,ending_at")
    .in("league_sportmonks_id", leagueIds)
    .eq("is_current", true);

  if (seasonsError) throw seasonsError;

  return (seasons ?? []).map((season) => ({
    seasonId: Number(season.sportmonks_id),
    leagueId: Number(season.league_sportmonks_id)
  }));
}
