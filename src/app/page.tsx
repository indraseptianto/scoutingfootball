import {
  ArrowRight,
  BarChart3,
  Brain,
  ClipboardList,
  GitCompareArrows,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";

const quickLinks = [
  ["Leagues", "/leagues"],
  ["Players", "/players"],
  ["Hidden Gems", "/hidden-gems"],
  ["Scouting", "/scouting"],
  ["Shortlist", "/shortlist"]
];

const workflows = [
  {
    icon: <Sparkles size={18} />,
    title: "Discover",
    body: "Find undervalued players with live hidden-gem scoring, age curve, minutes, and opportunity signal.",
    href: "/hidden-gems"
  },
  {
    icon: <Brain size={18} />,
    title: "Scout",
    body: "Open one player, generate a cached AI report, and validate the profile with Sportmonks statistics.",
    href: "/scouting"
  },
  {
    icon: <ClipboardList size={18} />,
    title: "Decide",
    body: "Move targets through shortlist stages, save notes, and export your recruitment board.",
    href: "/shortlist"
  }
];

const liveRows = [
  ["Adrien Truffert", "DEF", "AFC Bournemouth", "84"],
  ["Pedro Neto", "ATT", "Chelsea", "78"],
  ["Lewis Hall", "DEF", "Newcastle United", "72"],
  ["Martín Pedroarena", "ATT", "Osasuna", "68"]
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative min-h-screen border-b border-border">
        <div className="hero-grid absolute inset-0 opacity-45" />
        <div className="hero-sweep absolute inset-x-0 top-0 h-px" />

        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-6">
          <a href="/" className="flex items-center gap-3">
            <span className="brand-mark flex h-10 w-10 items-center justify-center rounded-md bg-accent text-black">
              <Radar size={21} />
            </span>
            <span className="text-lg font-semibold">ScoutFlow AI</span>
          </a>
          <div className="hidden items-center gap-1 lg:flex">
            {quickLinks.map(([label, href]) => (
              <Button key={href} variant="ghost" asChild><a href={href}>{label}</a></Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" asChild className="hidden sm:inline-flex"><a href="/recommendations">Recommend</a></Button>
            <Button asChild><a href="/hidden-gems">Launch <ArrowRight size={16} /></a></Button>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 pb-10 pt-8 md:px-6 lg:min-h-[calc(100vh-82px)] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pb-16">
          <div className="hero-copy">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.04] px-3 py-1 text-sm text-muted backdrop-blur">
              <Trophy size={14} className="text-accent" />
              Sportmonks-powered recruitment intelligence
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal md:text-7xl">
              See the next smart signing before the market moves.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted md:text-lg">
              A clean workspace for lower-tier football recruitment: discover hidden gems, compare teams, generate scouting reports,
              and push players into a real shortlist without spreadsheet chaos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild><a href="/hidden-gems"><Search size={16} /> Find hidden gems</a></Button>
              <Button variant="secondary" asChild><a href="/scouting"><Brain size={16} /> Scout one player</a></Button>
              <Button variant="secondary" asChild><a href="/compare"><GitCompareArrows size={16} /> Compare teams</a></Button>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              <MiniMetric label="Synced clubs" value="115" />
              <MiniMetric label="Players" value="3.8k" />
              <MiniMetric label="Reports" value="<15s" />
            </div>
          </div>

          <div className="hero-panel relative">
            <div className="pitch-card rounded-lg border border-border bg-card p-4 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-accent">Live Recruitment Room</p>
                  <h2 className="mt-1 text-xl font-semibold">Summer window shortlist</h2>
                </div>
                <span className="pulse-dot h-3 w-3 rounded-full bg-accent" />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1fr_270px]">
                <div className="football-pitch relative min-h-[390px] overflow-hidden rounded-md border border-white/15 bg-[#10251d]">
                  <div className="pitch-line center-circle" />
                  <div className="pitch-line box-top" />
                  <div className="pitch-line box-bottom" />
                  <PlayerPin className="left-[48%] top-[13%]" label="ST" score="82" />
                  <PlayerPin className="left-[22%] top-[31%]" label="LW" score="76" delay="0.3s" />
                  <PlayerPin className="left-[71%] top-[32%]" label="RW" score="79" delay="0.5s" />
                  <PlayerPin className="left-[48%] top-[48%]" label="CM" score="88" delay="0.15s" />
                  <PlayerPin className="left-[28%] top-[67%]" label="CB" score="73" delay="0.4s" />
                  <PlayerPin className="left-[66%] top-[70%]" label="FB" score="84" delay="0.2s" />
                </div>

                <div className="grid gap-3">
                  <div className="rounded-md border border-border bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted"><BarChart3 size={15} /> Match fit</span>
                      <span className="font-mono text-accent">91</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <span className="animated-bar block h-full rounded-full bg-accent" />
                    </div>
                  </div>

                  <div className="live-list grid gap-2">
                    {liveRows.map(([name, role, club, score], index) => (
                      <a
                        key={name}
                        href="/scouting"
                        className="live-row grid grid-cols-[1fr_auto] gap-3 rounded-md border border-border bg-black/20 p-3 transition hover:border-accent/60"
                        style={{ animationDelay: `${index * 0.08}s` }}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{name}</span>
                          <span className="mt-1 block truncate text-xs text-muted">{role} - {club}</span>
                        </span>
                        <span className="font-mono text-accent">{score}</span>
                      </a>
                    ))}
                  </div>

                  <Button asChild className="w-full"><a href="/recommendations">Build recommendation list <ArrowRight size={16} /></a></Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-5 py-12 md:px-6 lg:grid-cols-3">
        {workflows.map((item) => (
          <a key={item.title} href={item.href} className="workflow-card rounded-lg border border-border bg-card p-5 transition hover:border-accent/60 hover:bg-white/[0.04]">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-accent/30 bg-accent-soft text-accent">{item.icon}</span>
            <h2 className="mt-5 text-xl font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
          </a>
        ))}
      </section>

      <footer className="mx-auto flex max-w-7xl items-center justify-between px-5 py-8 text-sm text-muted md:px-6">
        <span>Sportmonks API v3 only. Built for scouting, recruitment, and squad intelligence.</span>
        <ShieldCheck size={18} className="text-accent" />
      </footer>
    </main>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-white/[0.035] p-3">
      <div className="font-mono text-2xl font-semibold text-accent">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

function PlayerPin({ className, label, score, delay = "0s" }: { className: string; label: string; score: string; delay?: string }) {
  return (
    <div className={`player-pin absolute ${className}`} style={{ animationDelay: delay }}>
      <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full border border-accent/50 bg-black/55 shadow-lg shadow-black/30 backdrop-blur">
        <span className="text-[11px] font-semibold text-muted">{label}</span>
        <span className="font-mono text-sm text-accent">{score}</span>
      </div>
    </div>
  );
}
