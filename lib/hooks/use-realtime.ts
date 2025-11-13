"use client"

import { useEffect, useRef } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"

/**
 * Hook for subscribing to realtime database changes
 *
 * Usage:
 * const { data, loading } = useRealtime('movements', 'student_id', studentId)
 */
export function useRealtime(table: string, filter: string, value: string | null, onUpdate?: (payload: any) => void) {
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!value) return

    const supabase = getSupabaseClient()

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`${table}:${filter}:${value}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `${filter}=eq.${value}`,
        },
        (payload) => {
          console.log("[Realtime]", payload)
          if (onUpdate) {
            onUpdate(payload)
          }
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [table, filter, value, onUpdate])
}
