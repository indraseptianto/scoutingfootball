import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/auth/cron";
import { isSyncEntity, syncJobs, type SyncEntity } from "@/lib/providers/sportmonks/sync";

const cronBatches: Record<string, SyncEntity[]> = {
  "daily-reference": ["countries", "positions", "leagues", "seasons", "teams"],
  "daily-market": ["squads", "fixtures", "standings", "transfers", "season-statistics", "statistics"]
};

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const job = request.nextUrl.searchParams.get("job") ?? "";
  if (job in cronBatches) {
    const results = [];
    for (const entity of cronBatches[job]) {
      results.push(await syncJobs[entity]());
    }

    const failed = results.some((result) => result.status === "failed");
    return NextResponse.json({ job, results }, { status: failed ? 500 : 200 });
  }

  if (!isSyncEntity(job)) {
    return NextResponse.json({ error: `Unknown cron sync job: ${job}` }, { status: 400 });
  }

  const result = await syncJobs[job]();
  return NextResponse.json(result, { status: result.status === "success" ? 200 : 500 });
}
