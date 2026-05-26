import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { firstNumber, firstString, normalizeFootballMetrics, percentage } from "../metrics";
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

export async function syncStatistics(seasonId = process.env.SPORTMONKS_DEFAULT_SEASON_ID, mode = "") {
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

    const cachedFixtures = (fixtures ?? []) as FixtureCacheRow[];
    const candidateFixtures =
      mode === "refresh" ? cachedFixtures.slice(0, limit) : await prioritizeUnsyncedFixtures(cachedFixtures, limit);
    const fixtureErrors: string[] = [];

    for (const fixture of candidateFixtures) {
      try {
        recordsProcessed += await syncFixturePlayerStatistics(fixture);
      } catch (error) {
        fixtureErrors.push(`${fixture.sportmonks_id}: ${serializeError(error)}`);
      }
    }

    const errorSummary = fixtureErrors.length > 0 ? fixtureErrors.slice(0, 5).join(" | ") : undefined;
    await finishSyncLog(logId, "success", recordsProcessed, errorSummary);
    return { entity, status: "success", recordsProcessed, error: errorSummary } satisfies SyncJobResult;
  } catch (error) {
    const message = serializeError(error);
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
  const metrics = normalizeFootballMetrics(details);

  const opponentTeamId = findOpponentTeamId(teamId, participantByTeam);
  const location = participantByTeam.get(teamId)?.meta?.location ?? null;
  const score = scoreForTeam(fixtureDetail.scores, teamId);
  const opponentScore = opponentTeamId ? scoreForTeam(fixtureDetail.scores, opponentTeamId) : null;

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
    ...metrics,
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

function numberOrNull(value: unknown) {
  return firstNumber(value);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
