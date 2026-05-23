import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { finishSyncLog, startSyncLog, type SyncJobResult } from "./core";

const SPORTMONKS_PLAYER_POSITIONS = [
  { sportmonks_id: 24, name: "Goalkeeper", code: "goalkeeper", developer_name: "GOALKEEPER", parent_id: null },
  { sportmonks_id: 25, name: "Defender", code: "defender", developer_name: "DEFENDER", parent_id: null },
  { sportmonks_id: 26, name: "Midfielder", code: "midfielder", developer_name: "MIDFIELDER", parent_id: null },
  { sportmonks_id: 27, name: "Attacker", code: "attacker", developer_name: "ATTACKER", parent_id: null },
  { sportmonks_id: 28, name: "Unknown", code: "unknown", developer_name: "UNKNOWN", parent_id: null },
  { sportmonks_id: 148, name: "Centre Back", code: "centre-back", developer_name: "CENTRE_BACK", parent_id: 25 },
  { sportmonks_id: 149, name: "Defensive Midfield", code: "defensive-midfield", developer_name: "DEFENSIVE_MIDFIELD", parent_id: 26 },
  { sportmonks_id: 150, name: "Attacking Midfield", code: "attacking-midfield", developer_name: "ATTACKING_MIDFIELD", parent_id: 26 },
  { sportmonks_id: 151, name: "Centre Forward", code: "centre-forward", developer_name: "CENTRE_FORWARD", parent_id: 27 },
  { sportmonks_id: 152, name: "Left Wing", code: "left-wing", developer_name: "LEFT_WING", parent_id: 27 },
  { sportmonks_id: 153, name: "Central Midfield", code: "central-midfield", developer_name: "CENTRAL_MIDFIELD", parent_id: 26 },
  { sportmonks_id: 154, name: "Right Back", code: "right-back", developer_name: "RIGHT_BACK", parent_id: 25 },
  { sportmonks_id: 155, name: "Left Back", code: "left-back", developer_name: "LEFT_BACK", parent_id: 25 },
  { sportmonks_id: 156, name: "Right Wing", code: "right-wing", developer_name: "RIGHT_WING", parent_id: 27 },
  { sportmonks_id: 157, name: "Left Midfield", code: "left-midfield", developer_name: "LEFT_MIDFIELD", parent_id: 26 },
  { sportmonks_id: 158, name: "Right Midfield", code: "right-midfield", developer_name: "RIGHT_MIDFIELD", parent_id: 26 },
  { sportmonks_id: 163, name: "Secondary Striker", code: "secondary-striker", developer_name: "SECONDARY_STRIKER", parent_id: 27 }
];

export async function syncPositions(): Promise<SyncJobResult> {
  const supabase = getSupabaseServiceClient();
  const logId = await startSyncLog("positions");

  try {
    const rows = SPORTMONKS_PLAYER_POSITIONS.map((position) => ({
      sportmonks_id: position.sportmonks_id,
      name: position.name,
      code: position.code,
      developer_name: position.developer_name,
      raw: position
    }));

    const { error } = await supabase.from("positions").upsert(rows, { onConflict: "sportmonks_id" });
    if (error) throw error;

    await finishSyncLog(logId, "success", rows.length);
    return { entity: "positions", status: "success", recordsProcessed: rows.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown positions sync error";
    await finishSyncLog(logId, "failed", 0, message);
    return { entity: "positions", status: "failed", recordsProcessed: 0, error: message };
  }
}
