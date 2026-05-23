import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getHost(value?: string) {
  if (!value) return null;
  try {
    return new URL(value).host;
  } catch {
    return "invalid-url";
  }
}

function looksLikeJwt(value?: string) {
  return Boolean(value && value.split(".").length === 3 && value.startsWith("ey"));
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const diagnostics = {
    supabaseUrl: {
      present: Boolean(supabaseUrl),
      host: getHost(supabaseUrl),
      hasRestPath: Boolean(supabaseUrl?.includes("/rest/v1"))
    },
    anonKey: {
      present: Boolean(anonKey),
      looksLikeJwt: looksLikeJwt(anonKey)
    },
    serviceRoleKey: {
      present: Boolean(serviceRoleKey),
      looksLikeJwt: looksLikeJwt(serviceRoleKey),
      sameAsAnonKey: Boolean(anonKey && serviceRoleKey && anonKey === serviceRoleKey)
    },
    cronSecret: {
      present: Boolean(process.env.CRON_SECRET)
    },
    sportmonksToken: {
      present: Boolean(process.env.SPORTMONKS_API_TOKEN)
    }
  };

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      ok: false,
      diagnostics,
      supabaseServiceCheck: "missing-url-or-service-role-key"
    });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { error } = await supabase.from("data_sync_logs").select("id", { count: "exact", head: true });

    return NextResponse.json({
      ok: !error,
      diagnostics,
      supabaseServiceCheck: error ? error.message : "ok"
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      diagnostics,
      supabaseServiceCheck: error instanceof Error ? error.message : "unknown-error"
    });
  }
}
