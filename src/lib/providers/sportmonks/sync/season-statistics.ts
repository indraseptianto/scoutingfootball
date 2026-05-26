import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { extractSportmonksDetails, firstNumber, firstString, normalizeFootballMetrics, percentage } from "../metrics";
import { sportmonksFetchPaginated } from "../client";
import { sportmonksEndpoints } from "../endpoints";
import { finishSyncLog, startSyncLog, type SyncJobResult } from "./core";
import { getTargetCurrentSeasonIds } from "./teams";

type JsonRecord = Record<string, unknown>;

type SeasonTarget = {
  seasonId: number;
  leagueId: number;
};

export async function syncSeasonStatistics(seasonId = process.env.SPORTMONKS_DEFAULT_SEASON_ID) {
  const targets = seasonId
    ? await getSingleSeasonTarget(Number(seasonId))
    : await getTargetCurrentSeasonIds();

  if (targets.length === 0) {
    return { entity: "season-statistics", status: "success", recordsProcessed: 0 } satisfies SyncJobResult;
  }

  const results: SyncJobResult[] = [];
  for (const target of targets) {
    results.push(await syncSeasonStatisticTarget(target));
  }

  const failures = results.filter((result) => result.status === "failed");
  const recordsProcessed = results.reduce((sum, result) => sum + result.recordsProcessed, 0);
  return {
    entity: "season-statistics",
    status: failures.length > 0 && recordsProcessed === 0 ? "failed" : "success",
    recordsProcessed,
    error: failures.length > 0 ? failures.map((result) => `${result.entity}: ${result.error}`).join(" | ") : undefined
  } satisfies SyncJobResult;
}

async function syncSeasonStatisticTarget(target: SeasonTarget): Promise<SyncJobResult> {
  const supabase = getSupabaseServiceClient();
  const entity = `season-statistics:${target.seasonId}`;
  const logId = await startSyncLog(entity);
  let recordsProcessed = 0;

  try {
    await sportmonksFetchPaginated<JsonRecord>(
      sportmonksEndpoints.playerSeasonStats(target.seasonId),
      { include: "player;team;details.type" },
      async (rows) => {
        const normalized = [];
        for (const row of rows) {
          const normalizedRow = normalizeSeasonStatistic(row, target);
          if (normalizedRow?.player_sportmonks_id) normalized.push(normalizedRow);
        }

        if (normalized.length === 0) return;

        const { error } = await supabase.from("season_player_statistics").upsert(normalized, {
          onConflict: "player_sportmonks_id,team_sportmonks_id,season_sportmonks_id"
        });

        if (error) throw error;
        recordsProcessed += normalized.length;
      }
    );

    if (recordsProcessed === 0) {
      recordsProcessed = await upsertMatchAggregateSeasonStats(target);
    }

    await finishSyncLog(logId, "success", recordsProcessed);
    return { entity, status: "success", recordsProcessed };
  } catch (error) {
    const message = serializeError(error);
    await finishSyncLog(logId, "failed", recordsProcessed, message);
    return { entity, status: "failed", recordsProcessed, error: message };
  }
}

function normalizeSeasonStatistic(row: JsonRecord, target: SeasonTarget) {
  const player = isRecord(row.player) ? row.player : {};
  const team = isRecord(row.team) ? row.team : {};
  const details = extractSportmonksDetails(row);
  const metrics = normalizeFootballMetrics(details);
  const playerId = firstNumber(row.player_id, player.id);
  const teamId = firstNumber(row.team_id, team.id);
  const seasonId = firstNumber(row.season_id, target.seasonId);

  if (!playerId || !seasonId) return null;

  return {
    sportmonks_id: firstNumber(row.id),
    player_sportmonks_id: playerId,
    team_sportmonks_id: teamId,
    league_sportmonks_id: firstNumber(row.league_id, target.leagueId),
    season_sportmonks_id: seasonId,
    position_name: firstString(row.position_name, isRecord(player.position) ? player.position.name : undefined),
    ...metrics,
    source: "sportmonks",
    raw_details: details,
    raw: row,
    updated_at: new Date().toISOString()
  };
}

async function upsertMatchAggregateSeasonStats(target: SeasonTarget) {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("player_match_statistics")
    .select("*")
    .eq("season_sportmonks_id", target.seasonId);

  if (error) throw error;

  const grouped = new Map<string, JsonRecord[]>();
  for (const row of (data ?? []) as JsonRecord[]) {
    const key = `${row.player_sportmonks_id}:${row.team_sportmonks_id}:${row.season_sportmonks_id}`;
    const bucket = grouped.get(key) ?? [];
    bucket.push(row);
    grouped.set(key, bucket);
  }

  const rows = Array.from(grouped.values()).map((matches) => aggregateMatchRows(matches, target));
  if (rows.length === 0) return 0;

  for (const batch of chunk(rows, 100)) {
    const { error: upsertError } = await supabase.from("season_player_statistics").upsert(batch, {
      onConflict: "player_sportmonks_id,team_sportmonks_id,season_sportmonks_id"
    });

    if (upsertError) throw upsertError;
  }

  return rows.length;
}

function aggregateMatchRows(matches: JsonRecord[], target: SeasonTarget) {
  const first = matches[0] ?? {};
  const passesTotal = sumColumn(matches, "passes_total");
  const passesAccurate = sumColumn(matches, "passes_accurate");
  const dribbleAttempts = sumColumn(matches, "dribble_attempts");
  const dribblesSuccessful = sumColumn(matches, "dribbles_successful");
  const duelsTotal = sumColumn(matches, "duels_total");
  const duelsWon = sumColumn(matches, "duels_won");
  const aerialsTotal = sumColumn(matches, "aerials_total");
  const aerialsWon = sumColumn(matches, "aerials_won");

  return {
    player_sportmonks_id: firstNumber(first.player_sportmonks_id),
    team_sportmonks_id: firstNumber(first.team_sportmonks_id),
    league_sportmonks_id: firstNumber(first.league_sportmonks_id, target.leagueId),
    season_sportmonks_id: firstNumber(first.season_sportmonks_id, target.seasonId),
    appearances: matches.length,
    minutes: sumColumn(matches, "minutes"),
    rating: averageColumn(matches, "rating"),
    goals: sumColumn(matches, "goals"),
    assists: sumColumn(matches, "assists"),
    shots_total: sumColumn(matches, "shots_total"),
    shots_on_target: sumColumn(matches, "shots_on_target"),
    shots_off_target: sumColumn(matches, "shots_off_target"),
    expected_goals: sumColumn(matches, "expected_goals"),
    expected_goals_on_target: sumColumn(matches, "expected_goals_on_target"),
    expected_assists: sumColumn(matches, "expected_assists"),
    shooting_performance: sumColumn(matches, "shooting_performance"),
    passes_total: passesTotal,
    passes_accurate: passesAccurate,
    pass_accuracy: percentage(passesAccurate, passesTotal),
    key_passes: sumColumn(matches, "key_passes"),
    chances_created: sumColumn(matches, "chances_created"),
    big_chances_created: sumColumn(matches, "big_chances_created"),
    passes_final_third: sumColumn(matches, "passes_final_third"),
    crosses_total: sumColumn(matches, "crosses_total"),
    crosses_accurate: sumColumn(matches, "crosses_accurate"),
    long_balls_total: sumColumn(matches, "long_balls_total"),
    long_balls_accurate: sumColumn(matches, "long_balls_accurate"),
    touches: sumColumn(matches, "touches"),
    dribble_attempts: dribbleAttempts,
    dribbles_successful: dribblesSuccessful,
    dribble_success_rate: percentage(dribblesSuccessful, dribbleAttempts),
    possession_lost: sumColumn(matches, "possession_lost"),
    dispossessed: sumColumn(matches, "dispossessed"),
    turn_overs: sumColumn(matches, "turn_overs"),
    ball_recoveries: sumColumn(matches, "ball_recoveries"),
    fouls_drawn: sumColumn(matches, "fouls_drawn"),
    fouls_committed: sumColumn(matches, "fouls_committed"),
    tackles: sumColumn(matches, "tackles"),
    tackles_won: sumColumn(matches, "tackles_won"),
    interceptions: sumColumn(matches, "interceptions"),
    clearances: sumColumn(matches, "clearances"),
    blocks: sumColumn(matches, "blocks"),
    duels_total: duelsTotal,
    duels_won: duelsWon,
    duels_lost: sumColumn(matches, "duels_lost"),
    duels_won_percentage: percentage(duelsWon, duelsTotal),
    aerials_total: aerialsTotal,
    aerials_won: aerialsWon,
    aerials_lost: sumColumn(matches, "aerials_lost"),
    aerials_won_percentage: percentage(aerialsWon, aerialsTotal),
    saves: sumColumn(matches, "saves"),
    goals_conceded: sumColumn(matches, "goals_conceded"),
    yellow_cards: sumColumn(matches, "yellow_cards"),
    red_cards: sumColumn(matches, "red_cards"),
    source: "match_aggregate",
    raw: { matches_aggregated: matches.length },
    updated_at: new Date().toISOString()
  };
}

async function getSingleSeasonTarget(seasonId: number) {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("sportmonks_id,league_sportmonks_id")
    .eq("sportmonks_id", seasonId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return [];
  return [{ seasonId: Number(data.sportmonks_id), leagueId: Number(data.league_sportmonks_id) }];
}

function sumColumn(rows: JsonRecord[], key: string) {
  return rows.reduce((sum, row) => sum + (firstNumber(row[key]) ?? 0), 0);
}

function averageColumn(rows: JsonRecord[], key: string) {
  const values = rows.map((row) => firstNumber(row[key])).filter((value): value is number => typeof value === "number");
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function chunk<T>(rows: T[], size: number) {
  const batches: T[][] = [];
  for (let index = 0; index < rows.length; index += size) {
    batches.push(rows.slice(index, index + size));
  }
  return batches;
}

function serializeError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (isRecord(error)) {
    const message = firstString(error.message, error.error_description, error.details, error.hint);
    if (message) return message;
    return JSON.stringify(error);
  }
  return String(error);
}
