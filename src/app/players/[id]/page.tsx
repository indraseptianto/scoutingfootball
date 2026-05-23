import {
  ArrowLeft,
  BarChart3,
  CircleDot,
  Dumbbell,
  Footprints,
  Gauge,
  HelpCircle,
  ListFilter,
  MapPin,
  Shield,
  Star,
  Target,
  Timer,
  TrendingUp
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

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Player traits</CardTitle>
            <p className="flex items-center gap-2 text-sm text-muted">
              Stats converted into scouting indices <HelpCircle size={15} className="text-muted" />
            </p>
          </CardHeader>
          <CardContent>
            <PlayerTraitsRadar traits={dashboard.radarTraits} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target size={18} /> Season shot map</CardTitle>
            <p className="text-sm text-muted">On target: {formatPercent(dashboard.shotMap.onTargetRate)}</p>
          </CardHeader>
          <CardContent>
            <ShotMapVisual points={dashboard.shotMap.points} totals={dashboard.totals} />
          </CardContent>
        </Card>
      </section>

      <Card className="mt-6">
        <CardHeader className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <CardTitle className="flex items-center gap-2"><BarChart3 size={18} /> Season performance</CardTitle>
            <p className="mt-1 text-sm text-muted">Minutes played: {formatNumber(dashboard.totals.minutes)}</p>
          </div>
          <div className="inline-flex rounded-full border border-border bg-black/20 p-1 text-sm">
            <span className="rounded-full bg-foreground px-4 py-2 font-medium text-background">Total</span>
            <span className="px-4 py-2 text-muted">Per 90</span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-7">
            <PerformanceRows title="Shooting" rows={[
              ["Goals", dashboard.totals.goals, dashboard.performance.goals],
              ["Expected goals (xG)", dashboard.totals.expectedGoals, dashboard.performance.expectedGoals],
              ["xG on target (xGOT)", dashboard.totals.expectedGoalsOnTarget, dashboard.performance.expectedGoalsOnTarget],
              ["Shots", dashboard.totals.shots, dashboard.performance.shots],
              ["Shots on target", dashboard.totals.shotsOnTarget, dashboard.performance.shotsOnTarget]
            ]} />
            <PerformanceRows title="Passing" rows={[
              ["Assists", dashboard.totals.assists, dashboard.performance.assists],
              ["Expected assists (xA)", dashboard.totals.expectedAssists, dashboard.performance.expectedAssists],
              ["Successful passes", dashboard.totals.passesAccurate, dashboard.performance.passesAccurate],
              ["Successful passes %", dashboard.averages.passAccuracy, dashboard.performance.passAccuracy],
              ["Accurate long balls", dashboard.totals.longBallsAccurate, dashboard.performance.longBallsAccurate],
              ["Chances created", dashboard.totals.chancesCreated, dashboard.performance.chancesCreated]
            ]} />
            <PerformanceRows title="Possession & Defending" rows={[
              ["Touches", dashboard.totals.touches, dashboard.performance.touches],
              ["Successful dribbles", dashboard.totals.dribblesSuccessful, dashboard.performance.dribblesSuccessful],
              ["Ball recoveries", dashboard.totals.ballRecoveries, dashboard.performance.ballRecoveries],
              ["Tackles", dashboard.totals.tackles, dashboard.performance.tackles],
              ["Interceptions", dashboard.totals.interceptions, dashboard.performance.interceptions],
              ["Aerials won", dashboard.totals.aerialsWon, dashboard.performance.aerialsWon]
            ]} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <StatGroup icon={<Target size={17} />} title="Shooting summary" rows={[
              ["Goals", dashboard.totals.goals],
              ["Shots", dashboard.totals.shots],
              ["On target", dashboard.totals.shotsOnTarget],
              ["xG", dashboard.totals.expectedGoals],
              ["xGOT", dashboard.totals.expectedGoalsOnTarget],
              ["Shot perf.", dashboard.totals.shootingPerformance]
            ]} />
            <StatGroup icon={<TrendingUp size={17} />} title="Creation summary" rows={[
              ["Assists", dashboard.totals.assists],
              ["xA", dashboard.totals.expectedAssists],
              ["Key passes", dashboard.totals.keyPasses],
              ["Chances created", dashboard.totals.chancesCreated],
              ["Final 3rd passes", dashboard.totals.passesFinalThird],
              ["Long balls", `${dashboard.totals.longBallsAccurate}/${dashboard.totals.longBallsTotal}`]
            ]} />
          </div>
        </CardContent>
      </Card>

      <section className="mt-6 grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ListFilter size={18} /> Scouting filters</CardTitle>
            <p className="text-sm text-muted">Quick tags from cached match actions.</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {dashboard.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Dumbbell size={18} /> Action breakdown</CardTitle>
            <p className="text-sm text-muted">Grouped scouting view for attack, passing, possession, and defending.</p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
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

function PlayerTraitsRadar({ traits }: { traits: Array<{ label: string; value: number }> }) {
  const center = 132;
  const radius = 88;
  const points = traits.map((trait, index) => radarPoint(center, radius * (trait.value / 100), index, traits.length));
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");
  const rings = [0.25, 0.5, 0.75, 1].map((scale) =>
    traits.map((_, index) => {
      const point = radarPoint(center, radius * scale, index, traits.length);
      return `${point.x},${point.y}`;
    }).join(" ")
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr] lg:items-center">
      <div className="relative mx-auto aspect-square w-full max-w-[330px]">
        <svg viewBox="0 0 264 264" className="h-full w-full">
          {rings.map((ring, index) => (
            <polygon key={ring} points={ring} fill="none" stroke={index === rings.length - 1 ? "rgba(148,163,184,0.35)" : "rgba(148,163,184,0.18)"} strokeDasharray={index === rings.length - 1 ? undefined : "3 4"} />
          ))}
          {traits.map((_, index) => {
            const point = radarPoint(center, radius, index, traits.length);
            return <line key={index} x1={center} y1={center} x2={point.x} y2={point.y} stroke="rgba(148,163,184,0.22)" />;
          })}
          <polygon points={polygon} fill="rgba(225, 29, 72, 0.72)" stroke="#fb7185" strokeWidth="2" />
          <circle cx={center} cy={center} r="3" fill="rgba(255,255,255,0.75)" />
        </svg>
      </div>
      <div className="grid gap-3">
        {traits.map((trait) => (
          <div key={trait.label} className="flex items-center justify-between gap-4 rounded-md border border-border bg-black/15 px-3 py-2">
            <span className="text-sm text-muted">{trait.label}</span>
            <span className="font-mono font-semibold text-foreground">{Math.round(trait.value)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShotMapVisual({ points, totals }: { points: ShotPoint[]; totals: { shots: number; goals: number; expectedGoals: number } }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <svg viewBox="0 0 420 330" className="h-auto w-full rounded-lg border border-border bg-white/[0.03]">
          <rect x="24" y="24" width="372" height="282" rx="14" fill="transparent" stroke="rgba(148,163,184,0.38)" strokeWidth="4" />
          <line x1="24" y1="126" x2="396" y2="126" stroke="rgba(148,163,184,0.28)" strokeWidth="4" />
          <circle cx="210" cy="126" r="52" fill="transparent" stroke="rgba(148,163,184,0.25)" strokeWidth="4" />
          <rect x="104" y="226" width="212" height="80" rx="6" fill="transparent" stroke="rgba(148,163,184,0.32)" strokeWidth="4" />
          <rect x="152" y="264" width="116" height="42" rx="4" fill="transparent" stroke="rgba(148,163,184,0.3)" strokeWidth="4" />
          <path d="M168 226 Q210 184 252 226" fill="transparent" stroke="rgba(148,163,184,0.28)" strokeWidth="4" />
          {points.map((point) => (
            <g key={point.id}>
              <circle
                cx={point.x}
                cy={point.y}
                r={point.goal ? 8 : 6}
                fill={point.goal ? "#111827" : point.onTarget ? "rgba(244,63,94,0.7)" : "rgba(255,255,255,0.05)"}
                stroke="#fb7185"
                strokeWidth="2"
              />
              {point.goal ? <circle cx={point.x} cy={point.y} r="3" fill="#ffffff" /> : null}
            </g>
          ))}
        </svg>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <MiniStat label="Shots" value={formatNumber(totals.shots)} />
          <MiniStat label="Goals" value={formatNumber(totals.goals)} />
          <MiniStat label="xG" value={formatDecimal(totals.expectedGoals)} />
        </div>
      </div>
      <div className="grid content-start gap-4">
        <div className="rounded-md border border-border bg-black/15 p-4">
          <p className="text-sm text-muted">Shot quality</p>
          <div className="mt-2 font-mono text-3xl text-accent">{formatDecimal(totals.shots > 0 ? totals.expectedGoals / totals.shots : null)}</div>
          <p className="mt-1 text-xs text-muted">Average xG per shot</p>
        </div>
        <div>
          <p className="mb-3 font-semibold">Filter</p>
          <div className="flex flex-wrap gap-2">
            <Badge>Goals {totals.goals}</Badge>
            <Badge>On target {points.filter((point) => point.onTarget).length}</Badge>
            <Badge>Inside box {points.filter((point) => point.y > 185).length}</Badge>
            <Badge>Outside box {points.filter((point) => point.y <= 185).length}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerformanceRows({ title, rows }: { title: string; rows: Array<[string, string | number | null, number]> }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-sm text-muted">Rank</span>
      </div>
      <div className="grid gap-3">
        {rows.map(([label, value, rank]) => (
          <RankRow key={label} label={label} value={value} rank={rank} />
        ))}
      </div>
    </div>
  );
}

function RankRow({ label, value, rank }: { label: string; value: string | number | null; rank: number }) {
  const color = rank >= 70 ? "bg-emerald-400" : rank >= 45 ? "bg-orange-400" : "bg-red-400";
  return (
    <div className="grid grid-cols-[1fr_84px_1fr] items-center gap-4 text-sm">
      <span>{label}</span>
      <span className="text-right font-mono">{formatStatValue(value)}</span>
      <div className="h-3 overflow-hidden rounded-full bg-white/12">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(4, Math.min(100, rank))}%` }} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-xl font-semibold">{value}</div>
      <div className="text-xs text-muted">{label}</div>
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

type ShotPoint = {
  id: string;
  x: number;
  y: number;
  onTarget: boolean;
  goal: boolean;
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
    bigChancesCreated: sum(rows, "big_chances_created"),
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
  const radarTraits = [
    { label: "Touches", value: clamp(per90(totals.touches, totals.minutes) * 1.15) },
    { label: "Chances created", value: clamp(per90(totals.keyPasses + totals.chancesCreated + totals.bigChancesCreated * 2, totals.minutes) * 18) },
    { label: "Aerial duels won", value: clamp(ratioPercent(totals.aerialsWon, totals.aerialsTotal) ?? per90(totals.aerialsWon, totals.minutes) * 24) },
    { label: "Defensive contributions", value: clamp(per90(defensive, totals.minutes) * 9) },
    { label: "Goals", value: clamp(per90(totals.goals, totals.minutes) * 95) },
    { label: "Shot attempts", value: clamp(per90(totals.shots, totals.minutes) * 18) }
  ];
  const shotPoints = buildShotPoints(rows);
  return {
    appearances: rows.length,
    totals: { ...totals, defensiveActions: defensive },
    averages,
    per90: {
      expectedGoals: per90(totals.expectedGoals, totals.minutes),
      defensiveActions: per90(defensive, totals.minutes)
    },
    radarTraits,
    shotMap: {
      points: shotPoints,
      onTargetRate: ratioPercent(totals.shotsOnTarget, totals.shots)
    },
    performance: {
      goals: radarTraits[4].value,
      expectedGoals: clamp(per90(totals.expectedGoals, totals.minutes) * 110),
      expectedGoalsOnTarget: clamp(per90(totals.expectedGoalsOnTarget, totals.minutes) * 110),
      shots: radarTraits[5].value,
      shotsOnTarget: clamp(per90(totals.shotsOnTarget, totals.minutes) * 25),
      assists: clamp(per90(totals.assists, totals.minutes) * 95),
      expectedAssists: clamp(per90(totals.expectedAssists, totals.minutes) * 95),
      passesAccurate: clamp(per90(totals.passesAccurate, totals.minutes) * 1.4),
      passAccuracy: clamp(averages.passAccuracy ?? 0),
      longBallsAccurate: clamp(per90(totals.longBallsAccurate, totals.minutes) * 12),
      chancesCreated: radarTraits[1].value,
      touches: radarTraits[0].value,
      dribblesSuccessful: clamp(per90(totals.dribblesSuccessful, totals.minutes) * 25),
      ballRecoveries: clamp(per90(totals.ballRecoveries, totals.minutes) * 13),
      tackles: clamp(per90(totals.tackles, totals.minutes) * 24),
      interceptions: clamp(per90(totals.interceptions, totals.minutes) * 30),
      aerialsWon: radarTraits[2].value
    },
    tags: buildTags({ ...totals, defensiveActions: defensive }, averages, shotPoints),
    traits: [
      { label: "Attacking Threat", value: clamp(per90(totals.shots, totals.minutes) * 18 + per90(totals.expectedGoals, totals.minutes) * 50 + totals.goals * 4), hint: "Shots, xG and goals per 90" },
      { label: "Chance Creation", value: clamp(per90(totals.keyPasses + totals.chancesCreated, totals.minutes) * 20 + per90(totals.expectedAssists, totals.minutes) * 60), hint: "Key passes, chances and xA" },
      { label: "Ball Control", value: clamp((averages.passAccuracy ?? 0) * 0.55 + (averages.dribbleSuccessRate ?? 0) * 0.35 + Math.min(20, per90(totals.touches, totals.minutes))), hint: "Passing accuracy, dribbling and touches" },
      { label: "Defensive Work", value: clamp(per90(defensive, totals.minutes) * 10), hint: "Tackles, interceptions, clearances, blocks, recoveries" },
      { label: "Aerial & Duel Presence", value: clamp((ratioPercent(totals.duelsWon, totals.duelsTotal) ?? 0) * 0.65 + (ratioPercent(totals.aerialsWon, totals.aerialsTotal) ?? 0) * 0.35), hint: "Duels and aerial win rates" }
    ]
  };
}

function buildShotPoints(rows: MatchStat[]) {
  const points: ShotPoint[] = [];
  rows.forEach((row, rowIndex) => {
    const shots = Math.min(8, Math.max(0, Math.round(row.shots_total ?? 0)));
    const onTarget = Math.max(0, Math.round(row.shots_on_target ?? 0));
    const goals = Math.max(0, Math.round(row.goals ?? 0));
    for (let shotIndex = 0; shotIndex < shots; shotIndex += 1) {
      const isGoal = shotIndex < goals;
      const isOnTarget = isGoal || shotIndex < onTarget;
      const seed = (row.fixture_sportmonks_id * 31 + shotIndex * 47 + rowIndex * 17) % 997;
      const xSpread = ((seed % 180) - 90) * (isGoal ? 0.55 : 1);
      const yBase = isGoal ? 264 : 250 - ((seed * 7) % 112);
      points.push({
        id: `${row.fixture_sportmonks_id}-${shotIndex}`,
        x: 210 + xSpread,
        y: Math.max(58, Math.min(286, yBase)),
        onTarget: isOnTarget,
        goal: isGoal
      });
    }
  });
  return points.slice(0, 48);
}

function buildTags(
  totals: {
    goals: number;
    shots: number;
    shotsOnTarget: number;
    passesFinalThird: number;
    chancesCreated: number;
    keyPasses: number;
    dribblesSuccessful: number;
    tackles: number;
    interceptions: number;
    aerialsWon: number;
    defensiveActions: number;
  },
  averages: { passAccuracy: number | null; dribbleSuccessRate: number | null },
  shotPoints: ShotPoint[]
) {
  return [
    `Goals ${totals.goals}`,
    `Shots ${totals.shots}`,
    `On target ${totals.shotsOnTarget}`,
    `Inside box ${shotPoints.filter((point) => point.y > 185).length}`,
    `Final third passes ${totals.passesFinalThird}`,
    `Chances ${totals.chancesCreated + totals.keyPasses}`,
    `Pass accuracy ${formatPercent(averages.passAccuracy)}`,
    `Dribbles ${totals.dribblesSuccessful}`,
    `Dribble success ${formatPercent(averages.dribbleSuccessRate)}`,
    `Tackles ${totals.tackles}`,
    `Interceptions ${totals.interceptions}`,
    `Aerial wins ${totals.aerialsWon}`,
    `Def actions ${totals.defensiveActions}`
  ];
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

function radarPoint(center: number, radius: number, index: number, count: number) {
  const angle = -Math.PI / 2 + (index / count) * Math.PI * 2;
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius
  };
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
