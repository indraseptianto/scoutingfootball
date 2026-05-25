import { asDate, asNumber, type SportmonksEntity } from "./common";

export function normalizeSquadPlayer(item: SportmonksEntity, teamId?: number | string, seasonId?: number | string) {
  const player = item.player as SportmonksEntity | undefined;
  return {
    sportmonks_id: asNumber(item.id),
    team_sportmonks_id: Number(teamId ?? item.team_id),
    season_sportmonks_id: seasonId ? Number(seasonId) : asNumber(item.season_id),
    player_sportmonks_id: player ? asNumber(player.id) : asNumber(item.player_id),
    jersey_number: asNumber(item.jersey_number),
    position_sportmonks_id: asNumber(item.position_id),
    start_date: asDate(item.start_date),
    end_date: asDate(item.end_date),
    raw: item
  };
}
