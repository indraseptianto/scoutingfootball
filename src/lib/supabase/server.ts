import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serviceClient: SupabaseClient | null = null;

export function getSupabaseServiceClient() {
  if (serviceClient) return serviceClient;

  ensureServerStorageShim();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase service environment variables.");
  }

  serviceClient = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return serviceClient;
}

function ensureServerStorageShim() {
  const globalScope = globalThis as typeof globalThis & {
    localStorage?: {
      getItem?: unknown;
      setItem?: unknown;
      removeItem?: unknown;
    };
  };

  if (!globalScope.localStorage || typeof globalScope.localStorage.getItem === "function") return;

  globalScope.localStorage = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined
  } as unknown as Storage;
}
