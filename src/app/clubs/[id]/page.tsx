import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Database,
  Flag,
  Goal,
  LineChart,
  Shield,
  Star,
  Trophy,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hiddenGemTier } from "@/lib/hidden-gem";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

type ClubRow = {
  sportmonks_id: number;
  name: string;
  short_code: string | null;
  image_path: string | null;
  founded: number | null;
  venue_sportmonks_id: number | null;
  updated_at: string | null;
};

type LeagueRow = {
  sportmonks_id: number;
  name: string;
  image_path: string | null;
};

type SeasonRow = {
  sportmonks_id: number;
  name: string;
};

type PlayerRow = {
  sportmonks_id: number;
  display_name: string;
  position_name: string | null;
  nationality_name: string | null;
  image_path: string | null;
  date_of_birth: string | null;
  hidden_gem_score: number;
  jersey_number: number | null;
};

type StatRow = {
  player_sportmonks_id: number;
  minutes: number;
  rating: number | null;
  goals: number;
  assists: number;
  expected_goals: number;
  expected_assists: number;
  tackles: number;
  interceptions: number;
  source: string;
};

type FixtureRow = {
  sportmonks_id: number;
  name: string | null;
  starting_at: string | null;
  result_info: string | null;
  home_team_sportmonks_id: number | null;
  away_team_sportmonks_id: number | null;
  home_score: number | null;
  away_score: number | null;
  raw: Record<string, unknown>;
};

type TransferRow = {
  sportmonks_id: number;
  player_sportmonks_id: number | null;
  from_team_sportmonks_id: number | null;
  to_team_sportmonks_id: number | null;
  transfer_date: string | null;
  type_name: string | null;
};

export const dynamic = "force-dynamic";

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getClubDetail(Number(id));

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Button variant="ghost" asChild>
          <a href="/clubs"><ArrowLeft size={16} /> Clubs</a>
        </Button>

        {data.error ? (
          <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{data.error}</div>
        ) : data.club ? (
          <>
            <ClubHero data={data} />

            <section className="mt-6 grid gap-3 md:grid-cols-4">
              <Metric label="Squad" value={data.players.length} detail="Synced players" icon={<Users size={18} />} />
              <Metric label="Avg Age" value={data.avgAge} detail="Available DOB only" icon={<Shield size={18} />} />
              <Metric label="Season Stats" value={data.stats.length} detail={data.statSourceLabel} icon={<LineChart size={18} />} />
              <Metric label="Transfers" value={data.transfers.length} detail="Cached market rows" icon={<Flag size={18} />} />
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <SquadComposition players={data.players} />
              <TopContributors stats={data.stats} players={data.playerById} />
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <SquadTable players={data.players} statsByPlayer={data.statsByPlayer} />
              <FixturesPanel fixtures={data.fixtures} club={data.club} />
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <TransfersPanel transfers={data.transfers} players={data.playerById} club={data.club} />
              <CachePanel data={data} />
            </section>
          </>
        ) : (
          <div className="mt-8 rounded-lg border border-border bg-card p-6">
            <h1 className="text-2xl font-semibold">Club not found</h1>
            <p className="mt-2 text-muted">Run teams and squads sync first, then reopen this page.</p>
          </div>
        )}
      </div>
    </main>
  );
}

function ClubHero({ data }: { data: Awaited<ReturnType<typeof getClubDetail>> }) {
  if (!data.club) return null;

  return (
    <section className="mt-5 overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="bg-[linear-gradient(135deg,rgba(0,255,135,0.15),rgba(8,13,25,0)_58%)] p-6 md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Logo image={data.club.image_path} name={data.club.name} size="lg" />
            <div>
              <p className="text-sm font-medium text-accent">Club Profile</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-normal md:text-5xl">{data.club.name}</h1>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <Badge>{data.club.short_code ?? `Sportmonks ${data.club.sportmonks_id}`}</Badge>
                {data.league ? <Badge href={`/leagues/${data.league.sportmonks_id}`}>{data.league.name}</Badge> : <Badge>League unknown</Badge>}
                {data.season ? <Badge>{data.season.name}</Badge> : <Badge>Season unknown</Badge>}
              </div>
            </div>
          </div>
          <p className="mt-6 max-w-3xl text-base leading-7 text-muted">
            Club intelligence view for recruitment work: squad balance, contribution leaders,
            fixture context, transfer movement, and cache freshness.
          </p>
        </div>

        <div className="border-t border-border p-6 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Table position</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-mono text-5xl font-semibold text-accent">#{data.standing?.position ?? "-"}</span>
                <span className="pb-2 text-sm text-muted">{data.standing?.points ?? 0} pts</span>
              </div>
            </div>
            <Trophy className="text-accent" size={34} />
          </div>
          <dl className="mt-6 grid gap-3 text-sm">
            <InfoRow label="Founded" value={data.club.founded ? String(data.club.founded) : "Unknown"} />
            <InfoRow label="Best signal" value={data.topSignal} />
            <InfoRow label="Cache update" value={formatDateTime(data.club.updated_at)} />
          </dl>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, detail, icon }: { label: string; value: number; detail: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm text-muted">{label}</CardTitle>
        <span className="text-accent">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-3xl font-semibold text-accent">{value.toLocaleString()}</div>
        <p className="mt-1 text-sm text-muted">{detail}</p>
      </CardContent>
    </Card>
  );
}

function SquadComposition({ players }: { players: PlayerRow[] }) {
  const groups = ["Goalkeeper", "Defender", "Midfielder", "Attacker"].map((position) => ({
    position,
    count: players.filter((player) => player.position_name === position).length
  }));
  const max = Math.max(1, ...groups.map((group) => group.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Squad composition</CardTitle>
        <p className="mt-1 text-sm text-muted">Role distribution from Sportmonks squad cache.</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 md:grid-cols-[260px_1fr] md:items-center">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[260px] rounded-lg border border-border bg-black/20 p-4">
            <div className="h-full rounded-md border-2 border-white/15">
              <div className="mx-auto mt-8 h-20 w-20 rounded-full border-2 border-white/15" />
              <div className="mx-auto mt-16 h-28 w-36 rounded-t-full border-2 border-white/15 border-b-0" />
              {groups.map((group, index) => (
                <div
                  key={group.position}
                  className="absolute flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 bg-accent-soft font-mono text-sm text-accent"
                  style={{
                    left: ["42%", "17%", "42%", "67%"][index],
                    top: ["78%", "52%", "40%", "22%"][index]
                  }}
                >
                  {group.count}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {groups.map((group) => (
              <div key={group.position} className="rounded-md border border-border bg-black/15 p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted">{group.position}</span>
                  <span className="font-mono text-accent">{group.count}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(6, (group.count / max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TopContributors({ stats, players }: { stats: StatRow[]; players: Map<number, PlayerRow> }) {
  const leaders = [...stats]
    .sort((a, b) => contributionScore(b) - contributionScore(a))
    .slice(0, 6);
  const max = Math.max(1, ...leaders.map(contributionScore));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top contributors</CardTitle>
        <p className="mt-1 text-sm text-muted">Weighted output: goals, assists, xG, xA, defensive actions.</p>
      </CardHeader>
      <CardContent className="grid gap-3">
        {leaders.map((stat, index) => {
          const player = players.get(stat.player_sportmonks_id);
          const score = contributionScore(stat);
          return (
            <a
              key={stat.player_sportmonks_id}
              href={`/players/${stat.player_sportmonks_id}`}
              className="grid grid-cols-[34px_1fr_60px] items-center gap-3 rounded-md border border-border bg-black/20 p-3 transition hover:border-accent/60"
            >
              <span className="font-mono text-sm text-muted">{index + 1}</span>
              <span className="min-w-0">
                <span className="block truncate font-medium">{player?.display_name ?? `Player ${stat.player_sportmonks_id}`}</span>
                <span className="mt-1 block text-xs text-muted">
                  {player?.position_name ?? "Unknown"} - {stat.goals}G {stat.assists}A - {formatDecimal(stat.rating)}
                </span>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/10">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(6, (score / max) * 100)}%` }} />
                </span>
              </span>
              <span className="text-right font-mono text-lg text-accent">{Math.round(score)}</span>
            </a>
          );
        })}
        {leaders.length === 0 ? <p className="text-sm text-muted">No season player statistics cached for this club yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function SquadTable({ players, statsByPlayer }: { players: PlayerRow[]; statsByPlayer: Map<number, StatRow> }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Squad</CardTitle>
        <p className="mt-1 text-sm text-muted">Player list with recruitment signal and season production.</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="grid min-w-[860px] grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr_0.7fr_0.75fr] border-b border-border pb-3 text-xs font-medium uppercase text-muted">
            <span>Name</span>
            <span>Position</span>
            <span>Nation</span>
            <span>Min</span>
            <span>G+A</span>
            <span>Signal</span>
          </div>
          {players.map((player) => {
            const stat = statsByPlayer.get(player.sportmonks_id);
            return (
              <div
                key={`${player.sportmonks_id}-${player.jersey_number ?? "n"}`}
                className="grid min-w-[860px] grid-cols-[1.4fr_0.8fr_0.8fr_0.7fr_0.7fr_0.75fr] border-b border-border py-4 text-sm last:border-0"
              >
                <a className="truncate font-medium hover:text-accent" href={`/players/${player.sportmonks_id}`}>
                  {player.jersey_number ? <span className="mr-2 font-mono text-muted">#{player.jersey_number}</span> : null}
                  {player.display_name}
                </a>
                <span>{player.position_name ?? "Unknown"}</span>
                <span className="text-muted">{player.nationality_name ?? "Unknown"}</span>
                <span className="font-mono">{stat?.minutes ?? 0}</span>
                <span className="font-mono">{(stat?.goals ?? 0) + (stat?.assists ?? 0)}</span>
                <span className="inline-flex items-center gap-2">
                  <Star size={14} className="text-accent" />
                  {hiddenGemTier(player.hidden_gem_score)}
                </span>
              </div>
            );
          })}
          {players.length === 0 ? <p className="py-8 text-sm text-muted">No squad rows cached yet.</p> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function FixturesPanel({ fixtures, club }: { fixtures: FixtureRow[]; club: ClubRow }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Fixtures</CardTitle>
          <p className="mt-1 text-sm text-muted">Recent and upcoming cached matches.</p>
        </div>
        <CalendarDays size={18} className="text-accent" />
      </CardHeader>
      <CardContent className="grid gap-3">
        {fixtures.map((fixture) => (
          <div key={fixture.sportmonks_id} className="rounded-md border border-border bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3 text-xs text-muted">
              <span>{formatDate(fixture.starting_at)}</span>
              <span className="font-mono">{fixture.sportmonks_id}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="truncate font-medium">{fixture.name ?? club.name}</span>
              <span className="rounded-md border border-border bg-white/5 px-3 py-1 font-mono text-accent">{scoreLine(fixture)}</span>
            </div>
            <p className="mt-2 line-clamp-1 text-sm text-muted">{fixture.result_info ?? "Fixture cached"}</p>
          </div>
        ))}
        {fixtures.length === 0 ? <p className="text-sm text-muted">No cached fixtures for this club yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function TransfersPanel({
  transfers,
  players,
  club
}: {
  transfers: TransferRow[];
  players: Map<number, PlayerRow>;
  club: ClubRow;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transfer activity</CardTitle>
          <p className="mt-1 text-sm text-muted">Market movement involving this club.</p>
        </div>
        <Flag size={18} className="text-accent" />
      </CardHeader>
      <CardContent className="grid gap-3">
        {transfers.map((transfer) => (
          <div key={transfer.sportmonks_id} className="rounded-md border border-border bg-black/20 p-3">
            <div className="flex items-center justify-between gap-3">
              <a className="truncate font-medium hover:text-accent" href={`/players/${transfer.player_sportmonks_id}`}>
                {players.get(Number(transfer.player_sportmonks_id))?.display_name ?? `Player ${transfer.player_sportmonks_id}`}
              </a>
              <span className="rounded-full border border-border px-2 py-1 text-xs text-muted">{transfer.type_name ?? "Transfer"}</span>
            </div>
            <p className="mt-2 text-sm text-muted">
              {transfer.to_team_sportmonks_id === club.sportmonks_id ? "Incoming" : "Outgoing"} <ArrowRight className="inline" size={13} /> {club.name}
            </p>
            <p className="mt-1 text-xs text-muted">{formatDate(transfer.transfer_date)}</p>
          </div>
        ))}
        {transfers.length === 0 ? <p className="text-sm text-muted">No cached transfers for this club yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function CachePanel({ data }: { data: Awaited<ReturnType<typeof getClubDetail>> }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Data pipeline</CardTitle>
          <p className="mt-1 text-sm text-muted">Cache-first, Sportmonks-only club view.</p>
        </div>
        <Database size={18} className="text-accent" />
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <InfoRow label="Club cache" value={formatDateTime(data.club?.updated_at ?? null)} />
        <InfoRow label="League" value={data.league?.name ?? "Unknown"} />
        <InfoRow label="Season" value={data.season?.name ?? "Unknown"} />
        <div className="rounded-md border border-border bg-black/20 p-4 text-muted">
          This page does not call Sportmonks directly. It reads your Supabase cache, so you can refresh with `/api/sync/teams`, `/api/sync/squads`, `/api/sync/fixtures`, and `/api/sync/season-statistics`.
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function Badge({ children, href }: { children: React.ReactNode; href?: string }) {
  const className = "inline-flex h-8 items-center rounded-md border border-border bg-white/[0.04] px-3 text-sm text-foreground";
  return href ? <a className={`${className} hover:border-accent hover:text-accent`} href={href}>{children}</a> : <span className={className}>{children}</span>;
}

function Logo({ image, name, size = "md" }: { image: string | null; name: string; size?: "sm" | "md" | "lg" }) {
  const classes = {
    sm: "h-8 w-8 p-1",
    md: "h-12 w-12 p-2",
    lg: "h-20 w-20 p-3"
  }[size];

  if (image) {
    return <img src={image} alt={`${name} logo`} className={`${classes} rounded-md border border-border bg-white object-contain`} />;
  }

  return (
    <span className={`${classes} flex items-center justify-center rounded-md border border-border bg-accent-soft text-accent`}>
      <Shield size={size === "lg" ? 28 : 16} />
    </span>
  );
}

async function getClubDetail(sportmonksId: number) {
  try {
    const supabase = getSupabaseServiceClient();
    const { data: club, error } = await supabase
      .from("clubs")
      .select("sportmonks_id,name,short_code,image_path,founded,venue_sportmonks_id,updated_at")
      .eq("sportmonks_id", sportmonksId)
      .maybeSingle();

    if (error) throw error;
    if (!club) return emptyClub(null);

    const { data: membership } = await supabase
      .from("club_season_memberships")
      .select("league_sportmonks_id,season_sportmonks_id")
      .eq("team_sportmonks_id", sportmonksId)
      .order("season_sportmonks_id", { ascending: false })
      .limit(1)
      .maybeSingle();

    const [leagueResult, seasonResult, squadResult, standingResult, statsResult, fixturesResult, transfersResult] = await Promise.all([
      membership?.league_sportmonks_id
        ? supabase.from("leagues").select("sportmonks_id,name,image_path").eq("sportmonks_id", membership.league_sportmonks_id).maybeSingle()
        : Promise.resolve({ data: null }),
      membership?.season_sportmonks_id
        ? supabase.from("seasons").select("sportmonks_id,name").eq("sportmonks_id", membership.season_sportmonks_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("squad_players")
        .select("player_sportmonks_id,jersey_number")
        .eq("team_sportmonks_id", sportmonksId)
        .limit(120),
      membership?.season_sportmonks_id
        ? supabase
            .from("standings")
            .select("position,points")
            .eq("team_sportmonks_id", sportmonksId)
            .eq("season_sportmonks_id", membership.season_sportmonks_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      membership?.season_sportmonks_id
        ? supabase
            .from("season_player_statistics")
            .select("player_sportmonks_id,minutes,rating,goals,assists,expected_goals,expected_assists,tackles,interceptions,source")
            .eq("team_sportmonks_id", sportmonksId)
            .eq("season_sportmonks_id", membership.season_sportmonks_id)
            .limit(120)
        : Promise.resolve({ data: [] }),
      membership?.season_sportmonks_id
        ? supabase
            .from("fixtures")
            .select("sportmonks_id,name,starting_at,result_info,home_team_sportmonks_id,away_team_sportmonks_id,home_score,away_score,raw")
            .eq("season_sportmonks_id", membership.season_sportmonks_id)
            .or(`home_team_sportmonks_id.eq.${sportmonksId},away_team_sportmonks_id.eq.${sportmonksId}`)
            .order("starting_at", { ascending: false })
            .limit(8)
        : Promise.resolve({ data: [] }),
      supabase
        .from("transfers")
        .select("sportmonks_id,player_sportmonks_id,from_team_sportmonks_id,to_team_sportmonks_id,transfer_date,type_name")
        .or(`from_team_sportmonks_id.eq.${sportmonksId},to_team_sportmonks_id.eq.${sportmonksId}`)
        .order("transfer_date", { ascending: false })
        .limit(8)
    ]);

    const squadRows = (squadResult.data ?? []) as Record<string, unknown>[];
    const stats = ((statsResult.data ?? []) as Record<string, unknown>[]).map(normalizeStat);
    const playerIds = Array.from(new Set([
      ...squadRows.map((row) => Number(row.player_sportmonks_id)).filter(Boolean),
      ...stats.map((row) => row.player_sportmonks_id),
      ...((transfersResult.data ?? []) as Record<string, unknown>[]).map((row) => Number(row.player_sportmonks_id)).filter(Boolean)
    ]));

    const { data: playerRows } = playerIds.length > 0
      ? await supabase
          .from("players")
          .select("sportmonks_id,display_name,position_name,nationality_name,image_path,date_of_birth,hidden_gem_score")
          .in("sportmonks_id", playerIds)
      : { data: [] };

    const jerseyByPlayer = new Map(squadRows.map((row) => [Number(row.player_sportmonks_id), nullableNumber(row.jersey_number)]));
    const players = ((playerRows ?? []) as Record<string, unknown>[])
      .filter((row) => jerseyByPlayer.has(Number(row.sportmonks_id)))
      .map((row) => ({ ...normalizePlayer(row), jersey_number: jerseyByPlayer.get(Number(row.sportmonks_id)) ?? null }))
      .sort((a, b) => positionSort(a.position_name) - positionSort(b.position_name) || a.display_name.localeCompare(b.display_name));

    const playerById = new Map(
      ((playerRows ?? []) as Record<string, unknown>[]).map((row) => {
        const player = { ...normalizePlayer(row), jersey_number: jerseyByPlayer.get(Number(row.sportmonks_id)) ?? null };
        return [player.sportmonks_id, player];
      })
    );
    const statsByPlayer = new Map(stats.map((stat) => [stat.player_sportmonks_id, stat]));
    const ages = players.map((player) => ageNumber(player.date_of_birth)).filter((age): age is number => typeof age === "number");
    const topSignalPlayer = [...players].sort((a, b) => b.hidden_gem_score - a.hidden_gem_score)[0];

    return {
      club: normalizeClub(club),
      league: leagueResult.data ? normalizeLeague(leagueResult.data as Record<string, unknown>) : null,
      season: seasonResult.data ? normalizeSeason(seasonResult.data as Record<string, unknown>) : null,
      standing: standingResult.data ? {
        position: nullableNumber((standingResult.data as Record<string, unknown>).position),
        points: nullableNumber((standingResult.data as Record<string, unknown>).points)
      } : null,
      players,
      playerById,
      stats,
      statsByPlayer,
      fixtures: ((fixturesResult.data ?? []) as Record<string, unknown>[]).map(normalizeFixture),
      transfers: ((transfersResult.data ?? []) as Record<string, unknown>[]).map(normalizeTransfer),
      avgAge: ages.length ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0,
      topSignal: topSignalPlayer ? `${topSignalPlayer.display_name} (${topSignalPlayer.hidden_gem_score})` : "No signal yet",
      statSourceLabel: buildStatSourceLabel(stats),
      error: null
    };
  } catch (error) {
    return emptyClub(error instanceof Error ? error.message : "Unable to load club.");
  }
}

function emptyClub(error: string | null) {
  return {
    club: null as ClubRow | null,
    league: null as LeagueRow | null,
    season: null as SeasonRow | null,
    standing: null as { position: number | null; points: number | null } | null,
    players: [] as PlayerRow[],
    playerById: new Map<number, PlayerRow>(),
    stats: [] as StatRow[],
    statsByPlayer: new Map<number, StatRow>(),
    fixtures: [] as FixtureRow[],
    transfers: [] as TransferRow[],
    avgAge: 0,
    topSignal: "No signal yet",
    statSourceLabel: "No season stats cached",
    error
  };
}

function normalizeClub(row: Record<string, unknown>): ClubRow {
  return {
    sportmonks_id: Number(row.sportmonks_id),
    name: String(row.name ?? "Unknown club"),
    short_code: typeof row.short_code === "string" ? row.short_code : null,
    image_path: typeof row.image_path === "string" ? row.image_path : null,
    founded: nullableNumber(row.founded),
    venue_sportmonks_id: nullableNumber(row.venue_sportmonks_id),
    updated_at: typeof row.updated_at === "string" ? row.updated_at : null
  };
}

function normalizeLeague(row: Record<string, unknown>): LeagueRow {
  return {
    sportmonks_id: Number(row.sportmonks_id),
    name: String(row.name ?? "Unknown league"),
    image_path: typeof row.image_path === "string" ? row.image_path : null
  };
}

function normalizeSeason(row: Record<string, unknown>): SeasonRow {
  return {
    sportmonks_id: Number(row.sportmonks_id),
    name: String(row.name ?? "Unknown season")
  };
}

function normalizePlayer(row: Record<string, unknown>): Omit<PlayerRow, "jersey_number"> {
  return {
    sportmonks_id: Number(row.sportmonks_id),
    display_name: String(row.display_name ?? "Unknown player"),
    position_name: typeof row.position_name === "string" ? row.position_name : null,
    nationality_name: typeof row.nationality_name === "string" ? row.nationality_name : null,
    image_path: typeof row.image_path === "string" ? row.image_path : null,
    date_of_birth: typeof row.date_of_birth === "string" ? row.date_of_birth : null,
    hidden_gem_score: Number(row.hidden_gem_score ?? 0)
  };
}

function normalizeStat(row: Record<string, unknown>): StatRow {
  return {
    player_sportmonks_id: Number(row.player_sportmonks_id),
    minutes: nullableNumber(row.minutes) ?? 0,
    rating: nullableNumber(row.rating),
    goals: nullableNumber(row.goals) ?? 0,
    assists: nullableNumber(row.assists) ?? 0,
    expected_goals: nullableNumber(row.expected_goals) ?? 0,
    expected_assists: nullableNumber(row.expected_assists) ?? 0,
    tackles: nullableNumber(row.tackles) ?? 0,
    interceptions: nullableNumber(row.interceptions) ?? 0,
    source: typeof row.source === "string" ? row.source : "sportmonks"
  };
}

function normalizeFixture(row: Record<string, unknown>): FixtureRow {
  return {
    sportmonks_id: Number(row.sportmonks_id),
    name: typeof row.name === "string" ? row.name : null,
    starting_at: typeof row.starting_at === "string" ? row.starting_at : null,
    result_info: typeof row.result_info === "string" ? row.result_info : null,
    home_team_sportmonks_id: nullableNumber(row.home_team_sportmonks_id),
    away_team_sportmonks_id: nullableNumber(row.away_team_sportmonks_id),
    home_score: nullableNumber(row.home_score),
    away_score: nullableNumber(row.away_score),
    raw: isRecord(row.raw) ? row.raw : {}
  };
}

function normalizeTransfer(row: Record<string, unknown>): TransferRow {
  return {
    sportmonks_id: Number(row.sportmonks_id),
    player_sportmonks_id: nullableNumber(row.player_sportmonks_id),
    from_team_sportmonks_id: nullableNumber(row.from_team_sportmonks_id),
    to_team_sportmonks_id: nullableNumber(row.to_team_sportmonks_id),
    transfer_date: typeof row.transfer_date === "string" ? row.transfer_date : null,
    type_name: typeof row.type_name === "string" ? row.type_name : null
  };
}

function contributionScore(stat: StatRow) {
  return stat.goals * 18 + stat.assists * 14 + stat.expected_goals * 8 + stat.expected_assists * 8 + stat.tackles * 1.2 + stat.interceptions * 1.5 + stat.minutes / 180;
}

function positionSort(position: string | null) {
  return { Goalkeeper: 0, Defender: 1, Midfielder: 2, Attacker: 3 }[position ?? ""] ?? 9;
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

function buildStatSourceLabel(stats: StatRow[]) {
  if (stats.length === 0) return "No season stats cached";
  const sources = new Set(stats.map((row) => row.source));
  if (sources.has("sportmonks") && sources.has("match_aggregate")) return "Sportmonks + aggregate";
  if (sources.has("match_aggregate")) return "Match aggregate";
  return "Sportmonks season stats";
}

function scoreLine(fixture: FixtureRow) {
  if (fixture.home_score !== null && fixture.away_score !== null) return `${fixture.home_score}-${fixture.away_score}`;
  return "vs";
}

function formatDate(value: string | null) {
  if (!value) return "Unknown date";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value: string | null) {
  if (!value) return "Not synced yet";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDecimal(value: number | null) {
  return typeof value === "number" ? value.toFixed(2) : "-";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
