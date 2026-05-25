import { sportmonksEndpoints, sportmonksIncludes } from "../endpoints";
import { normalizePlayer } from "../normalize/players";
import { runSportmonksSync } from "./core";
import { upsertTransferMetadataFromPlayers } from "./transfer-metadata";

export function syncPlayers(page = "", maxPages = "") {
  const pageNumber = Number(page);
  const maxPageCount = Number(maxPages);

  return runSportmonksSync({
    entity: pageNumber > 0 ? `players:page:${pageNumber}` : "players",
    endpoint: sportmonksEndpoints.players,
    table: "players",
    query: {
      include: sportmonksIncludes.playerList,
      page: pageNumber > 0 ? pageNumber : undefined
    },
    maxPages: Number.isFinite(maxPageCount) && maxPageCount > 0 ? maxPageCount : undefined,
    normalize: normalizePlayer,
    afterPage: upsertTransferMetadataFromPlayers
  });
}
