import {
  ArrowLeft,
  BarChart3,
  CircleDot,
  Dumbbell,
  Footprints,
  Gauge,
  MapPin,
  Shield,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { hiddenGemTier } from "@/lib/hidden-gem";

export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPlayerDetail(Number(id));

  if (data.error) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
        <Button variant="ghost" asChild><a href="/players"><ArrowLeft size={16} /> Players</a></Button>
        <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{data.error}</div>
      </main>
    );
  }

  if (!data.player) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
        <Button variant="ghost" asChild><a href="/players"><ArrowLeft size={16} /> Players</a></Button>
        <p className="mt-6 text-muted">Player not found.</p>
      </main>
    );
  }

  const dashboard = buildDashboard(data.matchStats);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <Button variant="ghost" asChild><a href="/players"><ArrowLeft size={16} /> Players</a></Button>

      <section className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative min-h-[340px] p-6 md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,255,135,0.16),transparent_28rem)]" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-end">
              <div className="flex h-44 w-44 shrink-0 items-end justify-center overflow-hidden rounded-lg border border-border bg-black/30">
                {data.player.image_path ? (
                  <img src={data.player.image_path} alt={data.player.display_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl font-semibold text-accent">
                    {initials(data.player.display_name)}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-accent">Player Profile</p>
                <h1 className="mt-2 text-4xl font-semibold md:text-5xl">{data.player.display_name}</h1>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <Badge>{data.player.position_name ?? "Unknown position"}</Badge>
                  <Badge>{data.player.nationality_name ?? "Unknown nationality"}</Badge>
                  {data.club ? <Badge href={`/clubs/${data.club.sportmonks_id}`}>{data.club.name}</Badge> : <Badge>Unassigned</Badge>}
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <HeroMetric icon={<Star size={16} />} label="Gem Tier" value={hiddenGemTier(data.player.hidden_gem_score)} />
                  <HeroMetric icon={<Gauge size={16} />} label="Avg Rating" value={formatDecimal(dashboard.averages.rating)} />
                  <HeroMetric icon={<Timer size={16} />} label="Cached Matches" value={String(dashboard.appearances)} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border bg-black/20 p-6 md:p-8 lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted">Recruitment Signal</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="font-mono text-5xl font-semibold text-accent">{data.player.hidden_gem_score}</span>
                  <span className="rounded-md border border-border px-3 py-1 text-sm">{hiddenGemTier(data.player.hidden_gem_score)}</span>
                </div>
              </div>
              {data.club?.image_path ? <img src={data.club.image_path} alt={data.club.name} className="h-16 w-16 rounded-md object-contain" /> : null}
            </div>

            <div className="mt-6 grid gap-3 text-sm">
              <Fact label="Age" value={ageFromDate(data.player.date_of_birth)} />
              <Fact label="Foot" value={data.player.preferred_foot ?? "Unknown"} />
              <Fact label="Height / Weight" value={`${data.player.height ? `${data.player.height} cm` : "-"} / ${data.player.weight ? `${data.player.weight} kg` : "-"}`} />
              <Fact label="Contract" value={data.player.contract_expires_at ? formatLongDate(data.player.contract_expires_at) : "Unknown"} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={<Timer size={18} />} label="Minutes" value={formatNumber(dashboard.totals.minutes)} sub={`${formatDecimal(dashboard.averages.minutes)} avg`} />
        <MetricCard icon={<Target size={18} />} label="xG / Shots" value={`${formatDecimal(dashboard.totals.expectedGoals)} / ${formatNumber(dashboard.totals.shots)}`} sub={`${formatDecimal(dashboard.per90.expectedGoals)} xG per 90`} />
        <MetricCard icon={<CircleDot size={18} />} label="Pass Accuracy" value={formatPercent(dashboard.averages.passAccuracy)} sub={`${formatNumber(dashboard.totals.passesAccurate)}/${formatNumber(dashboard.totals.passesTotal)} passes`} />
        <MetricCard icon={<Shield size={18} />} label="Def Actions" value={formatNumber(dashboard.totals.defensiveActions)} sub={`${formatDecimal(dashboard.per90.defensiveActions)} per 90`} />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles size={18} /> Attribute Profile</CardTitle>
            <p className="text-sm text-muted">Normalized from cached Sportmonks match statistics.</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            {dashboard.traits.map((trait) => (
              <TraitBar key={trait.label} {...trait} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 size={18} /> Season Performance</CardTitle>
            <p className="text-sm text-muted">Grouped scouting view for attack, passing, possession, defending, and discipline.</p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <StatGroup icon={<Target size={17} />} title="Shooting" rows={[
              ["Goals", dashboard.totals.goals],
              ["Shots", dashboard.totals.shots],
              ["On target", dashboard.totals.shotsOnTarget],
              ["xG", dashboard.totals.expectedGoals],
              ["xGOT", dashboard.totals.expectedGoalsOnTarget],
              ["Shot perf.", dashboard.totals.shootingPerformance]
            ]} />
            <StatGroup icon={<TrendingUp size={17} />} title="Passing & Chance Creation" rows={[
              ["Assists", dashboard.totals.assists],
              ["xA", dashboard.totals.expectedAssists],
              ["Key passes", dashboard.totals.keyPasses],
              ["Chances created", dashboard.totals.chancesCreated],
              ["Final 3rd passes", dashboard.totals.passesFinalThird],
              ["Long balls", `${dashboard.totals.longBallsAccurate}/${dashboard.totals.longBallsTotal}`]
            ]} />
            <StatGroup icon={<Footprints size={17} />} title="Possession & Control" rows={[
              ["Touches", dashboard.totals.touches],
              ["Dribbles", `${dashboard.totals.dribblesSuccessful}/${dashboard.totals.dribbleAttempts}`],
              ["Dribble success", dashboard.averages.dribbleSuccessRate],
              ["Ball recoveries", dashboard.totals.ballRecoveries],
              ["Possession lost", dashboard.totals.possessionLost],
              ["Dispossessed", dashboard.totals.dispossessed]
            ]} />
            <StatGroup icon={<Dumbbell size={17} />} title="Defending & Duels" rows={[
              ["Tackles", dashboard.totals.tackles],
              ["Interceptions", dashboard.totals.interceptions],
              ["Clearances", dashboard.totals.clearances],
              ["Blocks", dashboard.totals.blocks],
              ["Duels won", `${dashboard.totals.duelsWon}/${dashboard.totals.duelsTotal}`],
              ["Aerials won", `${dashboard.totals.aerialsWon}/${dashboard.totals.aerialsTotal}`]
            ]} />
          </CardContent>
        </Card>
      </section>

      <Card className="mt-6 overflow-hidden">
        <CardHeader className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <CardTitle>Match Log</CardTitle>
            <p className="mt-1 text-sm text-muted">
              Per-gameweek statistics from Sportmonks fixture lineups. Run statistics sync again to expand coverage.
            </p>
          </div>
          <Badge>{dashboard.appearances} cached appearances</Badge>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid min-w-[1280px] grid-cols-[0.8fr_1.45fr_0.75fr_0.65fr_0.65fr_0.8fr_0.75fr_0.75fr_0.75fr_0.9fr_0.75fr_0.85fr_0.85fr] border-b border-border pb-3 text-xs uppercase text-muted">
              <span>Date</span>
              <span>Fixture</span>
              <span>Role</span>
              <span>Min</span>
              <span>Rating</span>
              <span>Pass</span>
              <span>Shots</span>
              <span>xG</span>
              <span>xA</span>
              <span>Dribble</span>
              <span>Touches</span>
              <span>Def</span>
              <span>Chance</span>
            </div>
            {data.matchStats.map((match) => (
              <div
                key={`${match.fixture_sportmonks_id}-${match.team_sportmonks_id}`}
                className="grid min-w-[1280px] grid-cols-[0.8fr_1.45fr_0.75fr_0.65fr_0.65fr_0.8fr_0.75fr_0.75fr_0.75fr_0.9fr_0.75fr_0.85fr_0.85fr] border-b border-border py-4 text-sm last:border-0"
              >
                <span className="text-muted">{formatDate(match.starting_at)}</span>
                <span>
                  <span className="font-medium">{match.fixture_name ?? "Fixture"}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {match.result ?? "-"} {scoreLine(match)} {match.round_name ? ` / GW ${match.round_name}` : ""}
                  </span>
                </span>
                <span className="inline-flex items-start gap-1 text-muted"><MapPin size={13} className="mt-0.5" />{match.location ?? "neutral"}</span>
                <span className="font-mono">{formatNumber(match.minutes)}</span>
                <span className={`font-mono ${ratingClass(match.rating)}`}>{formatDecimal(match.rating)}</span>
                <span className="font-mono">{passLine(match)}</span>
                <span className="font-mono">{shotsLine(match)}</span>
                <span className="font-mono">{formatDecimal(match.expected_goals)}</span>
                <span className="font-mono">{formatDecimal(match.expected_assists)}</span>
                <span className="font-mono">{dribbleLine(match)}</span>
                <span className="font-mono">{formatNumber(match.touches)}</span>
                <span className="font-mono">{formatNumber(defensiveActions(match))}</span>
                <span className="font-mono">{formatNumber(sumValues(match.key_passes, match.chances_created, match.big_chances_created))}</span>
              </div>
            ))}
            {data.matchStats.length === 0 ? (
              <p className="py-8 text-sm text-muted">No per-gameweek statistics cached yet for this player.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function Badge({ children, href }: { children: React.ReactNode; href?: string }) {
  const className = "inline-flex h-8 items-center rounded-md border border-border bg-white/[0.04] px-3 text-sm text-foreground";
  return href ? <a className={`${className} hover:border-accent hover:text-accent`} href={href}>{children}</a> : <span className={className}>{children}</span>;
}

function HeroMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-black/20 p-3">
      <div className="flex items-center gap-2 text-xs uppercase text-muted">{icon}{label}</div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function MetricCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm text-muted">{icon}{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-3xl font-semibold text-accent">{value}</div>
        <p className="mt-2 text-sm text-muted">{sub}</p>
      </CardContent>
    </Card>
  );
}

function TraitBar({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-accent">{Math.round(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(3, Math.min(100, value))}%` }} />
      </div>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

function StatGroup({ icon, title, rows }: { icon: React.ReactNode; title: string; rows: Array<[string, string | number | null]> }) {
  return (
    <div className="rounded-md border border-border bg-black/15 p-4">
      <h3 className="flex items-center gap-2 font-semibold">{icon}{title}</h3>
      <div className="mt-4 grid gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted">{label}</span>
            <span className="font-mono">{formatStatValue(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type MatchStat = {
  fixture_sportmonks_id: number;
  team_sportmonks_id: number;
  fixture_name: string | null;
  round_name: string | null;
  starting_at: string | null;
  location: string | null;
  team_score: number | null;
  opponent_score: number | null;
  result: string | null;
  minutes: number | null;
  rating: number | null;
  goals: number | null;
  assists: number | null;
  shots_total: number | null;
  shots_on_target: number | null;
  expected_goals: number | null;
  expected_goals_on_target: number | null;
  expected_assists: number | null;
  shooting_performance: number | null;
  passes_total: number | null;
  passes_accurate: number | null;
  pass_accuracy: number | null;
  key_passes: number | null;
  chances_created: number | null;
  big_chances_created: number | null;
  passes_final_third: number | null;
  crosses_total: number | null;
  crosses_accurate: number | null;
  long_balls_total: number | null;
  long_balls_accurate: number | null;
  touches: number | null;
  dribble_attempts: number | null;
  dribbles_successful: number | null;
  dribble_success_rate: number | null;
  possession_lost: number | null;
  dispossessed: number | null;
  ball_recoveries: number | null;
  tackles: number | null;
  interceptions: number | null;
  clearances: number | null;
  blocks: number | null;
  duels_total: number | null;
  duels_won: number | null;
  aerials_total: number | null;
  aerials_won: number | null;
};

async function getPlayerDetail(sportmonksId: number) {
  try {
    const supabase = getSupabaseServiceClient();
    const { data: player, error } = await supabase
      .from("players")
      .select("sportmonks_id,display_name,position_name,nationality_name,hidden_gem_score,height,weight,image_path,date_of_birth,preferred_foot,contract_expires_at")
      .eq("sportmonks_id", sportmonksId)
      .maybeSingle();

    if (error) throw error;
    if (!player) return { player: null, squad: null, club: null, matchStats: [] as MatchStat[], error: null };

    const { data: squad } = await supabase
      .from("squad_players")
      .select("team_sportmonks_id,jersey_number")
      .eq("player_sportmonks_id", sportmonksId)
      .limit(1)
      .maybeSingle();

    const { data: club } = squad?.team_sportmonks_id
      ? await supabase
          .from("clubs")
          .select("sportmonks_id,name,image_path")
          .eq("sportmonks_id", squad.team_sportmonks_id)
          .maybeSingle()
      : { data: null };

    const { data: matchStats } = await supabase
      .from("player_match_statistics")
      .select("fixture_sportmonks_id,team_sportmonks_id,fixture_name,round_name,starting_at,location,team_score,opponent_score,result,minutes,rating,goals,assists,shots_total,shots_on_target,expected_goals,expected_goals_on_target,expected_assists,shooting_performance,passes_total,passes_accurate,pass_accuracy,key_passes,chances_created,big_chances_created,passes_final_third,crosses_total,crosses_accurate,long_balls_total,long_balls_accurate,touches,dribble_attempts,dribbles_successful,dribble_success_rate,possession_lost,dispossessed,ball_recoveries,tackles,interceptions,clearances,blocks,duels_total,duels_won,aerials_total,aerials_won")
      .eq("player_sportmonks_id", sportmonksId)
      .order("starting_at", { ascending: false })
      .limit(30);

    return { player, squad, club, matchStats: normalizeMatchStats((matchStats ?? []) as MatchStat[]), error: null };
  } catch (error) {
    return {
      player: null,
      squad: null,
      club: null,
      matchStats: [] as MatchStat[],
      error: error instanceof Error ? error.message : "Unable to load player."
    };
  }
}

function buildDashboard(rows: MatchStat[]) {
  const totals = {
    minutes: sum(rows, "minutes"),
    goals: sum(rows, "goals"),
    assists: sum(rows, "assists"),
    shots: sum(rows, "shots_total"),
    shotsOnTarget: sum(rows, "shots_on_target"),
    expectedGoals: sum(rows, "expected_goals"),
    expectedGoalsOnTarget: sum(rows, "expected_goals_on_target"),
    expectedAssists: sum(rows, "expected_assists"),
    shootingPerformance: sum(rows, "shooting_performance"),
    passesTotal: sum(rows, "passes_total"),
    passesAccurate: sum(rows, "passes_accurate"),
    keyPasses: sum(rows, "key_passes"),
    chancesCreated: sum(rows, "chances_created"),
    passesFinalThird: sum(rows, "passes_final_third"),
    longBallsTotal: sum(rows, "long_balls_total"),
    longBallsAccurate: sum(rows, "long_balls_accurate"),
    touches: sum(rows, "touches"),
    dribbleAttempts: sum(rows, "dribble_attempts"),
    dribblesSuccessful: sum(rows, "dribbles_successful"),
    possessionLost: sum(rows, "possession_lost"),
    dispossessed: sum(rows, "dispossessed"),
    ballRecoveries: sum(rows, "ball_recoveries"),
    tackles: sum(rows, "tackles"),
    interceptions: sum(rows, "interceptions"),
    clearances: sum(rows, "clearances"),
    blocks: sum(rows, "blocks"),
    duelsTotal: sum(rows, "duels_total"),
    duelsWon: sum(rows, "duels_won"),
    aerialsTotal: sum(rows, "aerials_total"),
    aerialsWon: sum(rows, "aerials_won")
  };
  const defensive = totals.tackles + totals.interceptions + totals.clearances + totals.blocks + totals.ballRecoveries;
  const averages = {
    rating: average(rows, "rating"),
    minutes: average(rows, "minutes"),
    passAccuracy: ratioPercent(totals.passesAccurate, totals.passesTotal) ?? average(rows, "pass_accuracy"),
    dribbleSuccessRate: ratioPercent(totals.dribblesSuccessful, totals.dribbleAttempts) ?? average(rows, "dribble_success_rate")
  };
  return {
    appearances: rows.length,
    totals: { ...totals, defensiveActions: defensive },
    averages,
    per90: {
      expectedGoals: per90(totals.expectedGoals, totals.minutes),
      defensiveActions: per90(defensive, totals.minutes)
    },
    traits: [
      { label: "Attacking Threat", value: clamp(per90(totals.shots, totals.minutes) * 18 + per90(totals.expectedGoals, totals.minutes) * 50 + totals.goals * 4), hint: "Shots, xG and goals per 90" },
      { label: "Chance Creation", value: clamp(per90(totals.keyPasses + totals.chancesCreated, totals.minutes) * 20 + per90(totals.expectedAssists, totals.minutes) * 60), hint: "Key passes, chances and xA" },
      { label: "Ball Control", value: clamp((averages.passAccuracy ?? 0) * 0.55 + (averages.dribbleSuccessRate ?? 0) * 0.35 + Math.min(20, per90(totals.touches, totals.minutes))), hint: "Passing accuracy, dribbling and touches" },
      { label: "Defensive Work", value: clamp(per90(defensive, totals.minutes) * 10), hint: "Tackles, interceptions, clearances, blocks, recoveries" },
      { label: "Aerial & Duel Presence", value: clamp((ratioPercent(totals.duelsWon, totals.duelsTotal) ?? 0) * 0.65 + (ratioPercent(totals.aerialsWon, totals.aerialsTotal) ?? 0) * 0.35), hint: "Duels and aerial win rates" }
    ]
  };
}

function normalizeMatchStats(rows: MatchStat[]) {
  return rows.map((row) => {
    const normalized = { ...row };
    for (const key of Object.keys(normalized) as Array<keyof MatchStat>) {
      const value = normalized[key];
      if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
        (normalized[key] as unknown) = Number(value);
      }
    }
    return normalized;
  });
}

function sum(rows: MatchStat[], key: keyof MatchStat) {
  return rows.reduce((total, row) => total + numberValue(row[key]), 0);
}

function average(rows: MatchStat[], key: keyof MatchStat) {
  const values = rows.map((row) => numberValue(row[key])).filter((value) => value !== 0);
  if (values.length === 0) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function per90(value: number, minutes: number) {
  return minutes > 0 ? (value * 90) / minutes : 0;
}

function ratioPercent(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : null;
}

function clamp(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function ageFromDate(value: string | null) {
  if (!value) return "Unknown";
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return "Unknown";
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return `${age}`;
}

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(value));
}

function formatNumber(value: number | null) {
  return typeof value === "number" ? String(Math.round(value)) : "-";
}

function formatDecimal(value: number | null) {
  return typeof value === "number" ? value.toFixed(2) : "-";
}

function formatPercent(value: number | null) {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "-";
}

function formatStatValue(value: string | number | null) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(2);
  return "-";
}

function scoreLine(match: MatchStat) {
  if (match.team_score === null || match.opponent_score === null) return "";
  return `${match.team_score}-${match.opponent_score}`;
}

function passLine(match: MatchStat) {
  if (match.passes_accurate === null && match.passes_total === null) return "-";
  const ratio = `${formatNumber(match.passes_accurate)}/${formatNumber(match.passes_total)}`;
  return match.pass_accuracy === null ? ratio : `${ratio} (${match.pass_accuracy.toFixed(0)}%)`;
}

function shotsLine(match: MatchStat) {
  if (match.shots_total === null && match.shots_on_target === null) return "-";
  return `${formatNumber(match.shots_on_target)}/${formatNumber(match.shots_total)}`;
}

function dribbleLine(match: MatchStat) {
  if (match.dribbles_successful === null && match.dribble_attempts === null) return "-";
  const ratio = `${formatNumber(match.dribbles_successful)}/${formatNumber(match.dribble_attempts)}`;
  return match.dribble_success_rate === null ? ratio : `${ratio} (${match.dribble_success_rate.toFixed(0)}%)`;
}

function defensiveActions(match: MatchStat) {
  return sumValues(match.tackles, match.interceptions, match.clearances, match.blocks, match.ball_recoveries);
}

function sumValues(...values: Array<number | null>) {
  return values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

function ratingClass(value: number | null) {
  if (value === null) return "text-muted";
  if (value >= 7.5) return "text-accent";
  if (value >= 6.8) return "text-emerald-200";
  if (value >= 6) return "text-yellow-100";
  return "text-red-200";
}
