import { ArrowRight, Brain, Radar, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";

const features = [
  ["Hidden Gem Discovery", "Rank undervalued players by opportunity, age curve, contract status, and production."],
  ["AI Scouting Reports", "Generate structured recruitment reports from Sportmonks stats, club context, and scout notes."],
  ["Squad Intelligence", "Spot positional depth issues, age risk, and recruitment priorities before the window panic."],
  ["Contract Monitoring", "Track expiring contracts and alert analysts when targets become realistic."]
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-black">
            <Radar size={20} />
          </div>
          <span className="text-lg font-semibold">ScoutFlow AI</span>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild><a href="/leagues">Leagues</a></Button>
          <Button variant="ghost" asChild><a href="/players">Players</a></Button>
          <Button variant="ghost" asChild><a href="/clubs">Clubs</a></Button>
          <Button variant="ghost" asChild><a href="/admin/sync">Sync Admin</a></Button>
          <Button variant="secondary">Request demo</Button>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-3 py-1 text-sm text-muted">
            <Trophy size={14} className="text-accent" />
            AI Recruitment Intelligence for Lower-Tier Football Clubs
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-tight tracking-normal md:text-7xl">
            Find smarter targets before bigger clubs notice.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            ScoutFlow AI turns Sportmonks Football API v3 data into recruitment workflows for scouts, analysts,
            sporting directors, club admins, and recruitment agencies.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild><a href="/players">Open player database <ArrowRight size={16} /></a></Button>
            <Button variant="secondary" asChild><a href="/admin/sync">Manage data sync</a></Button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Hidden gems" value="1,250+" detail="Targetable profiles from synced squads" />
            <StatCard label="AI reports" value="<15s" detail="Structured outputs for recruitment decisions" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Recruitment board</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {["Watchlist", "Scout Further", "Priority Target", "Negotiation"].map((stage, index) => (
                <div key={stage} className="flex items-center justify-between rounded-md border border-border bg-white/[0.03] p-3">
                  <span>{stage}</span>
                  <span className="font-mono text-sm text-accent">{index * 7 + 4}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-border bg-black/20">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-12 md:grid-cols-4">
          {features.map(([title, body]) => (
            <Card key={title}>
              <CardHeader>
                <Brain className="text-accent" size={20} />
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted">{body}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-sm text-muted">
        <span>Sportmonks API v3 only. No livescore, fantasy, or betting workflows.</span>
        <ShieldCheck size={18} className="text-accent" />
      </footer>
    </main>
  );
}
