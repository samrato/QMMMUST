import { getSupabaseServer } from "@/lib/supabase/server"
import { verifyJWT } from "@/lib/utils/jwt"
import { type NextRequest, NextResponse } from "next/server"

/**
 * GET /api/admin/alerts
 *
 * Get all email alerts and notifications
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

    const { data: alerts, error } = await supabase
      .from("alerts")
      .select("*, users(name), devices(device_name, rfid_tag)")
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
    }

    return NextResponse.json({ alerts }, { status: 200 })
  } catch (error) {
    console.error("Get alerts error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
