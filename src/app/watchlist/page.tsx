import { ArrowLeft, Activity, Eye, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildRecruitmentScore, contractStatusForPlayer, formatDecimal, getRecruitmentDataset, per90 } from "@/lib/recruitment-data";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const { players, error } = await getRecruitmentDataset(260);
  const watch = players
    .map((player) => ({ player, score: buildRecruitmentScore(player), contract: contractStatusForPlayer(player) }))
    .filter((item) => item.player.hidden_gem_score >= 65 || item.score >= 62 || item.contract.urgency !== "low")
    .sort((a, b) => b.score - a.score)
    .slice(0, 36);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <Button variant="ghost" asChild><a href="/"><ArrowLeft size={16} /> Home</a></Button>
      <section className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-accent"><Eye size={16} /> Player Watchlist</p>
          <h1 className="mt-2 text-4xl font-semibold">Monitoring feed</h1>
          <p className="mt-2 max-w-2xl text-muted">A live shortlist of players worth revisiting as their production, minutes, and contract status shift.</p>
        </div>
        <Button asChild><a href="/contracts"><Activity size={16} /> Contract alerts</a></Button>
      </section>

      {error ? <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {watch.map(({ player, score, contract }) => {
          const output = per90(player.goals + player.assists, player.minutes);
          const xgi = per90(player.expected_goals + player.expected_assists, player.minutes);
          return (
            <a key={player.sportmonks_id} href={`/scouting?player=${player.sportmonks_id}`} className="rounded-lg border border-border bg-card p-5 transition hover:border-accent/60">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-semibold">{player.display_name}</h2>
                  <p className="mt-1 truncate text-sm text-muted">{player.position_name ?? "Unknown"} - {player.club_name ?? "Unassigned"}</p>
                </div>
                <span className="font-mono text-2xl text-accent">{score}</span>
              </div>
              <div className="mt-5 grid gap-3">
                <Event title="Performance spike" detail={`${formatDecimal(output)} G+A/90 and ${formatDecimal(xgi)} xGI/90`} good={output >= 0.35 || xgi >= 0.35} />
                <Event title="Minutes check" detail={`${player.minutes} season minutes cached`} good={player.minutes >= 900} />
                <Event title="Contract watch" detail={contract.label} good={contract.urgency === "high"} />
              </div>
              <p className="mt-5 flex items-center gap-2 text-sm text-muted"><TrendingUp size={14} /> Hidden-gem score {player.hidden_gem_score}</p>
            </a>
          );
        })}
      </section>
    </main>
  );
}

function Event({ title, detail, good }: { title: string; detail: string; good: boolean }) {
  return (
    <div className="rounded-md border border-border bg-black/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{title}</span>
        <span className={good ? "h-2 w-2 rounded-full bg-accent" : "h-2 w-2 rounded-full bg-muted"} />
      </div>
      <p className="mt-1 text-sm text-muted">{detail}</p>
    </div>
  );
}
