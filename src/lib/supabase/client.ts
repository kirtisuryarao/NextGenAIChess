import { createClient } from "@supabase/supabase-js";

export type SupabaseRuntime = "client" | "server";

export interface SupabaseConfig {
  url: string;
  key: string;
  runtime: SupabaseRuntime;
}

function requireEnvValue(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required before Supabase can be initialized.`);
  }

  return value;
}

export function getSupabaseBrowserConfig(): SupabaseConfig {
  return {
    url: requireEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    key: requireEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    runtime: "client",
  };
}

export function createSupabaseBrowserClient() {
  const config = getSupabaseBrowserConfig();
  return createClient(config.url, config.key);
}

export const supabaseClient = createSupabaseBrowserClient();
