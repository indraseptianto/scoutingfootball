import { getSupabaseServiceClient } from "@/lib/supabase/server";
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
  const details = extractDetails(row);
  const metrics = metricMap(details);
  const playerId = firstNumber(row.player_id, player.id);
  const teamId = firstNumber(row.team_id, team.id);
  const seasonId = firstNumber(row.season_id, target.seasonId);

  if (!playerId || !seasonId) return null;

  const passesTotal = firstMetric(metrics, "passes_total", "passes");
  const passesAccurate = firstMetric(metrics, "passes_accurate", "accurate_passes");
  const dribbleAttempts = firstMetric(metrics, "dribble_attempts", "dribbled_attempts", "dribbles_attempted");
  const dribblesSuccessful = firstMetric(metrics, "dribbles_successful", "successful_dribbles");
  const duelsTotal = firstMetric(metrics, "duels_total", "total_duels");
  const duelsWon = firstMetric(metrics, "duels_won");
  const aerialsTotal = firstMetric(metrics, "aerials_total", "aerials");
  const aerialsWon = firstMetric(metrics, "aerials_won");

  return {
    sportmonks_id: firstNumber(row.id),
    player_sportmonks_id: playerId,
    team_sportmonks_id: teamId,
    league_sportmonks_id: firstNumber(row.league_id, target.leagueId),
    season_sportmonks_id: seasonId,
    position_name: firstString(row.position_name, isRecord(player.position) ? player.position.name : undefined),
    appearances: firstMetric(metrics, "appearances"),
    starts: firstMetric(metrics, "lineups", "starts"),
    minutes: firstMetric(metrics, "minutes", "minutes_played"),
    rating: firstMetric(metrics, "rating"),
    goals: firstMetric(metrics, "goals"),
    assists: firstMetric(metrics, "assists"),
    shots_total: firstMetric(metrics, "shots_total", "shots"),
    shots_on_target: firstMetric(metrics, "shots_on_target"),
    shots_off_target: firstMetric(metrics, "shots_off_target"),
    expected_goals: firstMetric(metrics, "expected_goals", "xg"),
    expected_goals_on_target: firstMetric(metrics, "expected_goals_on_target", "xgot"),
    expected_assists: firstMetric(metrics, "expected_assists", "xa"),
    shooting_performance: firstMetric(metrics, "shooting_performance"),
    passes_total: passesTotal,
    passes_accurate: passesAccurate,
    pass_accuracy: firstMetric(metrics, "accurate_passes_percentage", "pass_accuracy") ?? percentage(passesAccurate, passesTotal),
    key_passes: firstMetric(metrics, "key_passes"),
    chances_created: firstMetric(metrics, "chances_created"),
    big_chances_created: firstMetric(metrics, "big_chances_created"),
    passes_final_third: firstMetric(metrics, "passes_in_final_third"),
    crosses_total: firstMetric(metrics, "total_crosses", "crosses"),
    crosses_accurate: firstMetric(metrics, "accurate_crosses"),
    accurate_crosses_percentage: firstMetric(metrics, "accurate_crosses_percentage", "successful_crosses_percentage"),
    long_balls_total: firstMetric(metrics, "long_balls"),
    long_balls_accurate: firstMetric(metrics, "long_balls_won", "accurate_long_balls"),
    long_balls_won_percentage: firstMetric(metrics, "long_balls_won_percentage"),
    touches: firstMetric(metrics, "touches"),
    dribble_attempts: dribbleAttempts,
    dribbles_successful: dribblesSuccessful,
    dribble_success_rate: firstMetric(metrics, "dribble_success_rate") ?? percentage(dribblesSuccessful, dribbleAttempts),
    possession_lost: firstMetric(metrics, "possession_lost"),
    dispossessed: firstMetric(metrics, "dispossessed"),
    turn_overs: firstMetric(metrics, "turn_over"),
    ball_recoveries: firstMetric(metrics, "ball_recovery"),
    fouls_drawn: firstMetric(metrics, "fouls_drawn"),
    fouls_committed: firstMetric(metrics, "fouls", "fouls_committed"),
    tackles: firstMetric(metrics, "tackles"),
    tackles_won: firstMetric(metrics, "tackles_won"),
    tackles_won_percentage: firstMetric(metrics, "tackles_won_percentage"),
    interceptions: firstMetric(metrics, "interceptions"),
    clearances: firstMetric(metrics, "clearances"),
    blocks: firstMetric(metrics, "blocks"),
    duels_total: duelsTotal,
    duels_won: duelsWon,
    duels_lost: firstMetric(metrics, "duels_lost"),
    duels_won_percentage: firstMetric(metrics, "duels_won_percentage") ?? percentage(duelsWon, duelsTotal),
    aerials_total: aerialsTotal,
    aerials_won: aerialsWon,
    aerials_lost: firstMetric(metrics, "aerials_lost", "aeriels_lost"),
    aerials_won_percentage: firstMetric(metrics, "aerials_won_percentage") ?? percentage(aerialsWon, aerialsTotal),
    saves: firstMetric(metrics, "saves"),
    goals_conceded: firstMetric(metrics, "goals_conceded"),
    yellow_cards: firstMetric(metrics, "yellowcards", "yellow_cards"),
    red_cards: firstMetric(metrics, "redcards", "red_cards"),
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

function extractDetails(row: JsonRecord) {
  if (Array.isArray(row.details)) return row.details.filter(isRecord);
  const statistic = isRecord(row.statistics) ? row.statistics : {};
  if (Array.isArray(statistic.details)) return statistic.details.filter(isRecord);
  return [];
}

function metricMap(details: JsonRecord[]) {
  return details.reduce<Record<string, number | null>>((acc, detail) => {
    const key = metricKey(detail);
    if (!key) return acc;
    acc[key] = numberFromDetail(detail);
    return acc;
  }, {});
}

function metricKey(detail: JsonRecord) {
  const type = isRecord(detail.type) ? detail.type : {};
  const rawName = firstString(type.developer_name, type.code, type.name, detail.developer_name, detail.code, detail.name);
  if (!rawName) return null;
  return rawName.toLowerCase().replaceAll("+", "_plus_").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function numberFromDetail(detail: JsonRecord) {
  const data = isRecord(detail.data) ? detail.data : {};
  const value = isRecord(detail.value) ? detail.value : {};
  return firstNumber(data.value, data.total, data.count, value.value, value.total, value.count, detail.value, detail.total, detail.count);
}

function firstMetric(metrics: Record<string, number | null>, ...keys: string[]) {
  for (const key of keys) {
    const value = metrics[key];
    if (typeof value === "number") return value;
  }
  return null;
}

function sumColumn(rows: JsonRecord[], key: string) {
  return rows.reduce((sum, row) => sum + (firstNumber(row[key]) ?? 0), 0);
}

function averageColumn(rows: JsonRecord[], key: string) {
  const values = rows.map((row) => firstNumber(row[key])).filter((value): value is number => typeof value === "number");
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentage(part: number | null, total: number | null) {
  if (part === null || total === null || total <= 0) return null;
  return Number(((part / total) * 100).toFixed(1));
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  return null;
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
