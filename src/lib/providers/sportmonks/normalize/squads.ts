import { asNumber, type SportmonksEntity } from "./common";

export function normalizeSquadPlayer(item: SportmonksEntity, teamId?: number | string, seasonId?: number | string) {
  const player = item.player as SportmonksEntity | undefined;
  return {
    sportmonks_id: asNumber(item.id),
    team_sportmonks_id: Number(teamId ?? item.team_id),
    season_sportmonks_id: seasonId ? Number(seasonId) : asNumber(item.season_id),
    player_sportmonks_id: player ? asNumber(player.id) : asNumber(item.player_id),
    jersey_number: asNumber(item.jersey_number),
    raw: item
  };
}
