import { createClient } from "@supabase/supabase-js";
import type { SupabaseConfig } from "@/lib/supabase/client";

function requireEnvValue(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required before Supabase can be initialized.`);
  }

  return value;
}

export function getSupabaseServerConfig(): SupabaseConfig {
  return {
    url: requireEnvValue(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL, "SUPABASE_URL"),
    key: requireEnvValue(
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "SUPABASE_SERVICE_ROLE_KEY"
    ),
    runtime: "server",
  };
}

export function createSupabaseServerClient() {
  const config = getSupabaseServerConfig();
  return createClient(config.url, config.key, {
    auth: { persistSession: false },
  });
}
