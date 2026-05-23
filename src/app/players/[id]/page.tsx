import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { hiddenGemTier } from "@/lib/hidden-gem";

export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPlayerDetail(Number(id));

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-8">
      <Button variant="ghost" asChild><a href="/players"><ArrowLeft size={16} /> Players</a></Button>

      {data.error ? (
        <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">{data.error}</div>
      ) : data.player ? (
        <>
          <section className="mt-6 flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <p className="text-sm text-accent">Player Profile</p>
              <h1 className="mt-2 text-4xl font-semibold">{data.player.display_name}</h1>
              <p className="mt-3 text-muted">
                {[data.player.position_name, data.player.nationality_name, data.club?.name].filter(Boolean).join(" / ")}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-sm text-muted">Hidden Gem</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="font-mono text-4xl text-accent">{data.player.hidden_gem_score}</span>
                <span className="inline-flex items-center gap-2"><Star size={16} className="text-accent" /> {hiddenGemTier(data.player.hidden_gem_score)}</span>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Info label="Sportmonks ID" value={String(data.player.sportmonks_id)} />
            <Info label="Height" value={data.player.height ? `${data.player.height} cm` : "Unknown"} />
            <Info label="Weight" value={data.player.weight ? `${data.player.weight} kg` : "Unknown"} />
          </div>

          <Card className="mt-8">
            <CardHeader><CardTitle>Squad Registration</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                <Info label="Club" value={data.club?.name ?? "Unassigned"} href={data.club ? `/clubs/${data.club.sportmonks_id}` : undefined} />
                <Info label="Jersey" value={data.squad?.jersey_number ? String(data.squad.jersey_number) : "Unknown"} />
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="mt-6 text-muted">Player not found.</p>
      )}
    </main>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = <div className="mt-1 font-medium">{value}</div>;
  return (
    <div className="rounded-md border border-border bg-white/[0.03] p-4">
      <p className="text-sm text-muted">{label}</p>
      {href ? <a className="hover:text-accent" href={href}>{content}</a> : content}
    </div>
  );
}

async function getPlayerDetail(sportmonksId: number) {
  try {
    const supabase = getSupabaseServiceClient();
    const { data: player, error } = await supabase
      .from("players")
      .select("sportmonks_id,display_name,position_name,nationality_name,hidden_gem_score,height,weight")
      .eq("sportmonks_id", sportmonksId)
      .maybeSingle();

    if (error) throw error;
    if (!player) return { player: null, squad: null, club: null, error: null };

    const { data: squad } = await supabase
      .from("squad_players")
      .select("team_sportmonks_id,jersey_number")
      .eq("player_sportmonks_id", sportmonksId)
      .limit(1)
      .maybeSingle();

    const { data: club } = squad?.team_sportmonks_id
      ? await supabase
          .from("clubs")
          .select("sportmonks_id,name")
          .eq("sportmonks_id", squad.team_sportmonks_id)
          .maybeSingle()
      : { data: null };

    return { player, squad, club, error: null };
  } catch (error) {
    return {
      player: null,
      squad: null,
      club: null,
      error: error instanceof Error ? error.message : "Unable to load player."
    };
  }
}
