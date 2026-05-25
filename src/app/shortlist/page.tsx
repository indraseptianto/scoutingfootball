import { ArrowLeft, ClipboardList, MessageSquareText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildRecruitmentScore, formatDecimal, getRecruitmentDataset, per90 } from "@/lib/recruitment-data";

const stages = [
  { key: "watchlist", title: "Watchlist", min: 0, max: 59 },
  { key: "scout", title: "Scout Further", min: 60, max: 72 },
  { key: "priority", title: "Priority Target", min: 73, max: 84 },
  { key: "negotiation", title: "Negotiation", min: 85, max: 100 }
];

export const dynamic = "force-dynamic";

export default async function ShortlistPage() {
  const { players, error } = await getRecruitmentDataset(220);
  const cards = players
    .map((player) => ({ player, score: buildRecruitmentScore(player) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 48);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <Button variant="ghost" asChild><a href="/"><ArrowLeft size={16} /> Home</a></Button>
      <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-accent"><ClipboardList size={16} /> Transfer Shortlist</p>
          <h1 className="mt-2 text-4xl font-semibold">Recruitment board</h1>
          <p className="mt-2 max-w-2xl text-muted">Kanban-style shortlist generated from current cached data until user-owned shortlist mutations are wired in.</p>
        </div>
        <Button asChild><a href="/hidden-gems"><Star size={16} /> Add from gems</a></Button>
      </div>

      {error ? <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

      <section className="mt-6 grid gap-4 xl:grid-cols-4">
        {stages.map((stage) => {
          const stageCards = cards.filter(({ score }) => score >= stage.min && score <= stage.max).slice(0, 8);
          return (
            <Card key={stage.key} className="min-h-[520px]">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{stage.title}</CardTitle>
                  <span className="rounded-md border border-border bg-black/20 px-2 py-1 font-mono text-sm text-accent">{stageCards.length}</span>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                {stageCards.map(({ player, score }) => (
                  <a key={player.sportmonks_id} href={`/scouting?player=${player.sportmonks_id}`} className="rounded-md border border-border bg-black/20 p-4 transition hover:border-accent/60">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">{player.display_name}</h2>
                        <p className="mt-1 truncate text-sm text-muted">{player.position_name ?? "Unknown"} - {player.club_name ?? "Unassigned"}</p>
                      </div>
                      <span className="font-mono text-accent">{score}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <Mini label="G+A/90" value={formatDecimal(per90(player.goals + player.assists, player.minutes))} />
                      <Mini label="xGI/90" value={formatDecimal(per90(player.expected_goals + player.expected_assists, player.minutes))} />
                      <Mini label="Gem" value={String(player.hidden_gem_score)} />
                    </div>
                    <p className="mt-4 flex items-center gap-2 text-xs text-muted"><MessageSquareText size={13} /> Needs scout note and video validation</p>
                  </a>
                ))}
                {stageCards.length === 0 ? <p className="text-sm text-muted">No players in this lane yet.</p> : null}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </main>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-md border border-border bg-white/[0.03] p-2">
      <span className="block font-mono text-accent">{value}</span>
      <span className="mt-1 block text-muted">{label}</span>
    </span>
  );
}
