import { Search, SlidersHorizontal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const samplePlayers = [
  ["Elliot Warren", "CM", "Barnsley", "74", "Strong"],
  ["Mateo Klein", "LW", "Dynamo Dresden", "82", "Strong"],
  ["Noah Bell", "CB", "Portsmouth", "66", "Emerging"],
  ["Lucas Ferri", "ST", "Modena", "91", "Elite"]
];

export default function PlayersPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-accent">Player Database</p>
          <h1 className="mt-2 text-3xl font-semibold">Recruitment search</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Server-side filtering and TanStack Table wiring can attach directly to the Supabase `players` view.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><SlidersHorizontal size={16} /> Filters</Button>
          <Button><Search size={16} /> Search</Button>
        </div>
      </div>

      <Card className="mt-8 overflow-hidden">
        <CardHeader>
          <CardTitle>Shortlist-ready profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid min-w-[720px] grid-cols-[1.5fr_0.7fr_1fr_0.7fr_0.8fr] border-b border-border pb-3 text-sm text-muted">
            <span>Name</span><span>Position</span><span>Club</span><span>Gem</span><span>Tier</span>
          </div>
          {samplePlayers.map((player) => (
            <div key={player[0]} className="grid min-w-[720px] grid-cols-[1.5fr_0.7fr_1fr_0.7fr_0.8fr] border-b border-border py-4 text-sm last:border-0">
              <span className="font-medium">{player[0]}</span>
              <span>{player[1]}</span>
              <span className="text-muted">{player[2]}</span>
              <span className="font-mono text-accent">{player[3]}</span>
              <span className="inline-flex items-center gap-2"><Star size={14} className="text-accent" /> {player[4]}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
