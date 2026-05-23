import { sportmonksFetch } from "./client";
import { sportmonksEndpoints, sportmonksIncludes } from "./endpoints";

export const sportmonksApi = {
  leagues: () => sportmonksFetch(sportmonksEndpoints.leagues),
  seasons: () => sportmonksFetch(sportmonksEndpoints.seasons),
  teams: () => sportmonksFetch(sportmonksEndpoints.teams),
  team: (teamId: number | string) => sportmonksFetch(sportmonksEndpoints.team(teamId)),
  searchTeams: (query: string) => sportmonksFetch(sportmonksEndpoints.teamSearch(query)),
  squadByTeam: (teamId: number | string) =>
    sportmonksFetch(sportmonksEndpoints.squadsByTeam(teamId), { include: sportmonksIncludes.squad }),
  squadBySeasonTeam: (seasonId: number | string, teamId: number | string) =>
    sportmonksFetch(sportmonksEndpoints.squadsBySeasonTeam(seasonId, teamId), { include: sportmonksIncludes.squad }),
  players: () => sportmonksFetch(sportmonksEndpoints.players, { include: sportmonksIncludes.playerList }),
  player: (playerId: number | string) =>
    sportmonksFetch(sportmonksEndpoints.player(playerId), { include: sportmonksIncludes.playerDetail }),
  searchPlayers: (query: string) => sportmonksFetch(sportmonksEndpoints.playerSearch(query)),
  latestPlayers: () => sportmonksFetch(sportmonksEndpoints.latestPlayers),
  playerSeasonStats: (seasonId: number | string) => sportmonksFetch(sportmonksEndpoints.playerSeasonStats(seasonId)),
  fixtures: () => sportmonksFetch(sportmonksEndpoints.fixtures, { include: sportmonksIncludes.fixtures }),
  fixture: (fixtureId: number | string) => sportmonksFetch(sportmonksEndpoints.fixture(fixtureId)),
  fixturesByDate: (date: string) => sportmonksFetch(sportmonksEndpoints.fixturesByDate(date)),
  fixturesBetween: (startDate: string, endDate: string) =>
    sportmonksFetch(sportmonksEndpoints.fixturesBetween(startDate, endDate), { include: sportmonksIncludes.fixtures }),
  fixturesBetweenForTeam: (startDate: string, endDate: string, teamId: number | string) =>
    sportmonksFetch(sportmonksEndpoints.fixturesBetweenForTeam(startDate, endDate, teamId), {
      include: sportmonksIncludes.fixtures
    }),
  standingsBySeason: (seasonId: number | string) => sportmonksFetch(sportmonksEndpoints.standingsBySeason(seasonId)),
  transfers: () => sportmonksFetch(sportmonksEndpoints.transfers, { include: sportmonksIncludes.transfers }),
  latestTransfers: () => sportmonksFetch(sportmonksEndpoints.latestTransfers),
  transfersByPlayer: (playerId: number | string) => sportmonksFetch(sportmonksEndpoints.transfersByPlayer(playerId)),
  transfersByTeam: (teamId: number | string) => sportmonksFetch(sportmonksEndpoints.transfersByTeam(teamId)),
  countries: () => sportmonksFetch(sportmonksEndpoints.countries),
  positions: () => sportmonksFetch(sportmonksEndpoints.positions),
  types: () => sportmonksFetch(sportmonksEndpoints.types)
};
