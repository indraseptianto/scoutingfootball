export type JsonRecord = Record<string, unknown>;

export type MetricMap = Record<string, number | null>;

export type NormalizedFootballMetrics = {
  appearances: number | null;
  starts: number | null;
  minutes: number | null;
  rating: number | null;
  goals: number | null;
  assists: number | null;
  expected_goals: number | null;
  expected_goals_on_target: number | null;
  expected_assists: number | null;
  shooting_performance: number | null;
  shots_total: number | null;
  shots_on_target: number | null;
  shots_off_target: number | null;
  passes_total: number | null;
  passes_accurate: number | null;
  pass_accuracy: number | null;
  key_passes: number | null;
  chances_created: number | null;
  big_chances_created: number | null;
  passes_final_third: number | null;
  backward_passes: number | null;
  crosses_total: number | null;
  crosses_accurate: number | null;
  accurate_crosses_percentage: number | null;
  long_balls_total: number | null;
  long_balls_accurate: number | null;
  long_balls_won_percentage: number | null;
  touches: number | null;
  dribble_attempts: number | null;
  dribbles_successful: number | null;
  dribble_success_rate: number | null;
  possession_lost: number | null;
  dispossessed: number | null;
  turn_overs: number | null;
  ball_recoveries: number | null;
  fouls_drawn: number | null;
  fouls_committed: number | null;
  tackles: number | null;
  tackles_won: number | null;
  tackles_won_percentage: number | null;
  interceptions: number | null;
  clearances: number | null;
  blocks: number | null;
  duels_total: number | null;
  duels_won: number | null;
  duels_lost: number | null;
  duels_won_percentage: number | null;
  aerials_total: number | null;
  aerials_won: number | null;
  aerials_lost: number | null;
  aerials_won_percentage: number | null;
  saves: number | null;
  goals_conceded: number | null;
  yellow_cards: number | null;
  red_cards: number | null;
};

const aliases = {
  appearances: ["appearances"],
  starts: ["lineups", "starts", "started"],
  minutes: ["minutes", "minutes_played"],
  rating: ["rating"],
  goals: ["goals"],
  assists: ["assists"],
  expected_goals: ["expected_goals", "xg"],
  expected_goals_on_target: ["expected_goals_on_target", "xgot"],
  expected_assists: ["expected_assists", "xa", "xd"],
  shooting_performance: ["shooting_performance"],
  shots_total: ["shots_total", "shots"],
  shots_on_target: ["shots_on_target"],
  shots_off_target: ["shots_off_target"],
  passes_total: ["passes_total", "passes"],
  passes_accurate: ["passes_accurate", "accurate_passes"],
  pass_accuracy: ["accurate_passes_percentage", "pass_accuracy"],
  key_passes: ["key_passes"],
  chances_created: ["chances_created"],
  big_chances_created: ["big_chances_created"],
  passes_final_third: ["passes_in_final_third", "passes_final_third"],
  backward_passes: ["backward_passes"],
  crosses_total: ["total_crosses", "crosses_total", "crosses"],
  crosses_accurate: ["accurate_crosses", "crosses_accurate"],
  accurate_crosses_percentage: ["accurate_crosses_percentage", "successful_crosses_percentage"],
  long_balls_total: ["long_balls_total", "long_balls"],
  long_balls_accurate: ["long_balls_accurate", "accurate_long_balls", "long_balls_won", "successful_long_passes"],
  long_balls_won_percentage: ["long_balls_won_percentage", "successful_long_passes_percentage"],
  touches: ["touches"],
  dribble_attempts: ["dribble_attempts", "dribbled_attempts", "dribbles_attempted", "dribbles_total"],
  dribbles_successful: ["dribbles_successful", "successful_dribbles"],
  dribble_success_rate: ["dribble_success_rate"],
  possession_lost: ["possession_lost"],
  dispossessed: ["dispossessed"],
  turn_overs: ["turn_over", "turn_overs"],
  ball_recoveries: ["ball_recovery", "ball_recoveries"],
  fouls_drawn: ["fouls_drawn"],
  fouls_committed: ["fouls", "fouls_committed"],
  tackles: ["tackles"],
  tackles_won: ["tackles_won"],
  tackles_won_percentage: ["tackles_won_percentage"],
  interceptions: ["interceptions"],
  clearances: ["clearances"],
  blocks: ["blocks"],
  duels_total: ["duels_total", "total_duels", "duels"],
  duels_won: ["duels_won"],
  duels_lost: ["duels_lost"],
  duels_won_percentage: ["duels_won_percentage"],
  aerials_total: ["aerials_total", "aerial_duels", "aerials"],
  aerials_won: ["aerials_won", "aerial_duels_won"],
  aerials_lost: ["aerials_lost", "aeriels_lost"],
  aerials_won_percentage: ["aerials_won_percentage"],
  saves: ["saves"],
  goals_conceded: ["goals_conceded"],
  yellow_cards: ["yellowcards", "yellow_cards"],
  red_cards: ["redcards", "red_cards"]
} satisfies Record<keyof NormalizedFootballMetrics, string[]>;

export function extractSportmonksDetails(row: JsonRecord) {
  if (Array.isArray(row.details)) return row.details.filter(isRecord);
  const statistic = isRecord(row.statistics) ? row.statistics : {};
  if (Array.isArray(statistic.details)) return statistic.details.filter(isRecord);
  return [];
}

export function buildMetricMap(details: JsonRecord[]) {
  return details.reduce<MetricMap>((acc, detail) => {
    const key = metricKey(detail);
    if (!key) return acc;
    acc[key] = numberFromDetail(detail);
    return acc;
  }, {});
}

export function normalizeFootballMetrics(detailsOrMap: JsonRecord[] | MetricMap): NormalizedFootballMetrics {
  const metrics = Array.isArray(detailsOrMap) ? buildMetricMap(detailsOrMap) : detailsOrMap;
  const passesTotal = readMetric(metrics, "passes_total");
  const passesAccurate = readMetric(metrics, "passes_accurate");
  const dribbleAttempts = readMetric(metrics, "dribble_attempts");
  const dribblesSuccessful = readMetric(metrics, "dribbles_successful");
  const duelsTotal = readMetric(metrics, "duels_total");
  const duelsWon = readMetric(metrics, "duels_won");
  const aerialsTotal = readMetric(metrics, "aerials_total");
  const aerialsWon = readMetric(metrics, "aerials_won");

  return {
    appearances: readMetric(metrics, "appearances"),
    starts: readMetric(metrics, "starts"),
    minutes: readMetric(metrics, "minutes"),
    rating: readMetric(metrics, "rating"),
    goals: readMetric(metrics, "goals"),
    assists: readMetric(metrics, "assists"),
    expected_goals: readMetric(metrics, "expected_goals"),
    expected_goals_on_target: readMetric(metrics, "expected_goals_on_target"),
    expected_assists: readMetric(metrics, "expected_assists"),
    shooting_performance: readMetric(metrics, "shooting_performance"),
    shots_total: readMetric(metrics, "shots_total"),
    shots_on_target: readMetric(metrics, "shots_on_target"),
    shots_off_target: readMetric(metrics, "shots_off_target"),
    passes_total: passesTotal,
    passes_accurate: passesAccurate,
    pass_accuracy: readMetric(metrics, "pass_accuracy") ?? percentage(passesAccurate, passesTotal),
    key_passes: readMetric(metrics, "key_passes"),
    chances_created: readMetric(metrics, "chances_created"),
    big_chances_created: readMetric(metrics, "big_chances_created"),
    passes_final_third: readMetric(metrics, "passes_final_third"),
    backward_passes: readMetric(metrics, "backward_passes"),
    crosses_total: readMetric(metrics, "crosses_total"),
    crosses_accurate: readMetric(metrics, "crosses_accurate"),
    accurate_crosses_percentage: readMetric(metrics, "accurate_crosses_percentage"),
    long_balls_total: readMetric(metrics, "long_balls_total"),
    long_balls_accurate: readMetric(metrics, "long_balls_accurate"),
    long_balls_won_percentage: readMetric(metrics, "long_balls_won_percentage"),
    touches: readMetric(metrics, "touches"),
    dribble_attempts: dribbleAttempts,
    dribbles_successful: dribblesSuccessful,
    dribble_success_rate: readMetric(metrics, "dribble_success_rate") ?? percentage(dribblesSuccessful, dribbleAttempts),
    possession_lost: readMetric(metrics, "possession_lost"),
    dispossessed: readMetric(metrics, "dispossessed"),
    turn_overs: readMetric(metrics, "turn_overs"),
    ball_recoveries: readMetric(metrics, "ball_recoveries"),
    fouls_drawn: readMetric(metrics, "fouls_drawn"),
    fouls_committed: readMetric(metrics, "fouls_committed"),
    tackles: readMetric(metrics, "tackles"),
    tackles_won: readMetric(metrics, "tackles_won"),
    tackles_won_percentage: readMetric(metrics, "tackles_won_percentage"),
    interceptions: readMetric(metrics, "interceptions"),
    clearances: readMetric(metrics, "clearances"),
    blocks: readMetric(metrics, "blocks"),
    duels_total: duelsTotal,
    duels_won: duelsWon,
    duels_lost: readMetric(metrics, "duels_lost"),
    duels_won_percentage: readMetric(metrics, "duels_won_percentage") ?? percentage(duelsWon, duelsTotal),
    aerials_total: aerialsTotal,
    aerials_won: aerialsWon,
    aerials_lost: readMetric(metrics, "aerials_lost"),
    aerials_won_percentage: readMetric(metrics, "aerials_won_percentage") ?? percentage(aerialsWon, aerialsTotal),
    saves: readMetric(metrics, "saves"),
    goals_conceded: readMetric(metrics, "goals_conceded"),
    yellow_cards: readMetric(metrics, "yellow_cards"),
    red_cards: readMetric(metrics, "red_cards")
  };
}

export function readMetric(metrics: MetricMap, key: keyof NormalizedFootballMetrics, ...extraAliases: string[]) {
  for (const alias of [...aliases[key], ...extraAliases]) {
    const value = metrics[canonicalMetricKey(alias)];
    if (typeof value === "number") return value;
  }
  return null;
}

export function percentage(part: number | null, total: number | null) {
  if (part === null || total === null || total <= 0) return null;
  return Number(((part / total) * 100).toFixed(1));
}

export function firstNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

export function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  return null;
}

export function metricKey(detail: JsonRecord) {
  const type = isRecord(detail.type) ? detail.type : {};
  const rawName = firstString(type.developer_name, type.code, type.name, detail.developer_name, detail.code, detail.name);
  return rawName ? canonicalMetricKey(rawName) : null;
}

export function canonicalMetricKey(value: string) {
  return value
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

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
