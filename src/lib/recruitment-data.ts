import { hiddenGemTier } from "@/lib/hidden-gem";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export type RecruitmentPlayer = {
  id: string;
  sportmonks_id: number;
  display_name: string;
  position_name: string | null;
  nationality_name: string | null;
  image_path: string | null;
  date_of_birth: string | null;
  height: number | null;
  weight: number | null;
  preferred_foot: string | null;
  contract_expires_at: string | null;
  hidden_gem_score: number;
  stored_hidden_gem_score: number;
  club_name: string | null;
  club_sportmonks_id: number | null;
  latest_transfer_date: string | null;
  latest_transfer_type: string | null;
  minutes: number;
  rating: number | null;
  goals: number;
  assists: number;
  expected_goals: number;
  expected_assists: number;
  shots_total: number;
  shots_on_target: number;
  passes_accurate: number;
  passes_total: number;
  pass_accuracy: number | null;
  key_passes: number;
  tackles: number;
  interceptions: number;
  ball_recoveries: number;
  season_sportmonks_id: number | null;
};

export type RecruitmentDataset = {
  players: RecruitmentPlayer[];
  error: string | null;
};

type PlayerRow = {
  id: string;
  sportmonks_id: number;
  display_name: string;
  position_name: string | null;
  nationality_name: string | null;
  image_path: string | null;
  date_of_birth: string | null;
  height: number | null;
  weight: number | null;
  preferred_foot: string | null;
  contract_expires_at: string | null;
  hidden_gem_score: number;
};

type StatRow = {
  player_sportmonks_id: number;
  team_sportmonks_id: number | null;
  season_sportmonks_id: number | null;
  minutes: number | null;
  rating: number | null;
  goals: number | null;
  assists: number | null;
  expected_goals: number | null;
  expected_assists: number | null;
  shots_total: number | null;
  shots_on_target: number | null;
  passes_accurate: number | null;
  passes_total: number | null;
  pass_accuracy: number | null;
  key_passes: number | null;
  tackles: number | null;
  interceptions: number | null;
  ball_recoveries: number | null;
};

export async function getRecruitmentDataset(limit = 240): Promise<RecruitmentDataset> {
  try {
    const supabase = getSupabaseServiceClient();
    const { data: playerRows, error: playersError } = await supabase
      .from("players")
      .select("id,sportmonks_id,display_name,position_name,nationality_name,image_path,date_of_birth,height,weight,preferred_foot,contract_expires_at,hidden_gem_score")
      .not("position_name", "ilike", "%coach%")
      .limit(limit * 3);

    if (playersError) throw playersError;

    const players = ((playerRows ?? []) as PlayerRow[]).map((player) => ({
      ...player,
      sportmonks_id: Number(player.sportmonks_id),
      hidden_gem_score: Number(player.hidden_gem_score ?? 0),
      stored_hidden_gem_score: Number(player.hidden_gem_score ?? 0)
    }));
    const playerIds = players.map((player) => player.sportmonks_id);

    const [{ data: statRows }, { data: squadRows }, { data: transferRows }] = await Promise.all([
      playerIds.length > 0
        ? supabase
            .from("season_player_statistics")
            .select("player_sportmonks_id,team_sportmonks_id,season_sportmonks_id,minutes,rating,goals,assists,expected_goals,expected_assists,shots_total,shots_on_target,passes_accurate,passes_total,pass_accuracy,key_passes,tackles,interceptions,ball_recoveries")
            .in("player_sportmonks_id", playerIds)
            .order("minutes", { ascending: false, nullsFirst: false })
        : Promise.resolve({ data: [] }),
      playerIds.length > 0
        ? supabase
            .from("squad_players")
            .select("player_sportmonks_id,team_sportmonks_id")
            .in("player_sportmonks_id", playerIds)
        : Promise.resolve({ data: [] }),
      playerIds.length > 0
        ? supabase
            .from("transfers")
            .select("player_sportmonks_id,transfer_date,type_name")
            .in("player_sportmonks_id", playerIds)
            .order("transfer_date", { ascending: false, nullsFirst: false })
        : Promise.resolve({ data: [] })
    ]);

    const latestStats = new Map<number, StatRow>();
    for (const row of (statRows ?? []) as StatRow[]) {
      const playerId = Number(row.player_sportmonks_id);
      if (!latestStats.has(playerId)) latestStats.set(playerId, normalizeStat(row));
    }

    const teamByPlayer = new Map<number, number>();
    for (const row of (squadRows ?? []) as Array<{ player_sportmonks_id: number; team_sportmonks_id: number }>) {
      const playerId = Number(row.player_sportmonks_id);
      if (!teamByPlayer.has(playerId)) teamByPlayer.set(playerId, Number(row.team_sportmonks_id));
    }

    const teamIds = Array.from(new Set([
      ...Array.from(teamByPlayer.values()),
      ...Array.from(latestStats.values()).map((row) => Number(row.team_sportmonks_id)).filter(Boolean)
    ]));
    const { data: clubRows } = teamIds.length > 0
      ? await supabase.from("clubs").select("sportmonks_id,name").in("sportmonks_id", teamIds)
      : { data: [] };
    const clubById = new Map((clubRows ?? []).map((club) => [Number(club.sportmonks_id), String(club.name)]));
    const latestTransferByPlayer = new Map<number, { transfer_date: string | null; type_name: string | null }>();
    for (const row of (transferRows ?? []) as Array<{ player_sportmonks_id: number; transfer_date: string | null; type_name: string | null }>) {
      const playerId = Number(row.player_sportmonks_id);
      if (!latestTransferByPlayer.has(playerId)) {
        latestTransferByPlayer.set(playerId, {
          transfer_date: typeof row.transfer_date === "string" ? row.transfer_date : null,
          type_name: typeof row.type_name === "string" ? row.type_name : null
        });
      }
    }

    return {
      players: players.map((player) => {
        const stat = latestStats.get(player.sportmonks_id);
        const clubId = stat?.team_sportmonks_id ?? teamByPlayer.get(player.sportmonks_id) ?? null;
        const latestTransfer = latestTransferByPlayer.get(player.sportmonks_id);
        const hydratedPlayer = {
          ...player,
          club_sportmonks_id: clubId,
          club_name: clubId ? clubById.get(clubId) ?? null : null,
          latest_transfer_date: latestTransfer?.transfer_date ?? null,
          latest_transfer_type: latestTransfer?.type_name ?? null,
          minutes: stat?.minutes ?? 0,
          rating: stat?.rating ?? null,
          goals: stat?.goals ?? 0,
          assists: stat?.assists ?? 0,
          expected_goals: stat?.expected_goals ?? 0,
          expected_assists: stat?.expected_assists ?? 0,
          shots_total: stat?.shots_total ?? 0,
          shots_on_target: stat?.shots_on_target ?? 0,
          passes_accurate: stat?.passes_accurate ?? 0,
          passes_total: stat?.passes_total ?? 0,
          pass_accuracy: stat?.pass_accuracy ?? null,
          key_passes: stat?.key_passes ?? 0,
          tackles: stat?.tackles ?? 0,
          interceptions: stat?.interceptions ?? 0,
          ball_recoveries: stat?.ball_recoveries ?? 0,
          season_sportmonks_id: stat?.season_sportmonks_id ?? null
        };
        return {
          ...hydratedPlayer,
          hidden_gem_score: calculateLiveHiddenGemScore(hydratedPlayer)
        };
      }).sort((a, b) => b.hidden_gem_score - a.hidden_gem_score).slice(0, limit),
      error: null
    };
  } catch (error) {
    return {
      players: [],
      error: error instanceof Error ? error.message : "Unable to load recruitment data."
    };
  }
}

export function buildRecruitmentScore(player: RecruitmentPlayer) {
  const sampleFactor = minutesSampleFactor(player.minutes);
  const output = per90(player.goals + player.assists, player.minutes) * 18;
  const expected = per90(player.expected_goals + player.expected_assists, player.minutes) * 28;
  const creation = per90(player.key_passes, player.minutes) * 8;
  const defending = per90(player.tackles + player.interceptions + player.ball_recoveries, player.minutes) * 2.5;
  const rating = (player.rating ?? 6.2) * 6;
  const age = playerAge(player.date_of_birth);
  const ageBonus = age && age <= 23 ? 9 : age && age <= 26 ? 5 : 0;
  const contractBonus = contractStatusForPlayer(player).score;
  const raw = output + expected + creation + defending + rating + ageBonus + contractBonus;
  const capped = raw * sampleFactor;
  const sampleCeiling = player.minutes < 180 ? 58 : player.minutes < 450 ? 72 : 100;

  return Math.round(Math.max(0, Math.min(sampleCeiling, capped)));
}

export function buildScoutingSummary(player: RecruitmentPlayer) {
  const score = buildRecruitmentScore(player);
  const contract = contractStatusForPlayer(player);
  const strengths = [
    player.hidden_gem_score >= 75 ? `${hiddenGemTier(player.hidden_gem_score)} hidden-gem signal` : "Monitorable hidden-gem profile",
    player.minutes >= 900 ? "Reliable sample size from season minutes" : "Low-minute upside profile",
    per90(player.goals + player.assists, player.minutes) >= 0.35 ? "Direct goal contribution" : "Needs role-context review",
    per90(player.key_passes, player.minutes) >= 1.2 ? "Chance creation signal" : "Simple possession profile",
    per90(player.tackles + player.interceptions + player.ball_recoveries, player.minutes) >= 6 ? "Strong defensive activity" : "Defensive activity needs video validation"
  ];
  const risks = [
    contract.source === "exact" ? contract.label : `${contract.label} (${contract.source})`,
    player.minutes < 450 ? "Small statistical sample" : "Sample size acceptable",
    player.rating && player.rating < 6.6 ? "Below-threshold average rating" : "Rating profile stable"
  ];

  return {
    score,
    recommendation: score >= 78 ? "Priority Target" : score >= 64 ? "Scout Further" : score >= 50 ? "Watchlist" : "Monitor",
    strengths,
    risks,
    tacticalFit: tacticalFit(player),
    nextAction: score >= 78 ? "Request full video pack and check transfer feasibility." : score >= 64 ? "Assign scout review and compare against positional shortlist." : "Keep in monitoring lane until more minutes or contract movement."
  };
}

export function contractStatus(value: string | null) {
  if (!value) return { label: "Unknown", urgency: "medium", score: 3 };
  const expiry = new Date(value);
  if (Number.isNaN(expiry.getTime())) return { label: "Unknown", urgency: "medium", score: 3 };
  const days = Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "Expired", urgency: "high", score: 12 };
  if (days <= 180) return { label: "Expires in 6 months", urgency: "high", score: 10 };
  if (days <= 365) return { label: "Expires in 12 months", urgency: "medium", score: 7 };
  return { label: "Long contract", urgency: "low", score: 0 };
}

export function contractStatusForPlayer(player: Pick<RecruitmentPlayer, "contract_expires_at" | "latest_transfer_date" | "latest_transfer_type">) {
  const exact = contractStatus(player.contract_expires_at);
  if (player.contract_expires_at) return { ...exact, source: "exact" as const };

  if (player.latest_transfer_date) {
    const transfer = new Date(player.latest_transfer_date);
    if (!Number.isNaN(transfer.getTime())) {
      const monthsSinceTransfer = (Date.now() - transfer.getTime()) / 2_592_000_000;
      if (monthsSinceTransfer <= 18) {
        return {
          label: "Likely secured after recent transfer",
          urgency: "low" as const,
          score: 0,
          source: "transfer inference" as const
        };
      }
      if (monthsSinceTransfer >= 42) {
        return {
          label: "Possible contract opportunity",
          urgency: "medium" as const,
          score: 5,
          source: "transfer inference" as const
        };
      }
    }
  }

  return {
    label: "Needs metadata sync",
    urgency: "medium" as const,
    score: 2,
    source: "missing Sportmonks metadata" as const
  };
}

export function calculateLiveHiddenGemScore(player: RecruitmentPlayer) {
  const age = playerAge(player.date_of_birth);
  const output = clamp(per90(player.goals + player.assists, player.minutes) * 90);
  const expected = clamp(per90(player.expected_goals + player.expected_assists, player.minutes) * 110);
  const creation = clamp(per90(player.key_passes, player.minutes) * 32);
  const defending = clamp(per90(player.tackles + player.interceptions + player.ball_recoveries, player.minutes) * 10);
  const rating = clamp(((player.rating ?? 6.4) - 6) * 42);
  const performanceRatio = clamp(output * 0.24 + expected * 0.26 + creation * 0.16 + defending * 0.18 + rating * 0.16);
  const ageBonus = age && age <= 21 ? 100 : age && age <= 23 ? 82 : age && age <= 25 ? 58 : age && age <= 28 ? 28 : 10;
  const contractOpportunity = clamp(contractStatusForPlayer(player).score * 8);
  const consistency = player.rating ? clamp((player.rating - 5.8) * 32) : 38;
  const leagueLevelBonus = 65;
  const storedSignal = clamp(player.stored_hidden_gem_score);
  const sampleFactor = minutesSampleFactor(player.minutes);
  const raw =
    performanceRatio * 0.3 +
    leagueLevelBonus * 0.12 +
    ageBonus * 0.15 +
    contractOpportunity * 0.18 +
    consistency * 0.1 +
    storedSignal * 0.15;
  const capped = raw * sampleFactor;
  const sampleCeiling = player.minutes < 180 ? 52 : player.minutes < 450 ? 68 : player.minutes < 900 ? 84 : 100;

  return Math.round(Math.max(0, Math.min(sampleCeiling, capped)));
}

export function playerAge(value: string | null) {
  if (!value) return null;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function per90(value: number, minutes: number) {
  return minutes > 0 ? (value * 90) / minutes : 0;
}

export function formatDecimal(value: number | null, digits = 2) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(digits) : "-";
}

function tacticalFit(player: RecruitmentPlayer) {
  const position = (player.position_name ?? "").toLowerCase();
  if (position.includes("wing") || position.includes("attacker") || position.includes("striker")) {
    return "Transition attack, high-volume final-third touches, and box-entry scouting.";
  }
  if (position.includes("mid")) {
    return "Ball progression, chance creation, and counter-press recovery profile.";
  }
  if (position.includes("back") || position.includes("defender")) {
    return "Defensive duel coverage, aerial security, and buildup reliability.";
  }
  if (position.includes("goal")) {
    return "Shot-stopping baseline, distribution comfort, and command profile.";
  }
  return "Role fit should be validated against team model and video evidence.";
}

function normalizeStat(row: StatRow): StatRow {
  return {
    player_sportmonks_id: Number(row.player_sportmonks_id),
    team_sportmonks_id: nullableNumber(row.team_sportmonks_id),
    season_sportmonks_id: nullableNumber(row.season_sportmonks_id),
    minutes: nullableNumber(row.minutes) ?? 0,
    rating: nullableNumber(row.rating),
    goals: nullableNumber(row.goals) ?? 0,
    assists: nullableNumber(row.assists) ?? 0,
    expected_goals: nullableNumber(row.expected_goals) ?? 0,
    expected_assists: nullableNumber(row.expected_assists) ?? 0,
    shots_total: nullableNumber(row.shots_total) ?? 0,
    shots_on_target: nullableNumber(row.shots_on_target) ?? 0,
    passes_accurate: nullableNumber(row.passes_accurate) ?? 0,
    passes_total: nullableNumber(row.passes_total) ?? 0,
    pass_accuracy: nullableNumber(row.pass_accuracy),
    key_passes: nullableNumber(row.key_passes) ?? 0,
    tackles: nullableNumber(row.tackles) ?? 0,
    interceptions: nullableNumber(row.interceptions) ?? 0,
    ball_recoveries: nullableNumber(row.ball_recoveries) ?? 0
  };
}

function nullableNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function minutesSampleFactor(minutes: number) {
  if (minutes >= 900) return 1;
  if (minutes >= 450) return 0.86;
  if (minutes >= 180) return 0.68;
  if (minutes > 0) return 0.48;
  return 0.28;
}

function clamp(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}
