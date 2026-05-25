import {
  ArrowRight,
  BarChart3,
  Brain,
  ClipboardList,
  FileText,
  LineChart,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  ["Hidden Gems", "/hidden-gems"],
  ["Scouting", "/scouting"],
  ["Recommendations", "/recommendations"],
  ["Shortlist", "/shortlist"]
];

const proofStats = [
  ["3.8k+", "Synced player profiles"],
  ["91", "Top tactical fit signal"],
  ["<15s", "AI report generation"],
  ["115", "Clubs in workspace"]
];

const problemCards = [
  {
    title: "Wasted recruitment budget",
    body: "Stop overpaying for familiar names. Surface measurable value from minutes, age curve, role fit, and transfer context.",
    metric: "-32%",
    label: "Estimated wasted spend"
  },
  {
    title: "Missed opportunities",
    body: "Spot low-minute players before they become obvious. Hidden-gem scoring now rewards signal quality, not empty profiles.",
    metric: "4.7x",
    label: "Earlier shortlist signal"
  }
];

const featureCards = [
  {
    icon: <FileText size={20} />,
    title: "Professional reports in seconds",
    body: "Generate player-by-player scouting reports with strengths, risks, tactical fit, recommendation, and cached history.",
    href: "/scouting"
  },
  {
    icon: <Users size={20} />,
    title: "Squad depth intelligence",
    body: "Compare teams and identify where depth, role balance, and recruitment timing can change the window strategy.",
    href: "/compare"
  },
  {
    icon: <Sparkles size={20} />,
    title: "Undervalued asset discovery",
    body: "Rank hidden gems with low-minute context, performance signal, and contract intelligence for smarter market timing.",
    href: "/hidden-gems"
  },
  {
    icon: <ClipboardList size={20} />,
    title: "Collaborative workspace",
    body: "Move targets from discovery to watched, reviewed, and ready with notes, assignment, and shortlist persistence.",
    href: "/shortlist"
  },
  {
    icon: <LineChart size={20} />,
    title: "Predictive transfer value",
    body: "Turn live Sportmonks data into a practical recruitment score for risk, fit, contract urgency, and role demand.",
    href: "/recommendations"
  }
];

const showcaseTabs = ["Recruitment board", "Player intelligence", "Market signals"];
const boardRows = [
  ["Enzo Fernandez", "CM", "High fit", "88"],
  ["Pedro Neto", "ATT", "Counter threat", "82"],
  ["Adrien Truffert", "DEF", "Value lane", "79"],
  ["Lewis Hall", "DEF", "Age curve", "76"]
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="layout2-hero relative min-h-screen border-b border-border">
        <div className="hero-grid absolute inset-0 opacity-35" />
        <div className="hero-sweep absolute inset-x-0 top-0 h-px" />

        <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <a href="/" className="flex items-center gap-3">
            <span className="brand-mark flex h-10 w-10 items-center justify-center rounded-md bg-accent text-black">
              <Radar size={21} />
            </span>
            <span className="text-base font-semibold md:text-lg">ScoutFlow AI</span>
          </a>
          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map(([label, href]) => (
              <Button key={href} variant="ghost" asChild>
                <a href={href}>{label}</a>
              </Button>
            ))}
          </div>
          <Button asChild className="hidden sm:inline-flex">
            <a href="/recommendations">
              Get Started <ArrowRight size={16} />
            </a>
          </Button>
        </nav>

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-82px)] max-w-7xl flex-col items-center justify-center px-5 pb-16 pt-8 text-center md:px-8">
          <div className="hero-copy mx-auto max-w-5xl">
            <div className="mx-auto mb-6 inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-accent/25 bg-accent-soft px-4 py-2 text-center text-xs text-accent shadow-[0_0_35px_rgba(0,255,135,0.12)] sm:text-sm">
              <ShieldCheck size={15} />
              <span className="min-w-0 truncate sm:whitespace-normal">Sportmonks-powered recruitment intelligence</span>
            </div>
            <h1 className="mx-auto max-w-[18rem] break-words text-3xl font-semibold leading-[1.08] tracking-normal text-white sm:max-w-5xl sm:text-5xl md:text-7xl lg:text-8xl">
              <span className="block sm:inline">Elite Recruitment</span>{" "}
              <span className="block sm:inline">Intelligence for the</span>{" "}
              <span className="block sm:inline">Next Generation of Clubs</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[18rem] text-base leading-8 text-muted sm:max-w-3xl md:text-xl">
              Find undervalued players, generate AI scouting reports, compare squad needs, and build a transfer shortlist with one clean workflow.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button asChild className="w-full max-w-[18rem] justify-center sm:w-auto">
                <a href="/hidden-gems">
                  <Search size={16} /> Discover hidden gems
                </a>
              </Button>
              <Button variant="secondary" asChild className="w-full max-w-[18rem] justify-center sm:w-auto">
                <a href="/scouting">
                  <Brain size={16} /> Generate report
                </a>
              </Button>
            </div>
          </div>

          <div className="layout2-stat-cloud mt-12 grid w-full max-w-[18rem] grid-cols-1 gap-3 sm:max-w-5xl sm:grid-cols-2 md:grid-cols-4">
            {proofStats.map(([value, label], index) => (
              <div
                key={label}
                className="floating-stat rounded-lg border border-white/10 bg-white/[0.045] p-4 text-left backdrop-blur"
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <div className="font-mono text-3xl font-semibold text-accent">{value}</div>
                <div className="mt-2 text-xs uppercase tracking-normal text-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-accent">The cost of outdated scouting</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">Recruitment mistakes compound quickly.</h2>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {problemCards.map((card) => (
              <article key={card.title} className="layout2-card rounded-lg border border-border bg-card p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-xl">
                    <h3 className="text-2xl font-semibold">{card.title}</h3>
                    <p className="mt-4 leading-7 text-muted">{card.body}</p>
                  </div>
                  <div className="min-w-36 rounded-md border border-accent/25 bg-accent-soft p-4 text-left">
                    <div className="font-mono text-4xl font-semibold text-accent">{card.metric}</div>
                    <div className="mt-2 text-xs text-muted">{card.label}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-accent">Elite tools for every sporting director</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">From raw data to confident transfer calls.</h2>
            </div>
            <Button variant="secondary" asChild>
              <a href="/players">
                Explore players <ArrowRight size={16} />
              </a>
            </Button>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature, index) => (
              <a
                key={feature.title}
                href={feature.href}
                className={`layout2-card rounded-lg border border-border bg-card p-6 transition hover:border-accent/60 hover:bg-white/[0.05] ${index === 0 ? "lg:col-span-2" : ""}`}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-md border border-accent/30 bg-accent-soft text-accent">{feature.icon}</span>
                <h3 className="mt-6 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{feature.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold text-accent">Built for performance</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight md:text-6xl">A scouting room that feels fast, focused, and visual.</h2>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {showcaseTabs.map((tab, index) => (
              <span
                key={tab}
                className={`rounded-md border px-4 py-2 text-sm ${index === 0 ? "border-accent/50 bg-accent-soft text-accent" : "border-border bg-white/[0.03] text-muted"}`}
              >
                {tab}
              </span>
            ))}
          </div>

          <div className="hero-panel mx-auto mt-10 max-w-6xl">
            <div className="pitch-card rounded-lg border border-border bg-card p-4 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-accent">Live recruitment command center</p>
                  <h3 className="mt-1 text-2xl font-semibold">Summer window shortlist</h3>
                </div>
                <div className="flex items-center gap-2 rounded-md border border-border bg-black/20 px-3 py-2 text-sm text-muted">
                  <span className="pulse-dot h-2.5 w-2.5 rounded-full bg-accent" />
                  Sync active
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                <div className="football-pitch relative min-h-[420px] overflow-hidden rounded-md border border-white/15 bg-[#10251d]">
                  <div className="pitch-line center-circle" />
                  <div className="pitch-line box-top" />
                  <PlayerPin className="left-[49%] top-[15%]" label="ST" score="82" />
                  <PlayerPin className="left-[23%] top-[34%]" label="LW" score="76" delay="0.3s" />
                  <PlayerPin className="left-[72%] top-[34%]" label="RW" score="79" delay="0.5s" />
                  <PlayerPin className="left-[49%] top-[51%]" label="CM" score="88" delay="0.15s" />
                  <PlayerPin className="left-[30%] top-[71%]" label="CB" score="73" delay="0.4s" />
                  <PlayerPin className="left-[67%] top-[73%]" label="FB" score="84" delay="0.2s" />
                </div>

                <div className="grid content-start gap-3">
                  <div className="rounded-md border border-border bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted"><BarChart3 size={15} /> Recruitment fit</span>
                      <span className="font-mono text-accent">91</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <span className="animated-bar block h-full rounded-full bg-accent" />
                    </div>
                  </div>

                  {boardRows.map(([name, role, signal, score], index) => (
                    <a
                      key={name}
                      href="/scouting"
                      className="live-row grid grid-cols-[1fr_auto] gap-3 rounded-md border border-border bg-black/20 p-3 transition hover:border-accent/60"
                      style={{ animationDelay: `${index * 0.08}s` }}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{name}</span>
                        <span className="mt-1 block truncate text-xs text-muted">{role} - {signal}</span>
                      </span>
                      <span className="font-mono text-accent">{score}</span>
                    </a>
                  ))}

                  <Button asChild className="w-full">
                    <a href="/recommendations">
                      Build recommendation list <Target size={16} />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-10 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 text-sm text-muted md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <a href="/" className="flex items-center gap-3 text-foreground">
              <span className="brand-mark flex h-9 w-9 items-center justify-center rounded-md bg-accent text-black">
                <Radar size={19} />
              </span>
              <span className="font-semibold">ScoutFlow AI</span>
            </a>
            <p className="mt-4 max-w-sm leading-6">Sportmonks API v3 only. Built for scouting, recruitment, and squad intelligence.</p>
          </div>
          <FooterGroup title="Product" links={[["Hidden Gems", "/hidden-gems"], ["Scouting", "/scouting"], ["Shortlist", "/shortlist"]]} />
          <FooterGroup title="Workspace" links={[["Leagues", "/leagues"], ["Players", "/players"], ["Compare", "/compare"]]} />
          <FooterGroup title="Decision" links={[["Recommendations", "/recommendations"], ["Contracts", "/contracts"], ["Watchlist", "/watchlist"]]} />
        </div>
      </footer>
    </main>
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

function FooterGroup({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <div className="mt-4 grid gap-2">
        {links.map(([label, href]) => (
          <a key={href} href={href} className="transition hover:text-accent">{label}</a>
        ))}
      </div>
    </div>
  );
}
