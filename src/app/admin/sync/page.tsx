import { Activity, DatabaseZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const jobs = [
  "countries",
  "positions",
  "leagues",
  "seasons",
  "teams",
  "players",
  "squads",
  "fixtures",
  "standings",
  "transfers",
  "statistics"
];

export default function AdminSyncPage() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-black">
          <DatabaseZap size={20} />
        </div>
        <div>
          <p className="text-sm text-accent">Platform Admin</p>
          <h1 className="text-3xl font-semibold">Sportmonks sync control</h1>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {jobs.map((job) => (
          <Card key={job}>
            <CardHeader>
              <CardTitle className="capitalize">{job}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted">POST `/api/sync/{job}` using the server-side Sportmonks token.</p>
              <Button variant="secondary" asChild>
                <a href={`/api/sync/logs`}><Activity size={16} /> View logs</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
