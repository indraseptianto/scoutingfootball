import { sportmonksEndpoints, sportmonksIncludes } from "../endpoints";
import { normalizePlayer } from "../normalize/players";
import { runSportmonksSync } from "./core";

export function syncPlayers() {
  return runSportmonksSync({
    entity: "players",
    endpoint: sportmonksEndpoints.players,
    table: "players",
    query: { include: sportmonksIncludes.playerList },
    normalize: normalizePlayer
  });
}
