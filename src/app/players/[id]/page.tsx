import { ArrowLeft, Activity, BarChart3, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { hiddenGemTier } from "@/lib/hidden-gem";

export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPlayerDetail(Number(id));

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-8">
      <Button variant="ghost" asChild><a href="/players"><ArrowLeft size={16} /> Players</a></Button>

      {data.error ? (
        <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{data.error}</div>
      ) : data.player ? (
        <>
          <section className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <p className="text-sm text-accent">Player Profile</p>
              <h1 className="mt-2 text-4xl font-semibold">{data.player.display_name}</h1>
              <p className="mt-3 text-muted">
                {[data.player.position_name, data.player.nationality_name, data.club?.name].filter(Boolean).join(" / ")}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-sm text-muted">Hidden Gem</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="font-mono text-4xl text-accent">{data.player.hidden_gem_score}</span>
                <span className="inline-flex items-center gap-2"><Star size={16} className="text-accent" /> {hiddenGemTier(data.player.hidden_gem_score)}</span>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Info label="Sportmonks ID" value={String(data.player.sportmonks_id)} />
            <Info label="Height" value={data.player.height ? `${data.player.height} cm` : "Unknown"} />
            <Info label="Weight" value={data.player.weight ? `${data.player.weight} kg` : "Unknown"} />
          </div>

          <Card className="mt-8">
            <CardHeader><CardTitle>Squad Registration</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Info label="Club" value={data.club?.name ?? "Unassigned"} href={data.club ? `/clubs/${data.club.sportmonks_id}` : undefined} />
                <Info label="Jersey" value={data.squad?.jersey_number ? String(data.squad.jersey_number) : "Unknown"} />
              </div>
            </CardContent>
          </Card>

          <section className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.7fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 size={18} /> Match Averages</CardTitle>
              </CardHeader>
              <CardContent>
                {data.matchStats.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <Info label="Appearances Cached" value={String(data.averages.appearances)} />
                    <Info label="Avg Rating" value={formatDecimal(data.averages.rating)} />
                    <Info label="Avg Minutes" value={formatDecimal(data.averages.minutes)} />
                    <Info label="Pass Accuracy" value={formatPercent(data.averages.passAccuracy)} />
                    <Info label="Shots / Match" value={formatDecimal(data.averages.shots)} />
                    <Info label="xG / Match" value={formatDecimal(data.averages.expectedGoals)} />
                    <Info label="xA / Match" value={formatDecimal(data.averages.expectedAssists)} />
                    <Info label="Dribble Success" value={formatPercent(data.averages.dribbleSuccessRate)} />
                    <Info label="Tackles / Match" value={formatDecimal(data.averages.tackles)} />
                    <Info label="Interceptions / Match" value={formatDecimal(data.averages.interceptions)} />
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    Belum ada cache statistik per pertandingan untuk pemain ini. Jalankan sync statistics setelah fixture selesai.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity size={18} /> Gameweek Match Statistics</CardTitle>
                <p className="mt-1 text-sm text-muted">
                  Passing, shot, xG, xA, dribble, dan defensive actions dari cache Sportmonks fixture lineups.
                </p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="grid min-w-[1180px] grid-cols-[0.85fr_1.4fr_0.9fr_0.7fr_0.7fr_0.85fr_0.8fr_0.8fr_0.8fr_0.9fr_0.8fr_0.9fr] border-b border-border pb-3 text-xs uppercase tracking-wide text-muted">
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
                    <span>Def Actions</span>
                  </div>
                  {data.matchStats.map((match) => (
                    <div
                      key={`${match.fixture_sportmonks_id}-${match.team_sportmonks_id}`}
                      className="grid min-w-[1180px] grid-cols-[0.85fr_1.4fr_0.9fr_0.7fr_0.7fr_0.85fr_0.8fr_0.8fr_0.8fr_0.9fr_0.8fr_0.9fr] border-b border-border py-4 text-sm last:border-0"
                    >
                      <span className="text-muted">{formatDate(match.starting_at)}</span>
                      <span>
                        <span className="font-medium">{match.fixture_name ?? "Fixture"}</span>
                        <span className="mt-1 block text-xs text-muted">
                          {match.result ?? "-"} {scoreLine(match)}
                        </span>
                      </span>
                      <span className="text-muted">{match.location ?? "neutral"}</span>
                      <span className="font-mono">{formatNumber(match.minutes)}</span>
                      <span className="font-mono text-accent">{formatDecimal(match.rating)}</span>
                      <span className="font-mono">{passLine(match)}</span>
                      <span className="font-mono">{shotsLine(match)}</span>
                      <span className="font-mono">{formatDecimal(match.expected_goals)}</span>
                      <span className="font-mono">{formatDecimal(match.expected_assists)}</span>
                      <span className="font-mono">{dribbleLine(match)}</span>
                      <span className="font-mono">{formatNumber(match.touches)}</span>
                      <span className="font-mono">{defensiveLine(match)}</span>
                    </div>
                  ))}
                  {data.matchStats.length === 0 ? (
                    <p className="py-8 text-sm text-muted">No per-gameweek statistics cached yet.</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      ) : (
        <p className="mt-6 text-muted">Player not found.</p>
      )}
    </main>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = <div className="mt-1 font-medium">{value}</div>;
  return (
    <div className="rounded-md border border-border bg-white/[0.03] p-4">
      <p className="text-sm text-muted">{label}</p>
      {href ? <a className="hover:text-accent" href={href}>{content}</a> : content}
    </div>
  );
}

type MatchStat = {
  fixture_sportmonks_id: number;
  team_sportmonks_id: number;
  fixture_name: string | null;
  starting_at: string | null;
  location: string | null;
  team_score: number | null;
  opponent_score: number | null;
  result: string | null;
  minutes: number | null;
  rating: number | null;
  shots_total: number | null;
  shots_on_target: number | null;
  expected_goals: number | null;
  expected_assists: number | null;
  passes_total: number | null;
  passes_accurate: number | null;
  pass_accuracy: number | null;
  dribble_attempts: number | null;
  dribbles_successful: number | null;
  dribble_success_rate: number | null;
  touches: number | null;
  tackles: number | null;
  interceptions: number | null;
  clearances: number | null;
  blocks: number | null;
};

async function getPlayerDetail(sportmonksId: number) {
  try {
    const supabase = getSupabaseServiceClient();
    const { data: player, error } = await supabase
      .from("players")
      .select("sportmonks_id,display_name,position_name,nationality_name,hidden_gem_score,height,weight")
      .eq("sportmonks_id", sportmonksId)
      .maybeSingle();

    if (error) throw error;
    if (!player) return { player: null, squad: null, club: null, error: null };

    const { data: squad } = await supabase
      .from("squad_players")
      .select("team_sportmonks_id,jersey_number")
      .eq("player_sportmonks_id", sportmonksId)
      .limit(1)
      .maybeSingle();

    const { data: club } = squad?.team_sportmonks_id
      ? await supabase
          .from("clubs")
          .select("sportmonks_id,name")
          .eq("sportmonks_id", squad.team_sportmonks_id)
          .maybeSingle()
      : { data: null };

    const { data: matchStats } = await supabase
      .from("player_match_statistics")
      .select("fixture_sportmonks_id,team_sportmonks_id,fixture_name,starting_at,location,team_score,opponent_score,result,minutes,rating,shots_total,shots_on_target,expected_goals,expected_assists,passes_total,passes_accurate,pass_accuracy,dribble_attempts,dribbles_successful,dribble_success_rate,touches,tackles,interceptions,clearances,blocks")
      .eq("player_sportmonks_id", sportmonksId)
      .order("starting_at", { ascending: false })
      .limit(30);

    const typedStats = (matchStats ?? []) as MatchStat[];

    return { player, squad, club, matchStats: typedStats, averages: calculateAverages(typedStats), error: null };
  } catch (error) {
    return {
      player: null,
      squad: null,
      club: null,
      matchStats: [] as MatchStat[],
      averages: calculateAverages([]),
      error: error instanceof Error ? error.message : "Unable to load player."
    };
  }
}

function calculateAverages(rows: MatchStat[]) {
  return {
    appearances: rows.length,
    rating: average(rows, "rating"),
    minutes: average(rows, "minutes"),
    passAccuracy: average(rows, "pass_accuracy"),
    shots: average(rows, "shots_total"),
    expectedGoals: average(rows, "expected_goals"),
    expectedAssists: average(rows, "expected_assists"),
    dribbleSuccessRate: average(rows, "dribble_success_rate"),
    tackles: average(rows, "tackles"),
    interceptions: average(rows, "interceptions")
  };
}

function average(rows: MatchStat[], key: keyof MatchStat) {
  const values = rows.map((row) => row[key]).filter((value): value is number => typeof value === "number");
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(value));
}

function formatNumber(value: number | null) {
  return typeof value === "number" ? String(value) : "-";
}

function formatDecimal(value: number | null) {
  return typeof value === "number" ? value.toFixed(2) : "-";
}

function formatPercent(value: number | null) {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "-";
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

function defensiveLine(match: MatchStat) {
  const total = [match.tackles, match.interceptions, match.clearances, match.blocks]
    .filter((value): value is number => typeof value === "number")
    .reduce((sum, value) => sum + value, 0);
  return total > 0 ? String(total) : "-";
}
