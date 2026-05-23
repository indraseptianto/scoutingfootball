import { sportmonksEndpoints, sportmonksIncludes } from "../endpoints";
import { normalizeTransfer } from "../normalize/transfers";
import { runSportmonksSync } from "./core";

export function syncTransfers() {
  return runSportmonksSync({
    entity: "transfers",
    endpoint: sportmonksEndpoints.transfers,
    table: "transfers",
    query: { include: sportmonksIncludes.transfers },
    normalize: normalizeTransfer
  });
}
