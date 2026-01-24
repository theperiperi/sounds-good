"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-project-id.supabase.co" &&
    supabaseAnonKey !== "your-anon-key-here"
  );
}

export function createClient() {
  if (!isSupabaseConfigured()) {
    // Return a mock client that does nothing
    return null as unknown as ReturnType<typeof createBrowserClient<Database>>;
  }

  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
}
