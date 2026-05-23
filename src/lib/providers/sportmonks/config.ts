const DEFAULT_TARGET_LEAGUES = ["La Liga", "Premier League", "Championship", "League One", "League Two"];

export function getTargetLeagueNames() {
  return (process.env.SPORTMONKS_TARGET_LEAGUE_NAMES ?? DEFAULT_TARGET_LEAGUES.join(","))
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}
