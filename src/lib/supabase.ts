// Wrapper client to avoid hard failure when environment injection lags.
// Prefers Vite env vars, falls back to the connected Cloud project values.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// Fallbacks (public values) for this project
const FALLBACK_URL = "https://twmbprnbvkqrwpgwxldh.supabase.co";
const FALLBACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3bWJwcm5idmtxcndwZ3d4bGRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjUwMjAsImV4cCI6MjA4MjcwMTAyMH0.p1lpq8ggvgYxwQ0XOyuMbk4PBEz1vB28I2THudUBvvI";

export const supabase = createClient<Database>(
  envUrl || FALLBACK_URL,
  envKey || FALLBACK_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
