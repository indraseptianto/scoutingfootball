import { NextRequest, NextResponse } from "next/server";
import { isSyncEntity, syncJobs } from "@/lib/providers/sportmonks/sync";

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const job = request.nextUrl.searchParams.get("job") ?? "";
  if (!isSyncEntity(job)) {
    return NextResponse.json({ error: `Unknown cron sync job: ${job}` }, { status: 400 });
  }

  const result = await syncJobs[job]();
  return NextResponse.json(result, { status: result.status === "success" ? 200 : 500 });
}
