import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { sportmonksFetch } from "../client";
import { sportmonksEndpoints, sportmonksIncludes } from "../endpoints";
import { finishSyncLog, startSyncLog, type SyncJobResult } from "./core";

type JsonRecord = Record<string, unknown>;

type FixtureCacheRow = {
  sportmonks_id: number;
  league_sportmonks_id: number | null;
  season_sportmonks_id: number | null;
  round_sportmonks_id: number | null;
  name: string | null;
  starting_at: string | null;
  raw: JsonRecord | null;
};

type Participant = {
  id?: number;
  meta?: {
    location?: "home" | "away" | "neutral";
    winner?: boolean | null;
  };
};

type Lineup = {
  id?: number;
  fixture_id?: number;
  player_id?: number;
  team_id?: number;
  participant_id?: number;
  type_id?: number;
  details?: JsonRecord[];
};

type FixtureDetail = JsonRecord & {
  id?: number;
  league_id?: number;
  season_id?: number;
  round_id?: number | null;
  name?: string;
  starting_at?: string;
  result_info?: string | null;
  participants?: Participant[];
  scores?: JsonRecord[];
  round?: { id?: number; name?: string } | null;
  lineups?: Lineup[];
};

const COMPLETED_STATES = new Set(["FT", "AET", "FT_PEN", "LIVE", "HT", "BREAK"]);
const DEFAULT_FIXTURE_LIMIT = 10;

export async function syncStatistics(seasonId = process.env.SPORTMONKS_DEFAULT_SEASON_ID) {
  const supabase = getSupabaseServiceClient();
  const entity = "statistics";
  const logId = await startSyncLog(entity);
  let recordsProcessed = 0;

  try {
    const limit = getFixtureLimit();
    let query = supabase
      .from("fixtures")
      .select("sportmonks_id,league_sportmonks_id,season_sportmonks_id,round_sportmonks_id,name,starting_at,raw")
      .not("starting_at", "is", null)
      .lte("starting_at", new Date().toISOString())
      .order("starting_at", { ascending: false })
      .limit(limit * 4);

    if (seasonId) query = query.eq("season_sportmonks_id", Number(seasonId));

    const { data: fixtures, error } = await query;
    if (error) throw error;

    const candidateFixtures = await prioritizeUnsyncedFixtures((fixtures ?? []) as FixtureCacheRow[], limit);

    for (const fixture of candidateFixtures) {
      recordsProcessed += await syncFixturePlayerStatistics(fixture);
    }

    await finishSyncLog(logId, "success", recordsProcessed);
    return { entity, status: "success", recordsProcessed } satisfies SyncJobResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown statistics sync error";
    await finishSyncLog(logId, "failed", recordsProcessed, message);
    return { entity, status: "failed", recordsProcessed, error: message } satisfies SyncJobResult;
  }
}

async function prioritizeUnsyncedFixtures(fixtures: FixtureCacheRow[], limit: number) {
  if (fixtures.length === 0) return [];

  const supabase = getSupabaseServiceClient();
  const fixtureIds = fixtures.map((fixture) => fixture.sportmonks_id);
  const { data } = await supabase
    .from("player_match_statistics")
    .select("fixture_sportmonks_id")
    .in("fixture_sportmonks_id", fixtureIds);

  const syncedFixtureIds = new Set((data ?? []).map((row) => Number(row.fixture_sportmonks_id)));
  const unsynced = fixtures.filter((fixture) => !syncedFixtureIds.has(fixture.sportmonks_id));
  return (unsynced.length > 0 ? unsynced : fixtures).slice(0, limit);
}

async function syncFixturePlayerStatistics(fixture: FixtureCacheRow) {
  const supabase = getSupabaseServiceClient();
  const response = await sportmonksFetch<FixtureDetail>(sportmonksEndpoints.fixture(fixture.sportmonks_id), {
    include: sportmonksIncludes.fixturePlayerStats
  });

  const detail = response.data;
  const state = readDeveloperState(detail);
  if (state && !COMPLETED_STATES.has(state)) return 0;

  const lineups = Array.isArray(detail.lineups) ? detail.lineups : [];
  const participantByTeam = buildParticipantMap(detail.participants);
  const rows = [];
  for (const lineup of lineups) {
    const row = normalizeLineupStatistics(detail, fixture, lineup, participantByTeam);
    if (row) rows.push(row);
  }

  if (rows.length === 0) return 0;

  const { error } = await supabase.from("player_match_statistics").upsert(rows, {
    onConflict: "fixture_sportmonks_id,player_sportmonks_id,team_sportmonks_id"
  });

  if (error) throw error;
  return rows.length;
}

function normalizeLineupStatistics(
  fixtureDetail: FixtureDetail,
  fixtureCache: FixtureCacheRow,
  lineup: Lineup,
  participantByTeam: Map<number, Participant>
) {
  const fixtureId = Number(fixtureDetail.id ?? fixtureCache.sportmonks_id);
  const playerId = Number(lineup.player_id);
  const teamId = Number(lineup.team_id ?? lineup.participant_id);

  if (!Number.isFinite(fixtureId) || !Number.isFinite(playerId) || !Number.isFinite(teamId)) return null;

  const details = Array.isArray(lineup.details) ? lineup.details : [];
  const metrics = details.reduce<Record<string, number | null>>((acc, detail) => {
    const metric = metricKey(detail);
    if (!metric) return acc;
    acc[metric] = numberFromDetail(detail);
    return acc;
  }, {});

  const opponentTeamId = findOpponentTeamId(teamId, participantByTeam);
  const location = participantByTeam.get(teamId)?.meta?.location ?? null;
  const score = scoreForTeam(fixtureDetail.scores, teamId);
  const opponentScore = opponentTeamId ? scoreForTeam(fixtureDetail.scores, opponentTeamId) : null;

  const passesTotal = firstMetric(metrics, "passes_total", "passes");
  const passesAccurate = firstMetric(metrics, "passes_accurate", "accurate_passes");
  const dribbleAttempts = firstMetric(metrics, "dribble_attempts", "dribbles_attempted", "dribbles_total");
  const dribblesSuccessful = firstMetric(metrics, "dribbles_successful", "successful_dribbles");

  return {
    fixture_sportmonks_id: fixtureId,
    player_sportmonks_id: playerId,
    team_sportmonks_id: teamId,
    opponent_team_sportmonks_id: opponentTeamId,
    league_sportmonks_id: numberOrNull(fixtureDetail.league_id ?? fixtureCache.league_sportmonks_id),
    season_sportmonks_id: numberOrNull(fixtureDetail.season_id ?? fixtureCache.season_sportmonks_id),
    round_sportmonks_id: numberOrNull(fixtureDetail.round_id ?? fixtureCache.round_sportmonks_id ?? fixtureDetail.round?.id),
    fixture_name: fixtureDetail.name ?? fixtureCache.name,
    round_name: fixtureDetail.round?.name ?? null,
    starting_at: fixtureDetail.starting_at ?? fixtureCache.starting_at,
    location,
    team_score: score,
    opponent_score: opponentScore,
    result: resultFor(score, opponentScore),
    minutes: firstMetric(metrics, "minutes", "minutes_played"),
    rating: firstMetric(metrics, "rating"),
    goals: firstMetric(metrics, "goals"),
    assists: firstMetric(metrics, "assists"),
    shots_total: firstMetric(metrics, "shots_total", "shots"),
    shots_on_target: firstMetric(metrics, "shots_on_target"),
    shots_off_target: firstMetric(metrics, "shots_off_target"),
    expected_goals: firstMetric(metrics, "expected_goals", "xg"),
    expected_goals_on_target: firstMetric(metrics, "expected_goals_on_target", "xgot"),
    expected_assists: firstMetric(metrics, "expected_assists", "xa", "xd"),
    shooting_performance: firstMetric(metrics, "shooting_performance"),
    passes_total: passesTotal,
    passes_accurate: passesAccurate,
    pass_accuracy: firstMetric(metrics, "pass_accuracy") ?? percentage(passesAccurate, passesTotal),
    key_passes: firstMetric(metrics, "key_passes"),
    chances_created: firstMetric(metrics, "chances_created"),
    big_chances_created: firstMetric(metrics, "big_chances_created"),
    passes_final_third: firstMetric(metrics, "passes_in_final_third"),
    backward_passes: firstMetric(metrics, "backward_passes"),
    crosses_total: firstMetric(metrics, "crosses_total", "crosses"),
    crosses_accurate: firstMetric(metrics, "crosses_accurate", "accurate_crosses"),
    accurate_crosses_percentage: firstMetric(metrics, "accurate_crosses_percentage", "successful_crosses_percentage"),
    long_balls_total: firstMetric(metrics, "long_balls_total", "long_balls"),
    long_balls_accurate: firstMetric(metrics, "long_balls_accurate", "accurate_long_balls", "long_balls_won", "successful_long_passes"),
    long_balls_won_percentage: firstMetric(metrics, "long_balls_won_percentage", "successful_long_passes_percentage"),
    touches: firstMetric(metrics, "touches"),
    dribble_attempts: dribbleAttempts,
    dribbles_successful: dribblesSuccessful,
    dribble_success_rate: firstMetric(metrics, "dribble_success_rate") ?? percentage(dribblesSuccessful, dribbleAttempts),
    possession_lost: firstMetric(metrics, "possession_lost"),
    dispossessed: firstMetric(metrics, "dispossessed"),
    turn_overs: firstMetric(metrics, "turn_over"),
    fouls_drawn: firstMetric(metrics, "fouls_drawn"),
    fouls_committed: firstMetric(metrics, "fouls_committed", "fouls"),
    tackles: firstMetric(metrics, "tackles"),
    tackles_won: firstMetric(metrics, "tackles_won"),
    tackles_won_percentage: firstMetric(metrics, "tackles_won_percentage"),
    interceptions: firstMetric(metrics, "interceptions"),
    clearances: firstMetric(metrics, "clearances"),
    blocks: firstMetric(metrics, "blocks"),
    duels_total: firstMetric(metrics, "duels_total", "duels"),
    duels_won: firstMetric(metrics, "duels_won"),
    duels_lost: firstMetric(metrics, "duels_lost"),
    duels_won_percentage: firstMetric(metrics, "duels_won_percentage"),
    aerials_total: firstMetric(metrics, "aerials_total", "aerial_duels"),
    aerials_won: firstMetric(metrics, "aerials_won", "aerial_duels_won"),
    aerials_lost: firstMetric(metrics, "aerials_lost", "aeriels_lost"),
    aerials_won_percentage: firstMetric(metrics, "aerials_won_percentage"),
    ball_recoveries: firstMetric(metrics, "ball_recovery"),
    saves: firstMetric(metrics, "saves"),
    goals_conceded: firstMetric(metrics, "goals_conceded"),
    yellow_cards: firstMetric(metrics, "yellow_cards"),
    red_cards: firstMetric(metrics, "red_cards"),
    raw_details: details,
    raw_lineup: lineup,
    raw_fixture: fixtureDetail,
    updated_at: new Date().toISOString()
  };
}

function getFixtureLimit() {
  const value = Number(process.env.SPORTMONKS_STATS_FIXTURE_LIMIT);
  return Number.isFinite(value) && value > 0 ? Math.min(value, 25) : DEFAULT_FIXTURE_LIMIT;
}

function buildParticipantMap(participants: Participant[] | undefined) {
  const map = new Map<number, Participant>();
  for (const participant of participants ?? []) {
    if (typeof participant.id === "number") map.set(participant.id, participant);
  }
  return map;
}

function findOpponentTeamId(teamId: number, participantByTeam: Map<number, Participant>) {
  return Array.from(participantByTeam.keys()).find((id) => id !== teamId) ?? null;
}

function scoreForTeam(scores: JsonRecord[] | undefined, teamId: number) {
  for (const score of scores ?? []) {
    const participantId = Number(score.participant_id);
    if (participantId !== teamId) continue;
    const scoreData = isRecord(score.score) ? score.score : {};
    const goals = firstNumber(scoreData.goals, scoreData.value, scoreData.current);
    if (goals !== null) return goals;
  }
  return null;
}

function resultFor(score: number | null, opponentScore: number | null) {
  if (score === null || opponentScore === null) return null;
  if (score > opponentScore) return "W";
  if (score < opponentScore) return "L";
  return "D";
}

function readDeveloperState(fixture: FixtureDetail) {
  const state = fixture.state;
  if (!isRecord(state)) return null;
  const developerName = state.developer_name;
  return typeof developerName === "string" ? developerName : null;
}

function metricKey(detail: JsonRecord) {
  const type = isRecord(detail.type) ? detail.type : {};
  const rawName = firstString(type.developer_name, type.code, type.name, detail.developer_name, detail.code, detail.name);
  if (!rawName) return null;
  return rawName
    .toLowerCase()
    .replaceAll("+", "_plus_")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function numberFromDetail(detail: JsonRecord) {
  const data = isRecord(detail.data) ? detail.data : {};
  const value = isRecord(detail.value) ? detail.value : {};
  return firstNumber(
    data.value,
    data.total,
    data.count,
    data.rating,
    value.value,
    value.total,
    value.count,
    detail.value,
    detail.total,
    detail.count
  );
}

function firstMetric(metrics: Record<string, number | null>, ...keys: string[]) {
  for (const key of keys) {
    const value = metrics[key];
    if (typeof value === "number") return value;
  }
  return null;
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

function numberOrNull(value: unknown) {
  return firstNumber(value);
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
