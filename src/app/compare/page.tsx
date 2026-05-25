import { ArrowLeft, BarChart3, GitCompareArrows, Search, Shield, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

type SearchParams = {
  a?: string;
  b?: string;
};

type ClubOption = {
  sportmonks_id: number;
  name: string;
};

type TeamProfile = {
  id: number;
  name: string;
  position: number | null;
  points: number | null;
  squadSize: number;
  avgAge: number | null;
  goalsFor: number;
  goalsAgainst: number;
  recentForm: string;
  depthScore: number;
  attackingOutput: number;
  defensiveStability: number;
  hiddenGemCount: number;
  radar: Array<{ label: string; value: number }>;
};

export const dynamic = "force-dynamic";

export default async function ComparePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const data = await getComparisonData(Number(params.a ?? "0"), Number(params.b ?? "0"));
  const teamA = data.teamA;
  const teamB = data.teamB;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <Button variant="ghost" asChild><a href="/"><ArrowLeft size={16} /> Home</a></Button>

      <section className="mt-6 rounded-lg border border-border bg-card p-6 md:p-8">
        <p className="flex items-center gap-2 text-sm font-medium text-accent"><GitCompareArrows size={16} /> Team Comparison</p>
        <h1 className="mt-3 text-4xl font-semibold">Compare squad strength, form, and recruitment need.</h1>
        <p className="mt-3 max-w-3xl text-muted">
          Side-by-side comparison from cached Sportmonks clubs, standings, fixtures, squads, and season player statistics.
        </p>
        <form className="mt-8 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select name="a" defaultValue={teamA?.id ?? ""} className="input-like">
            {data.clubs.map((club) => <option key={club.sportmonks_id} value={club.sportmonks_id}>{club.name}</option>)}
          </select>
          <select name="b" defaultValue={teamB?.id ?? ""} className="input-like">
            {data.clubs.map((club) => <option key={club.sportmonks_id} value={club.sportmonks_id}>{club.name}</option>)}
          </select>
          <Button type="submit"><Search size={16} /> Compare</Button>
        </form>
      </section>

      {data.error ? <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{data.error}</div> : null}

      {teamA && teamB ? (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric title="Stronger Attack" value={teamA.attackingOutput >= teamB.attackingOutput ? teamA.name : teamB.name} icon={<Trophy size={18} />} />
            <Metric title="Deeper Squad" value={teamA.depthScore >= teamB.depthScore ? teamA.name : teamB.name} icon={<Users size={18} />} />
            <Metric title="Defensive Edge" value={teamA.defensiveStability >= teamB.defensiveStability ? teamA.name : teamB.name} icon={<Shield size={18} />} />
            <Metric title="Hidden Gems" value={`${teamA.hiddenGemCount} vs ${teamB.hiddenGemCount}`} icon={<BarChart3 size={18} />} />
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>Comparison radar</CardTitle>
                <p className="text-sm text-muted">{teamA.name} vs {teamB.name}</p>
              </CardHeader>
              <CardContent>
                <RadarComparison teamA={teamA} teamB={teamB} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI-style comparison output</CardTitle>
                <p className="text-sm text-muted">Deterministic narrative ready to be replaced by cached AI generation.</p>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="leading-7 text-muted">{buildNarrative(teamA, teamB)}</p>
                <div className="rounded-md border border-border bg-black/20 p-4">
                  <h2 className="font-semibold">Recruitment recommendation</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{buildRecruitmentNeed(teamA, teamB)}</p>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="mt-6 overflow-hidden">
            <CardHeader>
              <CardTitle>Side-by-side metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="grid min-w-[760px] grid-cols-[1fr_1fr_1fr] border-b border-border pb-3 text-sm font-medium text-muted">
                  <span>Metric</span>
                  <span>{teamA.name}</span>
                  <span>{teamB.name}</span>
                </div>
                {comparisonRows(teamA, teamB).map(([label, a, b]) => (
                  <div key={label} className="grid min-w-[760px] grid-cols-[1fr_1fr_1fr] border-b border-border py-4 text-sm last:border-0">
                    <span className="text-muted">{label}</span>
                    <span className="font-mono">{a}</span>
                    <span className="font-mono">{b}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="mt-6">
          <CardContent className="p-6 text-sm text-muted">Sync at least two clubs to use team comparison.</CardContent>
        </Card>
      )}
    </main>
  );
}

function Metric({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-muted">{title}</CardTitle>
        <span className="text-accent">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="truncate font-semibold text-accent">{value}</div>
      </CardContent>
    </Card>
  );
}

function RadarComparison({ teamA, teamB }: { teamA: TeamProfile; teamB: TeamProfile }) {
  const center = 132;
  const radius = 86;
  const labels = teamA.radar.map((item) => item.label);
  const pointsA = teamA.radar.map((item, index) => radarPoint(center, radius * (item.value / 100), index, labels.length)).map((point) => `${point.x},${point.y}`).join(" ");
  const pointsB = teamB.radar.map((item, index) => radarPoint(center, radius * (item.value / 100), index, labels.length)).map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr] md:items-center">
      <svg viewBox="0 0 264 264" className="mx-auto aspect-square w-full max-w-[300px]">
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon key={scale} points={labels.map((_, index) => {
            const point = radarPoint(center, radius * scale, index, labels.length);
            return `${point.x},${point.y}`;
          }).join(" ")} fill="none" stroke="rgba(148,163,184,0.22)" />
        ))}
        <polygon points={pointsA} fill="rgba(0,255,135,0.22)" stroke="#00ff87" strokeWidth="2" />
        <polygon points={pointsB} fill="rgba(96,165,250,0.20)" stroke="#60a5fa" strokeWidth="2" />
      </svg>
      <div className="grid gap-3">
        {labels.map((label, index) => (
          <div key={label} className="rounded-md border border-border bg-black/20 p-3">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted">{label}</span>
              <span className="font-mono"><span className="text-accent">{teamA.radar[index].value}</span> / <span className="text-blue-300">{teamB.radar[index].value}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function getComparisonData(requestedA: number, requestedB: number) {
  try {
    const supabase = getSupabaseServiceClient();
    const { data: clubRows, error } = await supabase
      .from("clubs")
      .select("sportmonks_id,name")
      .order("name")
      .limit(120);

    if (error) throw error;
    const clubs = ((clubRows ?? []) as Array<{ sportmonks_id: number; name: string }>).map((club) => ({
      sportmonks_id: Number(club.sportmonks_id),
      name: String(club.name)
    }));
    const first = requestedA || clubs[0]?.sportmonks_id || 0;
    const second = requestedB || clubs.find((club) => club.sportmonks_id !== first)?.sportmonks_id || 0;
    const [teamA, teamB] = await Promise.all([
      first ? buildTeamProfile(first) : Promise.resolve(null),
      second ? buildTeamProfile(second) : Promise.resolve(null)
    ]);

    return { clubs, teamA, teamB, error: null };
  } catch (error) {
    return { clubs: [] as ClubOption[], teamA: null, teamB: null, error: error instanceof Error ? error.message : "Unable to load team comparison." };
  }
}

async function buildTeamProfile(teamId: number): Promise<TeamProfile | null> {
  const supabase = getSupabaseServiceClient();
  const { data: club } = await supabase.from("clubs").select("sportmonks_id,name").eq("sportmonks_id", teamId).maybeSingle();
  if (!club) return null;

  const { data: membership } = await supabase
    .from("club_season_memberships")
    .select("season_sportmonks_id")
    .eq("team_sportmonks_id", teamId)
    .order("season_sportmonks_id", { ascending: false })
    .limit(1)
    .maybeSingle();
  const seasonId = Number(membership?.season_sportmonks_id ?? 0);

  const [squadResult, playerStatsResult, standingResult, fixturesResult] = await Promise.all([
    supabase.from("squad_players").select("player_sportmonks_id").eq("team_sportmonks_id", teamId).limit(120),
    seasonId
      ? supabase.from("season_player_statistics").select("player_sportmonks_id,minutes,goals,assists,expected_goals,expected_assists,tackles,interceptions,ball_recoveries").eq("team_sportmonks_id", teamId).eq("season_sportmonks_id", seasonId).limit(120)
      : Promise.resolve({ data: [] }),
    seasonId
      ? supabase.from("standings").select("position,points").eq("team_sportmonks_id", teamId).eq("season_sportmonks_id", seasonId).maybeSingle()
      : Promise.resolve({ data: null }),
    seasonId
      ? supabase.from("fixtures").select("home_team_sportmonks_id,away_team_sportmonks_id,home_score,away_score,starting_at").eq("season_sportmonks_id", seasonId).or(`home_team_sportmonks_id.eq.${teamId},away_team_sportmonks_id.eq.${teamId}`).order("starting_at", { ascending: false }).limit(10)
      : Promise.resolve({ data: [] })
  ]);

  const playerIds = Array.from(new Set((squadResult.data ?? []).map((row) => Number(row.player_sportmonks_id)).filter(Boolean)));
  const { data: players } = playerIds.length > 0
    ? await supabase.from("players").select("sportmonks_id,date_of_birth,hidden_gem_score").in("sportmonks_id", playerIds)
    : { data: [] };

  const ages = ((players ?? []) as Array<{ date_of_birth: string | null }>).map((player) => ageNumber(player.date_of_birth)).filter((age): age is number => typeof age === "number");
  const hiddenGemCount = ((players ?? []) as Array<{ hidden_gem_score: number }>).filter((player) => Number(player.hidden_gem_score ?? 0) >= 75).length;
  const stats = ((playerStatsResult.data ?? []) as Array<Record<string, unknown>>).map(normalizeStat);
  const fixtures = ((fixturesResult.data ?? []) as Array<Record<string, unknown>>).map((fixture) => normalizeFixture(fixture, teamId));
  const goalsFor = fixtures.reduce((sum, fixture) => sum + fixture.for, 0);
  const goalsAgainst = fixtures.reduce((sum, fixture) => sum + fixture.against, 0);
  const attackingOutput = clamp(Math.round(stats.reduce((sum, stat) => sum + stat.goals + stat.assists + stat.expected_goals + stat.expected_assists, 0) * 2));
  const defensiveStability = clamp(100 - goalsAgainst * 8 + stats.reduce((sum, stat) => sum + stat.tackles + stat.interceptions + stat.ball_recoveries, 0) / 8);
  const depthScore = clamp(playerIds.length * 3 + stats.filter((stat) => stat.minutes >= 450).length * 4);
  const formScore = clamp(fixtures.reduce((sum, fixture) => sum + (fixture.result === "W" ? 18 : fixture.result === "D" ? 9 : 2), 0));

  return {
    id: Number(club.sportmonks_id),
    name: String(club.name),
    position: nullableNumber((standingResult.data as Record<string, unknown> | null)?.position),
    points: nullableNumber((standingResult.data as Record<string, unknown> | null)?.points),
    squadSize: playerIds.length,
    avgAge: ages.length ? Math.round((ages.reduce((sum, age) => sum + age, 0) / ages.length) * 10) / 10 : null,
    goalsFor,
    goalsAgainst,
    recentForm: fixtures.map((fixture) => fixture.result).join("") || "-",
    depthScore,
    attackingOutput,
    defensiveStability,
    hiddenGemCount,
    radar: [
      { label: "Attacking", value: attackingOutput },
      { label: "Defensive", value: defensiveStability },
      { label: "Physical", value: clamp(playerIds.length * 2.8) },
      { label: "Pressing", value: clamp(stats.reduce((sum, stat) => sum + stat.tackles + stat.interceptions + stat.ball_recoveries, 0) / 7) },
      { label: "Depth", value: depthScore },
      { label: "Form", value: formScore }
    ]
  };
}

function comparisonRows(teamA: TeamProfile, teamB: TeamProfile): Array<[string, string, string]> {
  return [
    ["League Position", formatNullable(teamA.position, "#"), formatNullable(teamB.position, "#")],
    ["Points", formatNullable(teamA.points), formatNullable(teamB.points)],
    ["Goals For", String(teamA.goalsFor), String(teamB.goalsFor)],
    ["Goals Against", String(teamA.goalsAgainst), String(teamB.goalsAgainst)],
    ["Recent Form", teamA.recentForm, teamB.recentForm],
    ["Avg Squad Age", teamA.avgAge ? String(teamA.avgAge) : "-", teamB.avgAge ? String(teamB.avgAge) : "-"],
    ["Squad Size", String(teamA.squadSize), String(teamB.squadSize)],
    ["Depth Score", `${teamA.depthScore}/100`, `${teamB.depthScore}/100`],
    ["Attacking Output", `${teamA.attackingOutput}/100`, `${teamB.attackingOutput}/100`],
    ["Defensive Stability", `${teamA.defensiveStability}/100`, `${teamB.defensiveStability}/100`]
  ];
}

function buildNarrative(teamA: TeamProfile, teamB: TeamProfile) {
  const attackLeader = teamA.attackingOutput >= teamB.attackingOutput ? teamA : teamB;
  const younger = (teamA.avgAge ?? 99) <= (teamB.avgAge ?? 99) ? teamA : teamB;
  return `${attackLeader.name} currently carries the stronger attacking profile, while ${younger.name} has the younger squad curve. ${teamA.name} shows ${teamA.recentForm} in recent cached fixtures versus ${teamB.recentForm} for ${teamB.name}.`;
}

function buildRecruitmentNeed(teamA: TeamProfile, teamB: TeamProfile) {
  const weakerAttack = teamA.attackingOutput < teamB.attackingOutput ? teamA : teamB;
  const weakerDefense = teamA.defensiveStability < teamB.defensiveStability ? teamA : teamB;
  return `${weakerAttack.name} should prioritise attacking output, especially forwards or creators with xG+xA signal. ${weakerDefense.name} needs defensive stability: centre backs, ball winners, or high-recovery midfielders.`;
}

function normalizeStat(row: Record<string, unknown>) {
  return {
    minutes: nullableNumber(row.minutes) ?? 0,
    goals: nullableNumber(row.goals) ?? 0,
    assists: nullableNumber(row.assists) ?? 0,
    expected_goals: nullableNumber(row.expected_goals) ?? 0,
    expected_assists: nullableNumber(row.expected_assists) ?? 0,
    tackles: nullableNumber(row.tackles) ?? 0,
    interceptions: nullableNumber(row.interceptions) ?? 0,
    ball_recoveries: nullableNumber(row.ball_recoveries) ?? 0
  };
}

function normalizeFixture(row: Record<string, unknown>, teamId: number) {
  const home = nullableNumber(row.home_team_sportmonks_id);
  const homeScore = nullableNumber(row.home_score) ?? 0;
  const awayScore = nullableNumber(row.away_score) ?? 0;
  const isHome = home === teamId;
  const scoreFor = isHome ? homeScore : awayScore;
  const scoreAgainst = isHome ? awayScore : homeScore;
  return {
    for: scoreFor,
    against: scoreAgainst,
    result: scoreFor > scoreAgainst ? "W" : scoreFor === scoreAgainst ? "D" : "L"
  };
}

function radarPoint(center: number, radius: number, index: number, count: number) {
  const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
  return { x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
}

function nullableNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function ageNumber(value: string | null) {
  if (!value) return null;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

function formatNullable(value: number | null, prefix = "") {
  return typeof value === "number" ? `${prefix}${value}` : "-";
}

function clamp(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}
