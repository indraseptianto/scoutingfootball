import { ArrowLeft, Search, Sparkles, Star, Target, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildRecruitmentScore, contractStatusForPlayer, formatDecimal, getRecruitmentDataset, per90, playerAge } from "@/lib/recruitment-data";
import { hiddenGemTier } from "@/lib/hidden-gem";

type SearchParams = {
  position?: string;
  maxAge?: string;
};

export const dynamic = "force-dynamic";

export default async function HiddenGemsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const maxAge = Number(params.maxAge ?? "24") || 24;
  const position = typeof params.position === "string" ? params.position : "";
  const { players, error } = await getRecruitmentDataset(300);
  const positions = Array.from(new Set(players.map((player) => player.position_name).filter(Boolean) as string[])).sort();
  const gems = players
    .filter((player) => !position || player.position_name === position)
    .filter((player) => {
      const age = playerAge(player.date_of_birth);
      return !age || age <= maxAge;
    })
    .map((player) => ({ player, score: buildRecruitmentScore(player), contract: contractStatusForPlayer(player) }))
    .sort((a, b) => b.player.hidden_gem_score - a.player.hidden_gem_score || b.score - a.score)
    .slice(0, 48);

  const top = gems[0];

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <Button variant="ghost" asChild><a href="/"><ArrowLeft size={16} /> Home</a></Button>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <div className="rounded-lg border border-border bg-card p-6 md:p-8">
          <p className="flex items-center gap-2 text-sm font-medium text-accent"><Sparkles size={16} /> Hidden Gem Discovery</p>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">Undervalued targets with data-backed upside.</h1>
          <p className="mt-4 max-w-2xl text-muted">
            Ranked from Sportmonks player cache, season production, age curve, contract opportunity, and ScoutFlow hidden-gem score.
          </p>
          <form className="mt-8 grid gap-3 md:grid-cols-[1fr_160px_auto]">
            <select name="position" defaultValue={position} className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm outline-none focus:ring-2 focus:ring-accent">
              <option value="">All positions</option>
              {positions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <input name="maxAge" defaultValue={maxAge} inputMode="numeric" className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm outline-none focus:ring-2 focus:ring-accent" />
            <Button type="submit"><Search size={16} /> Filter</Button>
          </form>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Top signal</CardTitle>
            <p className="text-sm text-muted">Best player after current filters.</p>
          </CardHeader>
          <CardContent>
            {top ? (
              <a href={`/scouting?player=${top.player.sportmonks_id}`} className="block rounded-md border border-border bg-black/20 p-4 transition hover:border-accent/60">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{top.player.display_name}</h2>
                    <p className="mt-1 text-sm text-muted">{top.player.position_name ?? "Unknown"} - {top.player.club_name ?? "Unassigned"}</p>
                  </div>
                  <span className="font-mono text-4xl text-accent">{top.player.hidden_gem_score}</span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <Mini label="Age" value={String(playerAge(top.player.date_of_birth) ?? "-")} />
                  <Mini label="Fit" value={String(top.score)} />
                  <Mini label="Contract" value={top.contract.label} />
                </div>
              </a>
            ) : <p className="text-sm text-muted">No players match this filter.</p>}
          </CardContent>
        </Card>
      </section>

      {error ? <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {gems.map(({ player, score, contract }, index) => (
          <a key={player.sportmonks_id} href={`/players/${player.sportmonks_id}`} className="rounded-lg border border-border bg-card p-5 transition hover:border-accent/60">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs uppercase text-muted">#{index + 1} discovery</p>
                <h2 className="mt-2 truncate text-xl font-semibold">{player.display_name}</h2>
                <p className="mt-1 truncate text-sm text-muted">{player.position_name ?? "Unknown"} - {player.club_name ?? "Unassigned"}</p>
              </div>
              <span className="rounded-md border border-accent/40 bg-accent-soft px-3 py-2 font-mono text-accent">{player.hidden_gem_score}</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
              <Signal icon={<Star size={14} />} label={hiddenGemTier(player.hidden_gem_score)} value="Gem" />
              <Signal icon={<Target size={14} />} label={String(score)} value="Fit" />
              <Signal icon={<Timer size={14} />} label={String(player.minutes)} value="Minutes" />
            </div>
            <div className="mt-5 grid gap-2 text-sm">
              <Row label="Output /90" value={formatDecimal(per90(player.goals + player.assists, player.minutes))} />
              <Row label="xG+xA /90" value={formatDecimal(per90(player.expected_goals + player.expected_assists, player.minutes))} />
              <Row label="Contract" value={contract.label} />
            </div>
          </a>
        ))}
      </section>
    </main>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-white/[0.03] p-3">
      <div className="truncate font-mono text-lg text-accent">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

function Signal({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-black/20 p-3">
      <div className="flex items-center gap-1 text-accent">{icon}<span className="truncate font-medium">{label}</span></div>
      <div className="mt-1 text-xs text-muted">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
