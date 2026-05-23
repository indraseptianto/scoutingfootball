import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { sportmonksFetchPaginated } from "../client";
import { sportmonksEndpoints, sportmonksIncludes } from "../endpoints";
import { normalizePlayer } from "../normalize/players";
import { normalizeSquadPlayer } from "../normalize/squads";
import { finishSyncLog, runSportmonksSync, startSyncLog, type SyncJobResult } from "./core";
import { getTargetCurrentSeasonIds } from "./teams";

export async function syncSquads(teamId = process.env.SPORTMONKS_DEFAULT_TEAM_ID, seasonId = process.env.SPORTMONKS_DEFAULT_SEASON_ID) {
  if (teamId) {
    return runSportmonksSync({
      entity: "squads",
      endpoint: seasonId ? sportmonksEndpoints.squadsBySeasonTeam(seasonId, teamId) : sportmonksEndpoints.squadsByTeam(teamId),
      table: "squad_players",
      query: { include: sportmonksIncludes.squad },
      normalize: (row) => normalizeSquadPlayer(row, teamId, seasonId)
    });
  }

  const supabase = getSupabaseServiceClient();
  const seasons = await getTargetCurrentSeasonIds();
  if (seasons.length === 0) {
    return { entity: "squads", status: "success", recordsProcessed: 0 } satisfies SyncJobResult;
  }

  const { data: memberships, error } = await supabase
    .from("club_season_memberships")
    .select("team_sportmonks_id,season_sportmonks_id")
    .in(
      "season_sportmonks_id",
      seasons.map((season) => season.seasonId)
    );

  if (error) throw error;

  const results: SyncJobResult[] = [];
  for (const membership of memberships ?? []) {
    results.push(await syncSquadForTeamSeason(Number(membership.team_sportmonks_id), Number(membership.season_sportmonks_id)));
  }

  const failed = results.find((result) => result.status === "failed");
  return {
    entity: "squads",
    status: failed ? "failed" : "success",
    recordsProcessed: results.reduce((sum, result) => sum + result.recordsProcessed, 0),
    error: failed?.error
  } satisfies SyncJobResult;
}

async function syncSquadForTeamSeason(teamId: number, seasonId: number): Promise<SyncJobResult> {
  const supabase = getSupabaseServiceClient();
  const entity = `squads:${teamId}:${seasonId}`;
  const logId = await startSyncLog(entity);
  let recordsProcessed = 0;

  try {
    await sportmonksFetchPaginated<Record<string, unknown>>(
      sportmonksEndpoints.squadsBySeasonTeam(seasonId, teamId),
      { include: sportmonksIncludes.squad },
      async (rows) => {
        const players = rows
          .map((row) => row.player)
          .filter((player): player is Record<string, unknown> => Boolean(player))
          .map(normalizePlayer)
          .filter((row) => row.sportmonks_id);

        if (players.length > 0) {
          const { error: playersError } = await supabase.from("players").upsert(players, { onConflict: "sportmonks_id" });
          if (playersError) throw playersError;
        }

        const squadRows = rows.map((row) => normalizeSquadPlayer(row, teamId, seasonId)).filter((row) => row.sportmonks_id);
        if (squadRows.length > 0) {
          const { error: squadsError } = await supabase.from("squad_players").upsert(squadRows, { onConflict: "sportmonks_id" });
          if (squadsError) throw squadsError;
        }

        recordsProcessed += squadRows.length;
      }
    );

    await finishSyncLog(logId, "success", recordsProcessed);
    return { entity, status: "success", recordsProcessed };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown squad sync error";
    await finishSyncLog(logId, "failed", recordsProcessed, message);
    return { entity, status: "failed", recordsProcessed, error: message };
  }
}
  });
}
