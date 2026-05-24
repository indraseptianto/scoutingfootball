import { NextRequest } from "next/server";

export function isAuthorizedCronRequest(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const authorization = request.headers.get("authorization")?.trim();
  const cronSecret = request.headers.get("x-cron-secret")?.trim();

  return authorization === `Bearer ${secret}` || cronSecret === secret;
}
