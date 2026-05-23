import { sportmonksEndpoints } from "../endpoints";
import { normalizePosition } from "../normalize/positions";
import { runSportmonksSync } from "./core";

export function syncPositions() {
  return runSportmonksSync({
    entity: "positions",
    endpoint: sportmonksEndpoints.types,
    table: "positions",
    normalize: (row) => {
      const normalized = normalizePosition(row);
      const typeGroup = String(row.group ?? row.stat_group ?? row.model_type ?? "").toLowerCase();
      const developerName = String(row.developer_name ?? "").toLowerCase();
      const code = String(row.code ?? "").toLowerCase();
      const isPosition =
        typeGroup.includes("position") ||
        developerName.includes("goalkeeper") ||
        developerName.includes("defender") ||
        developerName.includes("midfield") ||
        developerName.includes("attacker") ||
        developerName.includes("wing") ||
        code.includes("back") ||
        code.includes("forward");

      return isPosition ? normalized : { sportmonks_id: null };
    }
  });
}
