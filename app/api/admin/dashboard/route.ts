import { getSupabaseServer } from "@/lib/supabase/server"
import { verifyJWT } from "@/lib/utils/jwt"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/admin/dashboard
 *
 * Get dashboard statistics for admin
 *
 * Headers:
 * Authorization: Bearer {token}
 *
 * Response:
 * {
 *   "stats": {
 *     "totalStudents": 150,
 *     "registeredAssets": 280,
 *     "gatePassLogs": 5420,
 *     "suspiciousAttempts": 12
 *   },
 *   "recentMovements": [ ... ],
 *   "recentAlerts": [ ... ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No authorization token provided" }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 })
    }

    const supabase = await getSupabaseServer()

    // Get statistics
    const { count: totalStudents } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")

    const { count: registeredAssets } = await supabase.from("devices").select("*", { count: "exact", head: true })

    const { count: gatePassLogs } = await supabase.from("movements").select("*", { count: "exact", head: true })

    const { count: suspiciousAttempts } = await supabase
      .from("failed_attempts")
      .select("*", { count: "exact", head: true })

    // Get recent movements
    const { data: recentMovements } = await supabase
      .from("movements")
      .select("*, devices(device_name), users(name)")
      .order("created_at", { ascending: false })
      .limit(10)

    // Get recent alerts
    const { data: recentAlerts } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    return NextResponse.json(
      {
        stats: {
          totalStudents,
          registeredAssets,
          gatePassLogs,
          suspiciousAttempts,
        },
        recentMovements,
        recentAlerts,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
