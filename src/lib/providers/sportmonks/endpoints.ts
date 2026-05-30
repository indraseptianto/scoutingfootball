export const SPORTMONKS_BASE_URL = "https://api.sportmonks.com/v3/football";
export const SPORTMONKS_CORE_BASE_URL = "https://api.sportmonks.com/v3/core";

export const sportmonksEndpoints = {
  leagues: "/leagues",
  seasons: "/seasons",
  teams: "/teams",
  team: (teamId: number | string) => `/teams/${teamId}`,
  teamsBySeason: (seasonId: number | string) => `/teams/seasons/${seasonId}`,
  teamSearch: (query: string) => `/teams/search/${encodeURIComponent(query)}`,
  squadsByTeam: (teamId: number | string) => `/squads/teams/${teamId}`,
  squadsBySeasonTeam: (seasonId: number | string, teamId: number | string) => `/squads/seasons/${seasonId}/teams/${teamId}`,
  players: "/players",
  player: (playerId: number | string) => `/players/${playerId}`,
  playerSearch: (query: string) => `/players/search/${encodeURIComponent(query)}`,
  latestPlayers: "/players/latest",
  playerSeasonStats: (seasonId: number | string) => `/statistics/seasons/players/${seasonId}`,
  fixtures: "/fixtures",
  fixture: (fixtureId: number | string) => `/fixtures/${fixtureId}`,
  fixturesByDate: (date: string) => `/fixtures/date/${date}`,
  fixturesBetween: (startDate: string, endDate: string) => `/fixtures/between/${startDate}/${endDate}`,
  fixturesBetweenForTeam: (startDate: string, endDate: string, teamId: number | string) =>
    `/fixtures/between/${startDate}/${endDate}/teams/${teamId}`,
  standingsBySeason: (seasonId: number | string) => `/standings/seasons/${seasonId}`,
  transfers: "/transfers",
  latestTransfers: "/transfers/latest",
  transfersByPlayer: (playerId: number | string) => `/transfers/players/${playerId}`,
  transfersByTeam: (teamId: number | string) => `/transfers/teams/${teamId}`,
  countries: `${SPORTMONKS_CORE_BASE_URL}/countries`,
  types: `${SPORTMONKS_CORE_BASE_URL}/types`,
  fixtureEvents: (fixtureId: number | string) => `/fixtures/${fixtureId}/events`,
  fixtureLineups: (fixtureId: number | string) => `/fixtures/${fixtureId}/lineups`,
  coaches: "/coaches",
  coach: (coachId: number | string) => `/coaches/${coachId}`,
  teamStatistics: (teamId: number | string, seasonId?: number | string) =>
    seasonId ? `/statistics/seasons/teams/${teamId}/${seasonId}` : `/statistics/seasons/teams/${teamId}`
} as const;

export const sportmonksIncludes = {
  playerList: "position;detailedPosition;country;nationality;metadata;teams.team;transfers;pendingTransfers",
  playerDetail: "position;detailedPosition;country;nationality;metadata;teams.team;statistics.details.type;transfers.fromTeam;transfers.toTeam;pendingTransfers.fromTeam;pendingTransfers.toTeam",
  squad: "player.position;player.detailedPosition;player.country;player.nationality;player.metadata;player.transfers;player.pendingTransfers;player.statistics.details",
  fixtures: "participants;scores;state;league;round",
  fixturePlayerStats: "participants;scores;state;league;round;lineups.details.type;lineups.type;lineups.position;lineups.player",
  transfers: "player;fromTeam;toTeam;type"
} as const;
