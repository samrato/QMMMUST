import { createBrowserClient } from "@supabase/ssr"

let instance: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseClient() {
  if (!instance) {
    instance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    )
  }
  return instance
}
